/**
 * Convert an image file to WebP format using the Canvas API.
 * Falls back to the original file if the browser doesn't support WebP encoding.
 */
export async function convertToWebP(file: File, quality = 0.75): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob || blob.type !== "image/webp") {
            // Browser doesn't support WebP encoding – return original
            resolve(file);
            return;
          }
          // Build new filename with .webp extension
          const baseName = file.name.replace(/\.[^.]+$/, "");
          const newFile = new File([blob], `${baseName}.webp`, {
            type: "image/webp",
            lastModified: Date.now(),
          });
          resolve(newFile);
        },
        "image/webp",
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

/** Check whether a file is already in WebP format */
export function isWebP(file: File): boolean {
  return file.type === "image/webp" || file.name.toLowerCase().endsWith(".webp");
}

/** Format bytes to a human-readable string */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
