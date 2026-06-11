import { createContext, useContext } from "react";
import type { ConflictInfo } from "./imageUploadUtils";

export interface PendingImageCallbacks {
  getPendingFile: (tempUrl: string) => File | undefined;
  onConvertDecision: (tempUrl: string, action: "convert" | "keep") => void;
  getPendingConflict: (tempUrl: string) => ConflictInfo | undefined;
  onConflictResolved: (tempUrl: string, action: "use-existing" | "rename", newName?: string) => void;
  onConflictCancel: (tempUrl: string) => void;
}

export const PendingImageContext = createContext<PendingImageCallbacks | null>(null);

export function usePendingImage() {
  return useContext(PendingImageContext);
}
