import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// --- Video URL helpers ---

function getYouTubeId(url: string): string | null {
  const m =
    url.match(/(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/) ||
    url.match(/youtube\.com\/shorts\/([\w-]{11})/);
  return m ? m[1] : null;
}

function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : null;
}

function getEmbedUrl(url: string): string | null {
  const ytId = getYouTubeId(url);
  if (ytId) return `https://www.youtube.com/embed/${ytId}`;
  const vmId = getVimeoId(url);
  if (vmId) return `https://player.vimeo.com/video/${vmId}`;
  return null;
}

function isVideoUrl(url: string): boolean {
  return !!(getYouTubeId(url) || getVimeoId(url));
}

// --- Image URL helpers ---

/** Simple hash for generating unique filenames from URL paths */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Extract a meaningful filename from image URLs, handling GoDaddy/Wix patterns.
 * GoDaddy URLs look like: https://img1.wsimg.com/isteam/ip/UUID/photo.jpg/:/rs=w:1280
 * We walk segments to find one with an image extension instead of blindly taking the last segment.
 */
function extractImageFilename(imgUrl: string): string {
  const urlObj = new URL(imgUrl);
  const segments = urlObj.pathname.split("/").filter(Boolean);

  // Walk segments to find one with an image extension
  for (const seg of segments) {
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(seg)) {
      return seg.toLowerCase().replace(/[^a-z0-9._-]/g, "-").replace(/-+/g, "-");
    }
  }

  // Fallback: hash the full path to create a unique name
  const hash = simpleHash(urlObj.pathname);
  return `imported-${hash}.jpg`;
}

/**
 * Normalize image URL to deduplicate resized variants of the same image.
 * Strips GoDaddy resize suffixes (/:/rs=w:1280) and common query params.
 */
function normalizeImageUrl(url: string): string {
  let normalized = url;
  // Strip GoDaddy resize suffixes like /:/rs=w:1280 or /:/cr=...
  normalized = normalized.replace(/\/:\/(rs|cr|w|h)=[^/]*/gi, "");
  // Strip trailing /: if left over
  normalized = normalized.replace(/\/:$/g, "");
  // Strip common resize query params
  normalized = normalized.replace(/[?&](w|h|width|height|resize|size|quality|q|fit|format)=[^&]*/gi, "");
  // Clean up leading ? or & left over
  normalized = normalized.replace(/\?$/, "").replace(/\?&/, "?");
  return normalized;
}

/** Check if an image URL looks like a tiny icon, logo, or placeholder */
function isIconOrPlaceholder(imgUrl: string): boolean {
  const lower = imgUrl.toLowerCase();
  // Common icon/placeholder patterns
  if (/favicon|icon[_-]?\d|logo|spacer|pixel|blank|transparent|1x1|2x2|loading/i.test(lower)) {
    return true;
  }
  // GoDaddy responsive placeholder segments that aren't real images
  const lastSeg = lower.split("/").pop() || "";
  if (/^rs[=-]/.test(lastSeg) || /^cr[=-]/.test(lastSeg)) {
    return true;
  }
  return false;
}

// --- HTML parsing helpers ---

