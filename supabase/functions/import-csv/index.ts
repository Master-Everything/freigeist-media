import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

async function uniqueSlug(supabase: any, base: string): Promise<string> {
  let slug = base;
  let counter = 0;
  while (true) {
    const { data } = await supabase
      .from("posts")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    counter++;
    slug = `${base}-${counter}`;
  }
}

/**
 * Parse a CSV string into an array of objects keyed by header row.
 * Handles quoted fields (including commas and newlines inside quotes).
 */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        // Escaped quote inside quoted field
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        current.push(field);
        field = "";
      } else if (ch === "\r" && next === "\n") {
        current.push(field);
        field = "";
        rows.push(current);
        current = [];
        i++; // skip \n
      } else if (ch === "\n" || ch === "\r") {
        current.push(field);
        field = "";
        rows.push(current);
        current = [];
      } else {
        field += ch;
      }
    }
  }

  // Push the last field / row
  if (field || current.length > 0) {
    current.push(field);
    rows.push(current);
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim());
  const result: Record<string, string>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    // Skip completely empty rows
    if (row.every((cell) => cell.trim() === "")) continue;
    const obj: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = row[c]?.trim() ?? "";
    }
    result.push(obj);
  }

  return result;
}

const ALLOWED_FIELDS = [
  "title",
  "subtitle",
  "category_slug",
  "content",
  "published_at",
  "reading_time",
] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "editor"])
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const content = await file.text();
    const rows = parseCsv(content);

    console.log("CSV rows found:", rows.length);

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({
          error:
            "No data rows found. Make sure the CSV has a header row and at least one data row.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const created: { id: string; title: string; slug: string }[] = [];
    const errors: { title: string; error: string }[] = [];

    for (const row of rows) {
      const title = row["title"];
      if (!title) {
        errors.push({ title: "(missing title)", error: "Row skipped: title is required" });
        continue;
      }

      try {
        const baseSlug = slugify(title);
        const slug = await uniqueSlug(supabase, baseSlug);

        const insert: Record<string, any> = {
          title,
          slug,
          status: "draft", // always draft — no exceptions
        };

        for (const field of ALLOWED_FIELDS) {
          if (field === "title") continue; // already set
          const val = row[field];
          if (val === undefined || val === "") continue;

          if (field === "reading_time") {
            const parsed = parseInt(val, 10);
            if (!isNaN(parsed)) insert[field] = parsed;
          } else if (field === "category_slug") {
            insert[field] = val.toLowerCase();
          } else {
            insert[field] = val;
          }
        }

        const { data, error: dbError } = await supabase
          .from("posts")
          .insert(insert)
          .select("id, title, slug")
          .single();

        if (dbError) throw dbError;
        created.push(data);
      } catch (e: any) {
        errors.push({ title, error: e.message });
      }
    }

    return new Response(
      JSON.stringify({ created, errors, total: rows.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("CSV import error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
