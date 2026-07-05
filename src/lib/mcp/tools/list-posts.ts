import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "list_posts",
  title: "List published posts",
  description:
    "List published articles from the Freigeist Kongress site. Returns id, title, subtitle, category, published_at, and reading_time. Filter by category slug or full-text query.",
  inputSchema: {
    query: z.string().optional().describe("Optional search text matched against title/subtitle/content."),
    category_slug: z.string().optional().describe("Optional category slug to filter by."),
    limit: z.number().int().min(1).max(50).default(20).describe("Max results to return (1-50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, category_slug, limit }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    let q = supabase
      .from("posts")
      .select("id, title, subtitle, category_slug, published_at, reading_time, excerpt")
      .eq("status", "published")
      .is("deleted_at", null)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (category_slug) q = q.eq("category_slug", category_slug);
    if (query) q = q.or(`title.ilike.%${query}%,subtitle.ilike.%${query}%,excerpt.ilike.%${query}%`);

    const { data, error } = await q;
    if (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { posts: data ?? [] },
    };
  },
});
