import { supabase } from "@/integrations/supabase/client";
import { convertToWebP } from "./webpConverter";
import { uploadImageFile } from "./imageUploadUtils";
import { toRelativePath, toAbsoluteUrl, isOwnNonWebP as isOwnNonWebPHelper } from "@/lib/imageUrl";

interface ConvertResult {
  converted: number;
  skipped: number;
  failed: number;
}

/**
 * Extract the storage filename from a public URL.
 * e.g. "…/post-images/my-image.jpg" → "my-image.jpg"
 */
function extractStorageFilename(url: string): string | null {
  const marker = "/post-images/";
  const idx = url.indexOf(marker);
  if (idx < 0) return null;
  return decodeURIComponent(url.substring(idx + marker.length));
}

/**
 * Check whether a URL points to our own storage bucket and is NOT already WebP.
 */
export function isOwnNonWebP(src: string): boolean {
  return isOwnNonWebPHelper(src);
}

/**
 * Convert a single storage image to WebP:
 * 1. Fetch the original
 * 2. Canvas-convert to WebP
 * 3. Upload the .webp version
 * 4. Delete the original from storage
 * Returns the new public URL, or null on failure.
 */
export async function convertStorageImageToWebP(originalUrl: string): Promise<string | null> {
  const rel = toRelativePath(originalUrl);
  const originalName = rel.startsWith("post-images/") ? rel.substring("post-images/".length) : extractStorageFilename(originalUrl);
  if (!originalName) return null;

  try {
    // Fetch original image (resolve to absolute for fetching)
    const fetchUrl = toAbsoluteUrl(rel);
    const res = await fetch(fetchUrl);
    if (!res.ok) return null;
    const blob = await res.blob();
    const file = new File([blob], originalName, { type: blob.type });

    // Convert to WebP
    const webpFile = await convertToWebP(file, 0.75);
    if (webpFile === file) return null; // conversion failed / unsupported

    // Check for name collision in storage
    const { data: existing } = await supabase.storage
      .from("post-images")
      .list("", { limit: 1000 });
    const existingNames = (existing || []).filter(f => !f.name.startsWith(".")).map(f => f.name);

    let webpName = webpFile.name;
    if (existingNames.includes(webpName)) {
      // Add a counter suffix
      const base = webpName.replace(/\.webp$/, "");
      let counter = 2;
      while (existingNames.includes(`${base}-${counter}.webp`)) counter++;
      webpName = `${base}-${counter}.webp`;
    }

    // Upload WebP
    const newRelPath = await uploadImageFile(webpFile, webpName);
    if (!newRelPath) return null;

    // Delete the original
    await supabase.storage.from("post-images").remove([originalName]);

    return newRelPath;
  } catch {
    return null;
  }
}

export interface ScannedImage {
  src: string;
  filename: string;
  format: string;
}

/**
 * Scan a TipTap editor for non-WebP storage images without converting.
 */
export function scanNonWebPImages(editorView: any): ScannedImage[] {
  const images: ScannedImage[] = [];
  editorView.state.doc.descendants((node: any) => {
    if (node.type.name === "figure" && node.attrs.src && isOwnNonWebP(node.attrs.src)) {
      const filename = extractStorageFilename(node.attrs.src) || "unknown";
      const ext = filename.split(".").pop()?.toUpperCase() || "?";
      images.push({ src: node.attrs.src, filename, format: ext });
    }
  });
  return images;
}

/**
 * Scan a TipTap editor for non-WebP storage images and convert them all.
 * Returns the conversion result summary.
 */
export async function batchConvertEditorImages(
  editorView: any,
  onProgress?: (done: number, total: number) => void,
): Promise<ConvertResult> {
  const result: ConvertResult = { converted: 0, skipped: 0, failed: 0 };

  // Collect all non-WebP storage image URLs
  const targets: { pos: number; src: string }[] = [];
  editorView.state.doc.descendants((node: any, pos: number) => {
    if (node.type.name === "figure" && node.attrs.src && isOwnNonWebP(node.attrs.src)) {
      targets.push({ pos, src: node.attrs.src });
    }
  });

  if (targets.length === 0) return result;

  for (let i = 0; i < targets.length; i++) {
    onProgress?.(i, targets.length);
    const { src } = targets[i];
    const newUrl = await convertStorageImageToWebP(src);

    if (newUrl) {
      // Rewrite the src in the editor document
      const { doc, tr } = editorView.state;
      doc.descendants((node: any, pos: number) => {
        if (node.type.name === "figure" && node.attrs.src === src) {
          tr.setNodeMarkup(pos, undefined, { ...node.attrs, src: newUrl });
          return false;
        }
      });
      editorView.dispatch(tr);
      result.converted++;
    } else {
      result.failed++;
    }
  }

  onProgress?.(targets.length, targets.length);
  return result;
}
