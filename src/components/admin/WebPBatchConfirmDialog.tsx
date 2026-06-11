import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ScannedImage } from "./batchWebPConverter";

interface WebPBatchConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: ScannedImage[];
  onConfirm: () => void;
  converting: boolean;
  progress: string;
}

const WebPBatchConfirmDialog = ({
  open,
  onOpenChange,
  images,
  onConfirm,
  converting,
  progress,
}: WebPBatchConfirmDialogProps) => {
  const { t } = useTranslation();
  const webpName = (filename: string) =>
    filename.replace(/\.[^.]+$/, ".webp");

  return (
    <Dialog open={open} onOpenChange={converting ? undefined : onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("webp.batchTitle")}</DialogTitle>
          <DialogDescription>
            {t("webp.batchDesc", { count: images.length })}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-48 overflow-y-auto space-y-1.5 text-sm">
          {images.map((img) => (
            <div key={img.src} className="flex items-center gap-1.5 text-muted-foreground">
              <span className="truncate font-mono text-xs">{img.filename}</span>
              <ArrowRight size={12} className="shrink-0" />
              <span className="truncate font-mono text-xs">{webpName(img.filename)}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-md px-3 py-2">
          <Trash2 size={12} className="shrink-0" />
          <span>{t("webp.originalsDeleted")}</span>
        </div>

        {converting && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" />
            <span>{progress || t("webp.converting")}</span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={converting}>
            {t("common.cancel")}
          </Button>
          <Button onClick={onConfirm} disabled={converting}>
            {converting ? t("webp.converting") : t("postForm.convert")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WebPBatchConfirmDialog;
