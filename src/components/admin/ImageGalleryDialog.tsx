import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, Search, Trash2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toAbsoluteUrl } from "@/lib/imageUrl";
import { useToast } from "@/hooks/use-toast";
import { getNextAvailableName, uploadImageFile } from "./imageUploadUtils";
import ImageConflictPanel from "./ImageConflictPanel";
import WebPConvertPanel from "./WebPConvertPanel";
import { isWebP } from "./webpConverter";
import { useGalleryImages } from "@/hooks/useGalleryImages";
import type { ConflictInfo } from "./imageUploadUtils";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

function sanitizeFilename(name: string): string {
  const ext = name.split(".").pop() || "";
  const base = name.slice(0, name.length - ext.length - 1);
  const sanitized = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${sanitized}.${ext.toLowerCase()}`;
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return "–";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface ImageGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}

const ImageGalleryDialog = ({ open, onOpenChange, onSelect }: ImageGalleryDialogProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { images, existingNames, loading, loadingMore, hasMore, fetchInitial, fetchMore, deleteImage, renameImage } =
    useGalleryImages();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [conflict, setConflict] = useState<ConflictInfo | null>(null);
  const [webpPending, setWebpPending] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ name: string; usedInPosts: string[] } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ name: string; usedInPosts: string[] } | null>(null);
  const [newName, setNewName] = useState("");
  const [renaming, setRenaming] = useState(false);

  useEffect(() => {
    if (open) {
      fetchInitial();
      setConflict(null);
      setWebpPending(null);
      setSearchQuery("");
    }
  }, [open, fetchInitial]);

  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) return images;
    const q = searchQuery.toLowerCase();
    return images.filter(
      (img) =>
        img.name.toLowerCase().includes(q) ||
        img.usedInPosts.some((title) => title.toLowerCase().includes(q)),
    );
  }, [images, searchQuery]);

  const doUpload = useCallback(
    async (file: File, finalName: string) => {
      setUploading(true);
      const url = await uploadImageFile(file, finalName);
      setUploading(false);
      if (!url) {
        toast({ title: t("postForm.uploadFailed"), variant: "destructive" });
        return;
      }
      setConflict(null);
      onSelect(url);
      onOpenChange(false);
    },
    [toast, onSelect, onOpenChange, t],
  );

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast({ title: t("common.error"), description: t("postForm.selectImageFile"), variant: "destructive" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: t("common.error"), description: t("postForm.imageTooLarge"), variant: "destructive" });
        return;
      }
      const sanitized = sanitizeFilename(file.name);
      if (existingNames.includes(sanitized)) {
        const existingUrl = toAbsoluteUrl(`post-images/${sanitized}`);
        const suggestedName = getNextAvailableName(sanitized, existingNames);
        setConflict({ file, sanitizedName: sanitized, suggestedName, existingUrl, existingNames });
        return;
      }
      await doUpload(file, sanitized);
    },
    [toast, existingNames, doUpload, t],
  );

  const interceptFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast({ title: t("common.error"), description: t("postForm.selectImageFile"), variant: "destructive" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: t("common.error"), description: t("postForm.imageTooLarge"), variant: "destructive" });
        return;
      }
      if (isWebP(file)) {
        handleFile(file);
      } else {
        setWebpPending(file);
      }
    },
    [handleFile, t],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) interceptFile(file);
    },
    [interceptFile],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const ok = await deleteImage(deleteTarget.name);
    setDeleting(false);
    setDeleteTarget(null);
    if (ok) {
      toast({ title: t("gallery.imageDeleted"), description: deleteTarget.name });
    } else {
      toast({ title: t("gallery.deleteFailed"), variant: "destructive" });
    }
  }, [deleteTarget, deleteImage, toast, t]);

  const handleRename = useCallback(async () => {
    if (!renameTarget) return;
    const ext = renameTarget.name.split(".").pop() || "";
    const sanitized = sanitizeFilename(`${newName}.${ext}`);
    if (sanitized === renameTarget.name) {
      setRenameTarget(null);
      return;
    }
    if (existingNames.includes(sanitized)) {
      toast({ title: t("gallery.nameAlreadyTaken"), variant: "destructive" });
      return;
    }
    setRenaming(true);
    const ok = await renameImage(renameTarget.name, sanitized);
    setRenaming(false);
    setRenameTarget(null);
    if (ok) {
      toast({ title: t("gallery.imageRenamed"), description: `${renameTarget.name} → ${sanitized}` });
    } else {
      toast({ title: t("gallery.renameFailed"), variant: "destructive" });
    }
  }, [renameTarget, newName, existingNames, renameImage, toast, t]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[1100px]">
          <DialogHeader>
            <DialogTitle>{t("gallery.insertImage")}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="gallery">
            <TabsList className="w-full">
              <TabsTrigger value="gallery" className="flex-1">{t("gallery.gallery")}</TabsTrigger>
              <TabsTrigger value="upload" className="flex-1">{t("gallery.upload")}</TabsTrigger>
            </TabsList>

            <TabsContent value="gallery">
              <div className="relative mb-3">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("gallery.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <ScrollArea className="h-[700px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredImages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-10">
                    {searchQuery ? t("gallery.noResults") : t("gallery.noImages")}
                  </p>
                ) : (
                  <div className="space-y-2 p-1">
                    <div className="grid grid-cols-4 gap-3">
                      {filteredImages.map((img) => (
                        <div
                          key={img.name}
                          className="flex flex-col h-full rounded-lg border border-border bg-card overflow-hidden group"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              onSelect(img.url);
                              onOpenChange(false);
                            }}
                            className="aspect-[4/3] w-full flex-shrink-0 overflow-hidden hover:opacity-90 transition-opacity"
                          >
                            <img
                              src={img.url}
                              alt={img.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </button>

                          <div className="p-2 flex flex-col flex-1 min-h-0">
                            <p className="text-xs font-medium truncate" title={img.name}>
                              {img.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {formatFileSize(img.size)}
                            </p>
                            {img.usedInPosts.length > 0 ? (
                              <div className="mt-1 space-y-0.5">
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  {img.usedInPosts.length} {img.usedInPosts.length === 1 ? t("gallery.post") : t("gallery.posts")}
                                </Badge>
                                {img.usedInPosts.slice(0, 2).map((title) => (
                                  <p key={title} className="text-[10px] text-muted-foreground truncate" title={title}>
                                    {title}
                                  </p>
                                ))}
                                {img.usedInPosts.length > 2 && (
                                  <p className="text-[10px] text-muted-foreground italic">
                                    {t("gallery.more", { count: img.usedInPosts.length - 2 })}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-[11px] text-muted-foreground italic mt-1">{t("gallery.notUsed")}</p>
                            )}
                            <div className="flex justify-end gap-0.5 mt-auto pt-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const ext = img.name.split(".").pop() || "";
                                  const base = img.name.slice(0, img.name.length - ext.length - 1);
                                  setNewName(base);
                                  setRenameTarget({ name: img.name, usedInPosts: img.usedInPosts });
                                }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget({ name: img.name, usedInPosts: img.usedInPosts });
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {hasMore && !searchQuery && (
                      <div className="flex justify-center pt-2 pb-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={fetchMore}
                          disabled={loadingMore}
                        >
                          {loadingMore ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          {t("gallery.loadMore")}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="upload">
              {webpPending ? (
                <WebPConvertPanel
                  file={webpPending}
                  onResult={(resultFile) => {
                    setWebpPending(null);
                    handleFile(resultFile);
                  }}
                  onCancel={() => setWebpPending(null)}
                />
              ) : conflict ? (
                <ImageConflictPanel
                  conflict={conflict}
                  onResolved={(url) => {
                    setConflict(null);
                    onSelect(url);
                    onOpenChange(false);
                  }}
                  onCancel={() => setConflict(null)}
                />
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed p-10 transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  {uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{t("gallery.dragOrChoose")}</p>
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        {t("gallery.chooseFile")}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) interceptFile(file);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                      />
                    </>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("gallery.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium">{deleteTarget?.name}</span> {t("gallery.deleteTitle") && "will be permanently deleted."}
              {deleteTarget && deleteTarget.usedInPosts.length > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  {t("gallery.deleteUsedWarning", { count: deleteTarget.usedInPosts.length })}
                  <span className="block mt-1 font-normal">
                    {deleteTarget.usedInPosts.join(", ")}
                  </span>
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename dialog */}
      <AlertDialog open={!!renameTarget} onOpenChange={(o) => { if (!o) setRenameTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("gallery.renameTitle")}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <span className="block mb-2">{t("gallery.currentName")} <span className="font-medium">{renameTarget?.name}</span></span>
                <div className="flex items-center gap-1">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <span className="text-sm text-muted-foreground">.{renameTarget?.name.split(".").pop()}</span>
                </div>
                {renameTarget && renameTarget.usedInPosts.length > 0 && (
                  <span className="block mt-3 text-sm text-muted-foreground">
                    {t("gallery.renameUsedWarning", { count: renameTarget.usedInPosts.length })}
                  </span>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={renaming}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRename}
              disabled={renaming || !newName.trim()}
            >
              {renaming ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t("gallery.rename")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export { sanitizeFilename };
export default ImageGalleryDialog;