function extractTitle(html: string, metadata: any): string {
  const blogHeading = html.match(/<h3[^>]*data-ux=["']BlogMainHeading["'][^>]*>(.*?)<\/h3>/is);
  if (blogHeading) return blogHeading[1].replace(/<[^>]+>/g, "").trim();
  const h1 = html.match(/<h1[^>]*>(.*?)<\/h1>/is);
  if (h1) return h1[1].replace(/<[^>]+>/g, "").trim();
  return metadata.title || "Untitled";
}

function extractBodyContent(html: string): string {
  const blogContentMatch = html.match(/data-ux=["']BlogContent["'][^>]*>([\s\S]*)/i);
  if (blogContentMatch) {
    let depth = 1;
    let i = 0;
    const s = blogContentMatch[1];
    while (i < s.length && depth > 0) {
      if (s.substring(i).match(/^<div[\s>]/i)) depth++;
      if (s.substring(i).match(/^<\/div>/i)) { depth--; if (depth === 0) break; }
      i++;
    }
    return s.substring(0, i);
  }
  return html;
}

function truncateAtRecentPosts(html: string): string {
  const idx = html.search(/Recent\s+Posts/i);
  if (idx > 0) return html.substring(0, idx);
  return html;
}

function cleanHtml(html: string): string {
  let s = html;
  s = s.replace(/<script[\s\S]*?<\/script>/gi, "");
  s = s.replace(/<style[\s\S]*?<\/style>/gi, "");

  // Preserve video-embed divs before stripping all divs
  const videoEmbedPlaceholders: string[] = [];
  s = s.replace(/<div\s+class=["']video-embed["'][^>]*>[\s\S]*?<\/div>/gi, (match) => {
    videoEmbedPlaceholders.push(match);
    return `__VIDEO_EMBED_${videoEmbedPlaceholders.length - 1}__`;
  });

  s = s.replace(/<div[^>]*>/gi, "");
  s = s.replace(/<\/div>/gi, "");

  s = s.replace(/<((?:img|a|figure|figcaption|p|span|strong|em|b|i|h[2-6]|ul|ol|li|br|video|source|iframe)[^>]*)>/gi, (_match, inner) => {
    const tag = inner.match(/^(\S+)/)?.[1] || "";
    const src = inner.match(/\bsrc=["']([^"']+)["']/i);
    const href = inner.match(/\bhref=["']([^"']+)["']/i);
    const alt = inner.match(/\balt=["']([^"']*?)["']/i);
    const type = inner.match(/\btype=["']([^"']+)["']/i);
    const cls = inner.match(/\bclass=["']([^"']+)["']/i);
    let attrs = "";
    if (src && isSafeUrl(src[1])) attrs += ` src="${src[1]}"`;
    if (href && isSafeUrl(href[1])) attrs += ` href="${href[1]}"`;
    if (alt) attrs += ` alt="${alt[1]}"`;
    if (type) attrs += ` type="${type[1]}"`;
    if (cls && tag.toLowerCase() === "div") attrs += ` class="${cls[1]}"`;
    return `<${tag}${attrs}>`;
  });

  const allowed = new Set(["p","figure","figcaption","img","strong","em","b","i","a","span","h2","h3","h4","h5","h6","ul","ol","li","br","video","source","iframe"]);
  s = s.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*\/?>/gi, (match, tag) => {
    return allowed.has(tag.toLowerCase()) ? match : "";
  });

  for (let i = 0; i < videoEmbedPlaceholders.length; i++) {
    s = s.replace(`__VIDEO_EMBED_${i}__`, videoEmbedPlaceholders[i]);
  }

  s = s.replace(/\n{3,}/g, "\n\n").trim();
  return s;
}

/** Allow only http(s), mailto, tel, and relative URLs. Block javascript:, data:, file:, etc. */
function isSafeUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  if (!trimmed) return false;
  if (trimmed.startsWith("javascript:") || trimmed.startsWith("data:") || trimmed.startsWith("vbscript:") || trimmed.startsWith("file:")) return false;
  return true;
}

/** Block SSRF: only allow http(s) to public hosts. */
function isSafeFetchUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    const host = parsed.hostname.toLowerCase();
    if (host === "localhost" || host === "0.0.0.0" || host.endsWith(".localhost")) return false;
    // Block IPv4 private/loopback/link-local ranges
    if (/^127\./.test(host)) return false;
    if (/^10\./.test(host)) return false;
    if (/^192\.168\./.test(host)) return false;
    if (/^169\.254\./.test(host)) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return false;
    // Block IPv6 loopback/link-local/unique-local
    if (host === "::1" || host.startsWith("[::1") || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80")) return false;
    return true;
  } catch {
    return false;
  }
}

/** Convert <a> tags linking to YouTube/Vimeo into video-embed divs, and wrap bare iframes */
function convertVideoLinks(html: string): { html: string; firstVideoUrl: string | null } {
  let firstVideoUrl: string | null = null;

  let result = html.replace(/<p[^>]*>\s*<a[^>]+href=["']([^"']+)["'][^>]*>[\s\S]*?<\/a>\s*<\/p>/gi, (_match, href) => {
    const embedUrl = getEmbedUrl(href);
    if (embedUrl) {
      if (!firstVideoUrl) firstVideoUrl = href;
      return `<div class="video-embed"><iframe src="${embedUrl}" frameborder="0" allowfullscreen="true"></iframe></div>`;
    }
    return _match;
  });

  result = result.replace(/<a[^>]+href=["']([^"']+)["'][^>]*>[\s\S]*?<\/a>/gi, (_match, href) => {
    if (!isVideoUrl(href)) return _match;
    const embedUrl = getEmbedUrl(href);
    if (embedUrl) {
      if (!firstVideoUrl) firstVideoUrl = href;
      return `<div class="video-embed"><iframe src="${embedUrl}" frameborder="0" allowfullscreen="true"></iframe></div>`;
    }
    return _match;
  });

  result = result.replace(/<iframe[^>]+src=["']([^"']+)["'][^>]*>[\s\S]*?<\/iframe>/gi, (match, src) => {
    if (isVideoUrl(src) || getEmbedUrl(src)) {
      const embedUrl = getEmbedUrl(src) || src;
      if (!firstVideoUrl) firstVideoUrl = src;
      return `<div class="video-embed"><iframe src="${embedUrl}" frameborder="0" allowfullscreen="true"></iframe></div>`;
    }
    return match;
  });

  return { html: result, firstVideoUrl };
}

/**
 * Extract featured image — skip icons/logos/placeholders, prefer first substantial image.
 */
function extractFeaturedImage(html: string): { imageUrl: string | null; html: string } {
  // Collect all image sources
  const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
  
  for (const match of imgMatches) {
    const src = match[1];
    if (isIconOrPlaceholder(src)) continue;
    // Use this as featured image and remove from body
    return { imageUrl: src, html: html.replace(match[0], "") };
  }

  // Also check figures
  const figMatch = html.match(/<figure[^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["'][\s\S]*?<\/figure>/i);
  if (figMatch && !isIconOrPlaceholder(figMatch[1])) {
    return { imageUrl: figMatch[1], html: html.replace(figMatch[0], "") };
  }

  return { imageUrl: null, html };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ error: "Firecrawl connector not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: hasRole } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!hasRole) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { urls } = await req.json();
    if (!Array.isArray(urls) || urls.length === 0) {
      return new Response(
        JSON.stringify({ error: "Provide an array of URLs" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: existingPosts } = await supabase.from("posts").select("slug");
    const existingSlugs = new Set((existingPosts || []).map((p: any) => p.slug));

    const { data: existingFiles } = await supabase.storage.from("post-images").list("", { limit: 1000 });
    const existingImageNames = new Set(
      (existingFiles || []).filter((f: any) => !f.name.startsWith(".")).map((f: any) => f.name)
    );

    const created: any[] = [];
    const errors: any[] = [];

    for (const url of urls) {
      try {
        console.log(`Scraping: ${url}`);

        const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${firecrawlKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: url.trim(),
            formats: ["html"],
            onlyMainContent: false,
            waitFor: 3000,
          }),
        });

        const scrapeData = await scrapeRes.json();
        if (!scrapeRes.ok || !scrapeData.success) {
          errors.push({ url, error: scrapeData.error || `Scrape failed (${scrapeRes.status})` });
          continue;
        }

        const html = scrapeData.data?.html || scrapeData.html || "";
        const metadata = scrapeData.data?.metadata || scrapeData.metadata || {};

        const title = extractTitle(html, metadata);

        const urlPath = new URL(url.trim()).pathname;
        let slug = urlPath.split("/").filter(Boolean).pop() || "untitled";
        slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");

        let finalSlug = slug;
        let counter = 2;
        while (existingSlugs.has(finalSlug)) {
          finalSlug = `${slug}-${counter}`;
          counter++;
        }
        existingSlugs.add(finalSlug);

        const dateMatch = html.match(
          /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i
        );
        let publishedAt: string | null = null;
        if (dateMatch) {
          const parsed = new Date(`${dateMatch[2]} ${dateMatch[1]}, ${dateMatch[3]}`);
          if (!isNaN(parsed.getTime())) publishedAt = parsed.toISOString();
        }

        let bodyHtml = extractBodyContent(html);
        bodyHtml = truncateAtRecentPosts(bodyHtml);
        bodyHtml = cleanHtml(bodyHtml);

        const { html: bodyWithVideos, firstVideoUrl } = convertVideoLinks(bodyHtml);
        bodyHtml = bodyWithVideos;

        const { imageUrl: featuredImageSrc, html: bodyWithoutFeatured } = extractFeaturedImage(bodyHtml);
        bodyHtml = bodyWithoutFeatured;

        // Collect image URLs, normalize to deduplicate resized variants
        const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
        let match;
        const normalizedMap = new Map<string, string>(); // normalized -> original
        
        if (featuredImageSrc) {
          const norm = normalizeImageUrl(featuredImageSrc);
          normalizedMap.set(norm, featuredImageSrc);
        }
        
        while ((match = imgRegex.exec(bodyHtml)) !== null) {
          const origUrl = match[1];
          if (isIconOrPlaceholder(origUrl)) continue;
          const norm = normalizeImageUrl(origUrl);
          if (!normalizedMap.has(norm)) {
            normalizedMap.set(norm, origUrl);
          }
        }

        // Process unique images
        const urlMap = new Map<string, string>(); // original src -> public URL

        for (const [_norm, imgUrl] of normalizedMap) {
          if (urlMap.has(imgUrl)) continue;
          try {
            const fileName = extractImageFilename(imgUrl);
            const dotIdx = fileName.lastIndexOf(".");
            const baseName = dotIdx > 0 ? fileName.substring(0, dotIdx) : fileName;
            const ext = dotIdx > 0 ? fileName.substring(dotIdx) : ".jpg";
            const webpName = `${baseName}.webp`;

            if (existingImageNames.has(fileName)) {
              console.log(`Reusing existing image: ${fileName}`);
              const relPath = `post-images/${fileName}`;
              urlMap.set(imgUrl, relPath);
              continue;
            }

            if (existingImageNames.has(webpName)) {
              console.log(`Reusing existing WebP variant: ${webpName}`);
              const relPath = `post-images/${webpName}`;
              urlMap.set(imgUrl, relPath);
              continue;
            }

            // Fetch and upload — block SSRF to internal hosts
            if (!isSafeFetchUrl(imgUrl)) {
              console.warn(`Skipping unsafe image URL: ${imgUrl}`);
              continue;
            }
            const imgRes = await fetch(imgUrl, {
              signal: AbortSignal.timeout(10000),
              redirect: "follow",
            });
            if (!imgRes.ok) continue;

            const contentType = imgRes.headers.get("content-type") || "image/jpeg";
            const imgBuffer = await imgRes.arrayBuffer();

            let finalName = fileName;
            let fc = 2;
            while (existingImageNames.has(finalName)) {
              finalName = `${baseName}-${fc}${ext}`;
              fc++;
            }
            existingImageNames.add(finalName);

            const { error: uploadError } = await supabase.storage
              .from("post-images")
              .upload(finalName, imgBuffer, { contentType, upsert: false });

            if (!uploadError) {
              console.log(`Uploaded: ${finalName}`);
              const relPath = `post-images/${finalName}`;
              urlMap.set(imgUrl, relPath);
            } else {
              console.warn(`Upload failed for ${finalName}: ${uploadError.message}`);
            }
          } catch (imgErr) {
            console.warn(`Failed to process image ${imgUrl}:`, imgErr);
          }
        }

        // Replace all image URLs in body (including variants that normalized to the same image)
        for (const [_norm, origUrl] of normalizedMap) {
          const publicUrl = urlMap.get(origUrl);
          if (publicUrl) {
            // Replace all variants of this normalized URL in the body
            bodyHtml = bodyHtml.split(origUrl).join(publicUrl);
          }
        }
        // Also replace any remaining src attributes that match normalized variants
        bodyHtml = bodyHtml.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, (fullMatch, src) => {
          const norm = normalizeImageUrl(src);
          for (const [mappedNorm, origUrl] of normalizedMap) {
            if (norm === mappedNorm) {
              const publicUrl = urlMap.get(origUrl);
              if (publicUrl && src !== publicUrl) {
                return fullMatch.replace(src, publicUrl);
              }
            }
          }
          return fullMatch;
        });

        let featuredImageUrl: string | null = null;
        if (featuredImageSrc) {
          featuredImageUrl = urlMap.get(featuredImageSrc) || featuredImageSrc;
        }

        const textContent = bodyHtml.replace(/<[^>]+>/g, " ").trim();
        const wordCount = textContent.split(/\s+/).length;
        const readingTime = Math.max(1, Math.ceil(wordCount / 200));

        const { data: insertedPost, error: insertError } = await supabase
          .from("posts")
          .insert({
            title,
            slug: finalSlug,
            content: bodyHtml,
            status: "draft",
            published_at: publishedAt,
            reading_time: readingTime,
            image_url: featuredImageUrl,
            video_url: firstVideoUrl ? firstVideoUrl : null,
          })
          .select("id, title, slug")
          .single();

        if (insertError) {
          errors.push({ url, title, error: insertError.message });
        } else {
          created.push(insertedPost);
        }
      } catch (err: any) {
        errors.push({ url, error: err.message });
      }
    }

    return new Response(
      JSON.stringify({ created, errors, total: urls.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Import error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
