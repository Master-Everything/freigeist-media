/**
 * Central helper for converting between relative and absolute image paths.
 *
 * Relative format: "post-images/filename.webp" (no leading slash)
 * Absolute format: "{BASE_URL}post-images/filename.webp"
 *
 * For self-hosting, set VITE_IMAGE_BASE_URL to your image server root,
 * e.g. "http://localhost:8000/"
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;

const DEFAULT_BASE = SUPABASE_URL
  ? `${SUPABASE_URL}/storage/v1/object/public/`
  : "";

export const IMAGE_BASE_URL: string =
  (import.meta.env.VITE_IMAGE_BASE_URL as string | undefined) || DEFAULT_BASE;

const KNOWN_MARKERS = ["/storage/v1/object/public/"];

/**
 * Strip any known base URL prefix to produce a relative path like "post-images/photo.webp".
 * If the input is already relative, returns it unchanged.
 */
export function toRelativePath(url: string | null | undefined): string {
  if (!url) return "";
  // Already relative
  if (!url.startsWith("http://") && !url.startsWith("https://")) return url;

  for (const marker of KNOWN_MARKERS) {
    const idx = url.indexOf(marker);
    if (idx >= 0) {
      return decodeURIComponent(url.substring(idx + marker.length));
    }
  }

  // If it starts with our configured base, strip it
  if (IMAGE_BASE_URL && url.startsWith(IMAGE_BASE_URL)) {
    return decodeURIComponent(url.substring(IMAGE_BASE_URL.length));
  }

  // Unknown absolute URL — return as-is (external image)
  return url;
}

/**
 * Resolve a relative path to an absolute URL.
 * If the input is already absolute, returns it unchanged.
 */
export function toAbsoluteUrl(path: string | null | undefined): string {
  if (!path) return "";
  // Already absolute
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // Data URIs
  if (path.startsWith("data:")) return path;
  return `${IMAGE_BASE_URL}${path}`;
}

/**
 * Process HTML content: resolve all relative image srcs to absolute URLs for display.
 */
export function resolveContentUrls(html: string | null | undefined): string {
  if (!html) return "";
  // Match src="post-images/..." that are not already absolute
  return html.replace(
    /src=["'](post-images\/[^"']+)["']/g,
    (_match, relPath) => `src="${toAbsoluteUrl(relPath)}"`,
  );
}

/**
 * Process HTML content: convert all absolute image URLs to relative paths for storage.
 */
export function relativizeContentUrls(html: string | null | undefined): string {
  if (!html) return "";
  // Match src="https://...supabase.co/storage/v1/object/public/post-images/..."
  return html.replace(
    /src=["'](https?:\/\/[^"']*\/storage\/v1\/object\/public\/(post-images\/[^"']+))["']/g,
    (_match, _fullUrl, relPath) => `src="${decodeURIComponent(relPath)}"`,
  );
}

/**
 * Check if a path (relative or absolute) points to our own storage and is NOT WebP.
 */
export function isOwnNonWebP(src: string): boolean {
  const rel = toRelativePath(src);
  if (!rel.startsWith("post-images/")) return false;
  return !rel.toLowerCase().endsWith(".webp");
}
