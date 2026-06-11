import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const imageBase =
  Deno.env.get("IMAGE_BASE_URL") ||
  `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/`;

function toAbsoluteImageUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${imageBase}${path}`;
}

function imageMime(url: string): string {
  if (url.endsWith(".webp")) return "image/webp";
  if (url.endsWith(".png")) return "image/png";
  return "image/jpeg";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const brandName = Deno.env.get("BRAND_NAME") || "AVIS Umbrella";
    const brandDescription =
      Deno.env.get("BRAND_DESCRIPTION") || `News & Insights from ${brandName}`;
    const brandLanguage = Deno.env.get("BRAND_LANGUAGE") || "de";
    const origin = Deno.env.get("SITE_URL") || url.searchParams.get("origin") || req.headers.get("origin") || req.headers.get("referer")?.replace(/\/+$/, "") || "https://avis-land-news.lovable.app";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: posts, error } = await supabase
      .from("posts")
      .select("id, title, subtitle, slug, image_url, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(50);

    if (error) throw error;

    const items = (posts || [])
      .map((post) => {
        const link = `${origin}/news/${escapeXml(post.slug)}`;
        const pubDate = post.published_at
          ? new Date(post.published_at).toUTCString()
          : new Date().toUTCString();
        const enclosure = post.image_url
          ? (() => { const abs = toAbsoluteImageUrl(post.image_url); return `<enclosure url="${escapeXml(abs)}" type="${imageMime(abs)}" />`; })()
          : "";

        return `    <item>
      <title>${escapeXml(post.title)}</title>
      <description>${escapeXml(post.subtitle || "")}</description>
      <link>${link}</link>
      ${enclosure}
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">${post.id}</guid>
    </item>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(brandName)} News</title>
    <link>${escapeXml(origin)}</link>
    <description>${escapeXml(brandDescription)}</description>
    <language>${escapeXml(brandLanguage)}</language>
${items}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/rss+xml; charset=utf-8",
      },
    });
  } catch (e) {
    console.error("RSS error:", e);
    return new Response(JSON.stringify({ error: "Feed temporarily unavailable" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
