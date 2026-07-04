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
  const sizeBefore = html.length;
  let s = html;
  s = s.replace(/<script[\s\S]*?<\/script>/gi, "");
  s = s.replace(/<style[\s\S]*?<\/style>/gi, "");

  // Remove Elementor divider widgets entirely (nested wrappers + inner <hr>/<svg>)
  const dividerWidgetMatches = s.match(/<div[^>]*class=["'][^"']*elementor-widget-divider[^"']*["']/gi)?.length ?? 0;
  s = s.replace(
    /<div[^>]*class=["'][^"']*elementor-widget-divider[^"']*["'][^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi,
    ""
  );
  const dividerInnerMatches = s.match(/<div[^>]*class=["'][^"']*elementor-divider[^"']*["']/gi)?.length ?? 0;
  s = s.replace(
    /<div[^>]*class=["'][^"']*elementor-divider[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,
    ""
  );
  console.log(`[import-website] cleanHtml: dividers removed widget=${dividerWidgetMatches} inner=${dividerInnerMatches}`);


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
  console.log(`[import-website] cleanHtml: size ${sizeBefore} -> ${s.length}`);
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

// ============================================================
// Freigeist (WordPress + Elementor) extractor
// ============================================================

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

/** Extract the innerHTML of the first widget matching the given widget_type. */
function extractWidgetInner(html: string, widgetType: string): string | null {
  const re = new RegExp(
    `<div[^>]+data-widget_type=["']${widgetType}["'][^>]*>([\\s\\S]*?)<div class=["']elementor-widget-container["']>([\\s\\S]*?)<\\/div>\\s*<\\/div>`,
    "i",
  );
  const m = html.match(re);
  return m ? m[2] : null;
}

function extractFreigeistTitle(html: string, metadata: any): string {
  // First elementor h1 outside the post-content (the page header title)
  const h1 = html.match(/<h1[^>]*class=["'][^"']*elementor-heading-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return decodeHtmlEntities(stripTags(h1[1]));
  return metadata?.title || metadata?.ogTitle || "Untitled";
}

function normalizeFreigeistExcerptText(value: string): string | null {
  const text = decodeHtmlEntities(stripTags(value))
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return null;
  if (text.length < 12 || text.length > 320) return null;
  if (/^\d{1,2}\.\d{1,2}\.\d{4}\b/.test(text)) return null;
  if (/^(von|by|autor|author)\b/i.test(text)) return null;
  if (/^(die\s+zusammenfassung|zusammenfassung|inhalt|share|teilen)\b/i.test(text)) return null;
  return text;
}

function extractMetaContent(html: string, key: string): string | null {
  const head = extractHead(html) || html;
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const byName = new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']+)["']`, "i");
  const byNameReverse = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${escaped}["']`, "i");
  const byProperty = new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']+)["']`, "i");
  const byPropertyReverse = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escaped}["']`, "i");
  const m = head.match(byName) || head.match(byNameReverse) || head.match(byProperty) || head.match(byPropertyReverse);
  return m ? decodeHtmlEntities(m[1]).replace(/\s+/g, " ").trim() : null;
}

function extractFreigeistExcerptBelowHeadline(html: string): string | null {
  const h1 = html.match(/<h1[^>]*class=["'][^"']*elementor-heading-title[^"']*["'][^>]*>[\s\S]*?<\/h1>/i)
    || html.match(/<h1[^>]*>[\s\S]*?<\/h1>/i);
  if (!h1 || h1.index === undefined) return null;

  const afterH1 = html.slice(h1.index + h1[0].length, h1.index + h1[0].length + 18000);
  const beforeBody = afterH1.split(/data-widget_type=["']theme-post-content\.default["']/i)[0] || afterH1;
  const widgetRe = /<div[^>]+(?:data-widget_type=["']([^"']+)["']|class=["']([^"']*elementor-widget[^"']*)["'])[^>]*>([\s\S]*?)(?=<div[^>]+(?:data-widget_type=["'][^"']+["']|class=["'][^"']*elementor-widget[^"']*["'])|data-widget_type=["']theme-post-content\.default["']|<\/body>)/gi;
  let m: RegExpExecArray | null;

  while ((m = widgetRe.exec(beforeBody)) !== null) {
    const widgetType = (m[1] || "").toLowerCase();
    const classes = (m[2] || "").toLowerCase();

    if (/post-info|theme-post-title|share|nav|breadcrumb|image|video|button|icon-list/.test(`${widgetType} ${classes}`)) {
      continue;
    }

    const container = m[3].match(/<div[^>]+class=["'][^"']*elementor-widget-container[^"']*["'][^>]*>([\s\S]*)/i)?.[1] || m[3];
    const paragraph = container.match(/<(?:p|div|span)[^>]*>([\s\S]*?)<\/(?:p|div|span)>/i)?.[1] || container;
    const text = normalizeFreigeistExcerptText(paragraph);
    if (text) return text;
  }

  const firstTextBlock = beforeBody.match(/<(?:p|div|span)[^>]*>([^<>]{20,420})<\/(?:p|div|span)>/i);
  return firstTextBlock ? normalizeFreigeistExcerptText(firstTextBlock[1]) : null;
}

function extractFreigeistExcerpt(html: string): string | null {
  const headlineSubtitle = extractFreigeistExcerptBelowHeadline(html);
  if (headlineSubtitle) return headlineSubtitle;

  const inner = extractWidgetInner(html, "theme-post-excerpt.default");
  const widgetText = inner ? normalizeFreigeistExcerptText(inner) : null;
  if (widgetText) return widgetText;

  const classMatch = html.match(/<div[^>]+class=["'][^"']*elementor-widget-theme-post-excerpt[^"']*["'][^>]*>[\s\S]*?<div[^>]+class=["'][^"']*elementor-widget-container[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  const classText = classMatch ? normalizeFreigeistExcerptText(classMatch[1]) : null;
  if (classText) return classText;

  return normalizeFreigeistExcerptText(extractMetaContent(html, "description") || extractMetaContent(html, "og:description") || "");
}

function extractFreigeistDate(html: string): string | null {
  // Look inside post-info widget for dd.mm.yyyy
  const block = html.match(/data-widget_type=["']post-info\.default["'][\s\S]*?<\/ul>/i);
  const haystack = block ? block[0] : html;
  const m = haystack.match(/\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/);
  if (!m) return null;
  const [_, dd, mm, yyyy] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), 12, 0, 0);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/** Find first elementor-widget-video, parse data-settings JSON, return video url + overlay image, and HTML with the widget removed. */
function extractFreigeistVideo(html: string): { videoUrl: string | null; overlayImage: string | null; html: string } {
  const widgetRe = /<div[^>]+data-widget_type=["']video\.default["'][^>]*data-settings=["']([^"']+)["'][^>]*>[\s\S]*?<\/div>\s*<\/div>/i;
  const m = html.match(widgetRe);
  if (!m) return { videoUrl: null, overlayImage: null, html };
  let settings: any = {};
  try {
    settings = JSON.parse(decodeHtmlEntities(m[1]));
  } catch {
    // ignore
  }
  const videoUrl: string | null =
    settings?.youtube_url || settings?.vimeo_url || settings?.dailymotion_url || null;
  const overlayImage: string | null = settings?.image_overlay?.url || null;
  return { videoUrl, overlayImage, html: html.replace(m[0], "") };
}

/** Locate <head> content from raw HTML. */
function extractHead(html: string): string {
  const m = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  return m ? m[1] : "";
}

function extractOgImage(html: string): string | null {
  const head = extractHead(html) || html;
  const og = head.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || head.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (og) return og[1];
  const linkSrc = head.match(/<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i);
  if (linkSrc) return linkSrc[1];
  return null;
}

/** Isolate post-content widget HTML (balanced div). */
function extractFreigeistPostContentScope(html: string): string {
  const startRe = /<div[^>]+data-widget_type=["']theme-post-content\.default["'][^>]*>/i;
  const start = html.match(startRe);
  if (!start || start.index === undefined) return "";
  const startIdx = start.index + start[0].length;
  // Walk balanced divs
  let depth = 1;
  let i = startIdx;
  const tagRe = /<\/?div[\s>]/gi;
  tagRe.lastIndex = i;
  let mt: RegExpExecArray | null;
  while ((mt = tagRe.exec(html)) !== null) {
    if (mt[0].startsWith("</")) {
      depth--;
      if (depth === 0) {
        return html.substring(startIdx, mt.index);
      }
    } else {
      depth++;
    }
    i = tagRe.lastIndex;
  }
  return html.substring(startIdx);
}

/** Fetch WordPress featured media via REST API (post-thumbnail field). */
async function fetchWordPressFeaturedImage(pageUrl: string): Promise<string | null> {
  try {
    const u = new URL(pageUrl);
    const slug = u.pathname.split("/").filter(Boolean).pop();
    if (!slug) return null;
    const base = `${u.protocol}//${u.host}`;
    if (!isSafeFetchUrl(base)) return null;
    const listUrl = `${base}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1`;
    const res = await fetch(listUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) { await res.text(); return null; }
    const arr = await res.json();
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const post = arr[0];
    const embedded = post?._embedded?.["wp:featuredmedia"];
    if (Array.isArray(embedded) && embedded[0]?.source_url) {
      return embedded[0].source_url as string;
    }
    const mediaId = post?.featured_media;
    if (!mediaId) return null;
    const mediaUrl = `${base}/wp-json/wp/v2/media/${mediaId}`;
    const mRes = await fetch(mediaUrl, { signal: AbortSignal.timeout(10000) });
    if (!mRes.ok) { await mRes.text(); return null; }
    const m = await mRes.json();
    return m?.source_url ?? null;
  } catch (e) {
    console.warn(`[import-website] fetchWordPressFeaturedImage failed: ${(e as Error).message}`);
    return null;
  }
}

/** Choose featured image strictly from WordPress post-thumbnail. REST first, HTML class fallback. No heuristics. */
async function extractFreigeistFeaturedImage(
  pageUrl: string,
  html: string,
  bodyHtml: string,
): Promise<{ imageUrl: string | null; bodyHtml: string; source: "wp-rest" | "post-thumbnail" | "none" }> {
  // 1. WordPress REST API
  const restUrl = await fetchWordPressFeaturedImage(pageUrl);
  if (restUrl) {
    // If the same image is inline in the body, strip it to avoid duplication
    const inline = bodyHtml.match(new RegExp(`<img[^>]+src=["']${restUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`, "i"));
    const newBody = inline ? bodyHtml.replace(inline[0], "") : bodyHtml;
    return { imageUrl: restUrl, bodyHtml: newBody, source: "wp-rest" };
  }

  // 2. HTML fallback: post-thumbnail class names
  const classRe = /<img[^>]+class=["'][^"']*(?:wp-post-image|attachment-post-thumbnail|size-post-thumbnail)[^"']*["'][^>]*>/i;
  const wpPost = bodyHtml.match(classRe) || html.match(classRe);
  if (wpPost) {
    const src = wpPost[0].match(/\bsrc=["']([^"']+)["']/i);
    if (src && !isIconOrPlaceholder(src[1])) {
      const newBody = bodyHtml.includes(wpPost[0]) ? bodyHtml.replace(wpPost[0], "") : bodyHtml;
      return { imageUrl: src[1], bodyHtml: newBody, source: "post-thumbnail" };
    }
  }
  return { imageUrl: null, bodyHtml, source: "none" };
}



/** Render Elementor post-content scope into clean HTML. */
function renderFreigeistBody(scope: string): string {
  if (!scope) return "";

  let out = scope;

  // 0a. Speaker profile: image widget + text-editor widget whose FIRST heading
  // contains ONLY the speaker name (short, no punctuation/digits, max 6 words).
  const speakerPlaceholders: string[] = [];
  const imageWidgetRe = /<div[^>]+data-widget_type=["']image\.default["'][^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'][^>]*)?[\s\S]*?<\/div>\s*<\/div>/i;
  const pairRe = new RegExp(
    imageWidgetRe.source +
      /\s*(?:<div[^>]*>\s*)*<div[^>]+data-widget_type=["']text-editor\.default["'][^>]*>\s*<div class=["']elementor-widget-container["']>\s*(<h[1-3][^>]*>[\s\S]*?<\/h[1-3]>[\s\S]*?)<\/div>\s*<\/div>/i.source,
    "gi",
  );
  const isSpeakerNameHeading = (headingHtml: string): boolean => {
    const text = decodeHtmlEntities(stripTags(headingHtml)).trim();
    if (!text) return false;
    if (text.length > 60) return false;
    if (/[.,:;!?()\[\]0-9]/.test(text)) return false;
    if (text.split(/\s+/).length > 6) return false;
    return true;
  };
  let speakerPairCount = 0;
  out = out.replace(pairRe, (match, src, alt, textInner) => {
    const firstHeading = textInner.match(/<h[1-3][^>]*>[\s\S]*?<\/h[1-3]>/i);
    if (!firstHeading || !isSpeakerNameHeading(firstHeading[0])) {
      return match; // leave as-is, will be rendered by regular widget rules
    }
    const cleanAlt = (alt || "").replace(/"/g, "&quot;");
    let bio = textInner.replace(/<div[^>]*>/gi, "").replace(/<\/div>/gi, "");
    bio = bio.replace(/<span[^>]*>/gi, "").replace(/<\/span>/gi, "");
    const html = `<aside class="speaker-profile"><figure class="speaker-photo"><img src="${src}" alt="${cleanAlt}"></figure><div class="speaker-bio">${bio}</div></aside>`;
    speakerPlaceholders.push(html);
    speakerPairCount++;
    return `@@SPEAKER_${speakerPlaceholders.length - 1}@@`;
  });
  console.log(`[import-website] renderFreigeistBody: speakerPairs=${speakerPairCount}`);


  // 0b. Nested accordion (Elementor renders native <details>/<summary>). Wrap items in accordion container.
  const accordionPlaceholders: string[] = [];
  // Find contiguous runs of details siblings
  out = out.replace(
    /(?:<details[^>]*>\s*<summary[^>]*>[\s\S]*?<\/summary>[\s\S]*?<\/details>\s*)+/gi,
    (run) => {
      const items: string[] = [];
      run.replace(
        /<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi,
        (_m, title, inner) => {
          const t = decodeHtmlEntities(stripTags(title)).trim();
          // Clean inner: strip elementor divs, keep paragraphs
          let body = inner.replace(/<div[^>]*>/gi, "").replace(/<\/div>/gi, "");
          body = body.replace(/<span[^>]*>/gi, "").replace(/<\/span>/gi, "");
          body = body.trim();
          if (!/<p[\s>]/i.test(body) && body) {
            body = `<p>${body}</p>`;
          }
          items.push(
            `<details class="freigeist-accordion-item"><summary>${t}</summary><div class="freigeist-accordion-body">${body}</div></details>`,
          );
          return "";
        },
      );
      const html = `<div class="freigeist-accordion">${items.join("")}</div>`;
      accordionPlaceholders.push(html);
      return `@@ACCORDION_${accordionPlaceholders.length - 1}@@`;
    },
  );

  // 1. Headings
  out = out.replace(
    /<div[^>]+data-widget_type=["']heading\.default["'][^>]*>[\s\S]*?(<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>)[\s\S]*?<\/div>\s*<\/div>/gi,
    (_m, heading) => {
      const text = decodeHtmlEntities(stripTags(heading));
      if (!text) return "";
      return `<h2>${text}</h2>`;
    },
  );

  // 2. Text editor: keep inner
  out = out.replace(
    /<div[^>]+data-widget_type=["']text-editor\.default["'][^>]*>\s*<div class=["']elementor-widget-container["']>([\s\S]*?)<\/div>\s*<\/div>/gi,
    (_m, inner) => inner,
  );

  // 3. Image widget
  out = out.replace(
    /<div[^>]+data-widget_type=["']image\.default["'][^>]*>[\s\S]*?(<a[^>]*>\s*<img[^>]+>\s*<\/a>|<img[^>]+>)[\s\S]*?<\/div>\s*<\/div>/gi,
    (_m, mediaTag) => {
      const srcMatch = mediaTag.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
      if (!srcMatch) return "";
      const altMatch = mediaTag.match(/<img[^>]+alt=["']([^"']*)["']/i);
      const alt = altMatch ? altMatch[1] : "";
      const linkMatch = mediaTag.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/i);
      const img = `<img src="${srcMatch[1]}" alt="${alt}">`;
      if (linkMatch && isSafeUrl(linkMatch[1])) {
        return `<figure><a href="${linkMatch[1]}" target="_blank" rel="noopener">${img}</a></figure>`;
      }
      return `<figure>${img}</figure>`;
    },
  );

  // 4. Button widget — CTA style only if label contains sparkle icons
  const SPARKLE_RE = /[\u2728\u2B50]|\uD83C\uDF1F/g; // ✨ ⭐ 🌟
  const renderLink = (href: string, rawText: string): string => {
    const safe = isSafeUrl(href) ? href : "#";
    const decoded = decodeHtmlEntities(stripTags(rawText));
    const hasSparkle = SPARKLE_RE.test(decoded);
    SPARKLE_RE.lastIndex = 0;
    if (hasSparkle) {
      const clean = decoded.replace(/\s+/g, " ").trim() || "Jetzt entdecken";
      return `<p><a class="freigeist-cta" href="${safe}" target="_blank" rel="noopener">${clean}</a></p>`;
    }
    return `<p><a href="${safe}" target="_blank" rel="noopener">${decoded}</a></p>`;
  };
  out = out.replace(
    /<div[^>]+data-widget_type=["']button\.default["'][^>]*>[\s\S]*?<a[^>]+href=["']([^"']+)["'][^>]*>[\s\S]*?<span class=["']elementor-button-text["']>([\s\S]*?)<\/span>[\s\S]*?<\/a>[\s\S]*?<\/div>\s*<\/div>/gi,
    (_m, href, text) => renderLink(href, text),
  );
  // Sparkle-wrapped plain <a> links → CTA (leave non-sparkle links untouched)
  out = out.replace(
    /<a\b([^>]*?)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi,
    (match, _pre, href, _post, inner) => {
      const decoded = decodeHtmlEntities(stripTags(inner));
      if (!SPARKLE_RE.test(decoded)) { SPARKLE_RE.lastIndex = 0; return match; }
      SPARKLE_RE.lastIndex = 0;
      const safe = isSafeUrl(href) ? href : "#";
      const clean = decoded.replace(/\s+/g, " ").trim() || "Jetzt entdecken";
      return `<a class="freigeist-cta" href="${safe}" target="_blank" rel="noopener">${clean}</a>`;
    },
  );

  // 5. Divider widgets — remove entirely (no <hr>)
  const dividerWidgetCount = (out.match(/data-widget_type=["']divider\.default["']/gi) || []).length;
  out = out.replace(
    /<div[^>]+data-widget_type=["']divider\.default["'][^>]*>[\s\S]*?<\/div>\s*<\/div>/gi,
    "",
  );
  // Also drop any elementor-widget-divider wrappers that don't carry data-widget_type
  const dividerClassCount = (out.match(/class=["'][^"']*elementor-(?:widget-)?divider[^"']*["']/gi) || []).length;
  out = out.replace(
    /<div[^>]*class=["'][^"']*elementor-widget-divider[^"']*["'][^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi,
    "",
  );
  out = out.replace(
    /<div[^>]*class=["'][^"']*elementor-divider[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,
    "",
  );
  // And any stray <hr> left behind
  out = out.replace(/<hr\s*\/?>/gi, "");
  console.log(`[import-website] renderFreigeistBody: dividersRemoved widget=${dividerWidgetCount} class=${dividerClassCount}`);

  // 5b. Drop any embedded form blocks (feedback form etc.) before whitelist
  const formCount = (out.match(/<form\b/gi) || []).length;
  out = out.replace(/<form[\s\S]*?<\/form>/gi, "");
  // Also strip stray form-control tags so their labels/placeholders don't leak as text
  out = out.replace(/<(input|textarea|button|select|option|label|fieldset|legend)\b[\s\S]*?(?:\/>|<\/\1>)/gi, "");
  if (formCount) console.log(`[import-website] renderFreigeistBody: formsRemoved=${formCount}`);

  // 6. Strip leftover Elementor wrappers
  out = out.replace(/<div[^>]*>/gi, "");
  out = out.replace(/<\/div>/gi, "");
  out = out.replace(/<span[^>]*>/gi, "");
  out = out.replace(/<\/span>/gi, "");

  // 7. Strip svg/script/style
  out = out.replace(/<svg[\s\S]*?<\/svg>/gi, "");
  out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<style[\s\S]*?<\/style>/gi, "");

  // 8. Whitelist final tags (include details/summary/aside for accordion + speaker)
  const allowed = new Set([
    "p","figure","figcaption","img","strong","em","b","i","a","h1","h2","h3","h4","h5","h6",
    "ul","ol","li","br","hr","blockquote","iframe","video","source",
    "details","summary","aside","div",
  ]);
  out = out.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*\/?>/gi, (match, tag) => {
    return allowed.has(tag.toLowerCase()) ? match : "";
  });

  // 9. Restore placeholders
  out = out.replace(/@@SPEAKER_(\d+)@@/g, (_m, i) => speakerPlaceholders[Number(i)] || "");
  out = out.replace(/@@ACCORDION_(\d+)@@/g, (_m, i) => accordionPlaceholders[Number(i)] || "");

  // 10. Collapse whitespace
  out = out.replace(/\n{3,}/g, "\n\n");
  out = out.replace(/\s+\n/g, "\n").trim();

  return out;
}

async function extractFreigeistArticle(pageUrl: string, html: string, metadata: any): Promise<{
  title: string;
  publishedAt: string | null;
  excerpt: string | null;
  bodyHtml: string;
  featuredImageSrc: string | null;
  firstVideoUrl: string | null;
}> {
  const title = extractFreigeistTitle(html, metadata);
  const excerpt = extractFreigeistExcerpt(html);
  const publishedAt = extractFreigeistDate(html);

  // Pull video info first, then strip its widget so it's not parsed as body.
  const { videoUrl, html: htmlNoVideo } = extractFreigeistVideo(html);

  const scope = extractFreigeistPostContentScope(htmlNoVideo);
  let bodyHtml = renderFreigeistBody(scope);

  // Convert any embed-style video links left in the body
  const { html: bodyWithVideos, firstVideoUrl: bodyVideoUrl } = convertVideoLinks(bodyHtml);
  bodyHtml = bodyWithVideos;

  // Featured image via WordPress post-thumbnail (REST first, HTML fallback)
  const { imageUrl: featuredImageSrc, bodyHtml: bodyClean, source: featuredSource } =
    await extractFreigeistFeaturedImage(pageUrl, htmlNoVideo, bodyHtml);
  bodyHtml = bodyClean;
  console.log(`[import-website] extractFreigeistArticle: featuredSource=${featuredSource} featured=${featuredImageSrc ? "yes" : "no"}`);

  return {
    title,
    publishedAt,
    excerpt,
    bodyHtml,
    featuredImageSrc,
    firstVideoUrl: videoUrl || bodyVideoUrl,
  };
}


function isFreigeistUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "freigeist.media" || host.endsWith(".freigeist.media");
  } catch {
    return false;
  }
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
      const t0 = Date.now();
      try {
        console.log(`[import-website] === START ${url} ===`);


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

        const useFreigeist = isFreigeistUrl(url);
        console.log(`[import-website] fetched: htmlLen=${html.length} freigeistMode=${useFreigeist} elapsed=${Date.now() - t0}ms`);


        let title: string;
        let publishedAt: string | null = null;
        let bodyHtml: string;
        let featuredImageSrc: string | null = null;
        let firstVideoUrl: string | null = null;
        let subtitle: string | null = null;

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

        if (useFreigeist) {
          const a = await extractFreigeistArticle(url.trim(), html, metadata);
          title = a.title;
          publishedAt = a.publishedAt;
          bodyHtml = a.bodyHtml;
          featuredImageSrc = a.featuredImageSrc;
          firstVideoUrl = a.firstVideoUrl;
          subtitle = a.excerpt;
        } else {
          title = extractTitle(html, metadata);

          const dateMatch = html.match(
            /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i
          );
          if (dateMatch) {
            const parsed = new Date(`${dateMatch[2]} ${dateMatch[1]}, ${dateMatch[3]}`);
            if (!isNaN(parsed.getTime())) publishedAt = parsed.toISOString();
          }

          bodyHtml = extractBodyContent(html);
          bodyHtml = truncateAtRecentPosts(bodyHtml);
          bodyHtml = cleanHtml(bodyHtml);

          const { html: bodyWithVideos, firstVideoUrl: legacyVideoUrl } = convertVideoLinks(bodyHtml);
          bodyHtml = bodyWithVideos;
          firstVideoUrl = legacyVideoUrl;

          const { imageUrl: legacyFeatured, html: bodyWithoutFeatured } = extractFeaturedImage(bodyHtml);
          featuredImageSrc = legacyFeatured;
          bodyHtml = bodyWithoutFeatured;
        }

        const h2Count = (bodyHtml.match(/<h2\b/gi) || []).length;
        const pCount = (bodyHtml.match(/<p\b/gi) || []).length;
        const imgCountBody = (bodyHtml.match(/<img\b/gi) || []).length;
        const hasCta = /class=["'][^"']*cta-button[^"']*["']/i.test(bodyHtml);
        console.log(`[import-website] extracted: title="${title?.slice(0, 80)}" slug=${finalSlug} subtitleLen=${subtitle?.length ?? 0} bodyLen=${bodyHtml.length} h2=${h2Count} p=${pCount} imgs=${imgCountBody} featured=${featuredImageSrc ? "yes" : "no"} video=${firstVideoUrl ? "yes" : "no"} cta=${hasCta}`);



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
            subtitle,
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
          console.error(`[import-website] insert failed for ${url}: ${insertError.message}`);
          errors.push({ url, title, error: insertError.message });
        } else {
          console.log(`[import-website] === DONE ${url} postId=${insertedPost?.id} readingTime=${readingTime} elapsed=${Date.now() - t0}ms ===`);
          created.push(insertedPost);
        }
      } catch (err: any) {
        console.error(`[import-website] FAILED ${url}: ${err?.message}`, err?.stack);
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
