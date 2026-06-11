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

function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const output: string[] = [];
  let inList = false;
  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      const text = paragraphLines.join(" ").trim();
      if (text) output.push(`<p>${text}</p>`);
      paragraphLines = [];
    }
  };

  const flushList = () => {
    if (inList) {
      output.push("</ul>");
      inList = false;
    }
  };

  const inline = (text: string): string =>
    text
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/_(.+?)_/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>");

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    // Headings
    const h6 = line.match(/^#{6}\s+(.*)/);
    const h5 = line.match(/^#{5}\s+(.*)/);
    const h4 = line.match(/^#{4}\s+(.*)/);
    const h3 = line.match(/^#{3}\s+(.*)/);
    const h2 = line.match(/^#{2}\s+(.*)/);
    // H1 handled by caller (title extraction)
    if (h6 || h5 || h4 || h3 || h2) {
      flushParagraph();
      flushList();
      if (h2) output.push(`<h2>${inline(h2[1])}</h2>`);
      else if (h3) output.push(`<h3>${inline(h3[1])}</h3>`);
      else if (h4) output.push(`<h4>${inline(h4[1])}</h4>`);
      else if (h5) output.push(`<h5>${inline(h5[1])}</h5>`);
      else if (h6) output.push(`<h6>${inline(h6[1])}</h6>`);
      continue;
    }

    // List items
    const listItem = line.match(/^[-*+]\s+(.*)/);
    if (listItem) {
      flushParagraph();
      if (!inList) {
        output.push("<ul>");
        inList = true;
      }
      output.push(`<li>${inline(listItem[1])}</li>`);
      continue;
    }

    // Blank line → flush paragraph and list
    if (line.trim() === "") {
      flushParagraph();
      flushList();
      continue;
    }

    // Regular text → accumulate into paragraph
    flushList();
    paragraphLines.push(inline(line));
  }

  flushParagraph();
  flushList();

  return output.join("\n");
}

interface Article {
  title: string;
  content: string;
}

function splitIntoArticles(md: string): Article[] {
  // Split on H1 headings (lines starting with "# ")
  const sections = md.split(/(?=^# )/m);
  const articles: Article[] = [];

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    const lines = trimmed.split("\n");
    const firstLine = lines[0];
    const h1Match = firstLine.match(/^#\s+(.*)/);

    if (h1Match) {
      const title = h1Match[1].trim();
      const body = lines.slice(1).join("\n").trim();
      if (title) {
        articles.push({ title, content: markdownToHtml(body) });
      }
    }
  }

  return articles;
}

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
    const articles = splitIntoArticles(content);

    console.log("Articles found:", articles.length, articles.map((a) => a.title));

    if (articles.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No articles found. Make sure your Markdown file uses # H1 headings to separate articles.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const created: { id: string; title: string; slug: string }[] = [];
    const errors: { title: string; error: string }[] = [];

    for (const article of articles) {
      try {
        const baseSlug = slugify(article.title);
        const slug = await uniqueSlug(supabase, baseSlug);

        const { data, error } = await supabase
          .from("posts")
          .insert({
            title: article.title,
            slug,
            content: article.content || null,
            status: "draft",
          })
          .select("id, title, slug")
          .single();

        if (error) throw error;
        created.push(data);
      } catch (e: any) {
        errors.push({ title: article.title, error: e.message });
      }
    }

    return new Response(
      JSON.stringify({ created, errors, total: articles.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("Markdown import error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
