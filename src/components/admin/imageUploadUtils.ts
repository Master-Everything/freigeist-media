import { sanitizeFilename } from "./ImageGalleryDialog";
import { supabase } from "@/integrations/supabase/client";
import { toRelativePath } from "@/lib/imageUrl";

/**
 * Given a sanitized filename and a list of existing names,
 * returns the next available numbered variant.
 * e.g. "photo.jpg" -> "photo-2.jpg" -> "photo-3.jpg"
 */
export function getNextAvailableName(name: string, existingNames: string[]): string {
  if (!existingNames.includes(name)) return name;
  const dotIndex = name.lastIndexOf(".");
  const base = dotIndex > 0 ? name.substring(0, dotIndex) : name;
  const ext = dotIndex > 0 ? name.substring(dotIndex) : "";
  // Strip trailing -N if present to get the root base
  const rootBase = base.replace(/-\d+$/, "");
  let counter = 2;
  let candidate = `${rootBase}-${counter}${ext}`;
  while (existingNames.includes(candidate)) {
    counter++;
    candidate = `${rootBase}-${counter}${ext}`;
  }
  return candidate;
}

export interface ConflictInfo {
  file: File;
  sanitizedName: string;
  suggestedName: string;
  existingUrl: string;
  existingNames: string[];
}

/**
 * Check for filename conflict and return conflict info if exists, or null if no conflict.
 */
export async function checkImageConflict(file: File): Promise<{
  conflict: ConflictInfo | null;
  sanitizedName: string;
  existingNames: string[];
}> {
  const sanitized = sanitizeFilename(file.name);
  const { data: existing } = await supabase.storage
    .from("post-images")
    .list("", { limit: 1000 });
  const existingNames = (existing || []).filter(f => !f.name.startsWith(".")).map(f => f.name);

  if (existingNames.includes(sanitized)) {
    const existingUrl = `post-images/${sanitized}`;
    const suggestedName = getNextAvailableName(sanitized, existingNames);
    return {
      conflict: { file, sanitizedName: sanitized, suggestedName, existingUrl, existingNames },
      sanitizedName: sanitized,
      existingNames,
    };
  }
  return { conflict: null, sanitizedName: sanitized, existingNames };
}

/**
 * Upload a file to post-images bucket and return the public URL.
 */
export async function uploadImageFile(file: File, fileName: string): Promise<string | null> {
  const { error } = await supabase.storage.from("post-images").upload(fileName, file);
  if (error) return null;
  return `post-images/${fileName}`;
}
