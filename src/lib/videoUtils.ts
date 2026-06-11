/**
 * Utilities for parsing YouTube / Vimeo URLs into embed URLs and thumbnails.
 * Only these two providers are allowed – all other URLs are rejected.
 */

export function getYouTubeId(url: string): string | null {
  const m =
    url.match(/(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/) ||
    url.match(/youtube\.com\/shorts\/([\w-]{11})/);
  return m ? m[1] : null;
}

export function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : null;
}

/** Convert a user-facing YouTube/Vimeo URL into an embeddable URL. Returns null for invalid URLs. */
export function getEmbedUrl(url: string): string | null {
  const ytId = getYouTubeId(url);
  if (ytId) return `https://www.youtube.com/embed/${ytId}`;
  const vmId = getVimeoId(url);
  if (vmId) return `https://player.vimeo.com/video/${vmId}`;
  return null;
}

/** Get a YouTube thumbnail image URL (high quality). Returns null for non-YouTube URLs. */
export function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}
