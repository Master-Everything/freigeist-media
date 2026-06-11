import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { sanitizeFilename } from "./ImageGalleryDialog";
import { type ConflictInfo, uploadImageFile } from "./imageUploadUtils";

interface ImageConflictPanelProps {
  conflict: ConflictInfo;
  onResolved: (url: string) => void;
  onCancel: () => void;
}

const ImageConflictPanel = ({ conflict, onResolved, onCancel }: ImageConflictPanelProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [newName, setNewName] = useState(conflict.suggestedName);
  const [uploading, setUploading] = useState(false);

  const handleUseExisting = () => {
    onResolved(conflict.existingUrl);
  };

  const handleUploadNew = async () => {
    const finalName = sanitizeFilename(newName);
    if (conflict.existingNames.includes(finalName)) {
      toast({ title: t("common.error"), description: t("conflict.nameExists"), variant: "destructive" });
      return;
    }
    setUploading(true);
    const url = await uploadImageFile(conflict.file, finalName);
    setUploading(false);
    if (!url) {
      toast({ title: t("postForm.uploadFailed"), variant: "destructive" });
      return;
    }
    onResolved(url);
  };

  return (
    <div className="flex flex-col gap-4 rounded-md border border-border p-4">
      <p className="text-sm font-medium">
        {t("conflict.alreadyExists", { name: conflict.sanitizedName })}
      </p>

      <div className="flex items-center gap-3">
        <img
          src={conflict.existingUrl}
          alt=""
          className="h-16 w-16 rounded border border-border object-cover flex-shrink-0"
        />
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{t("conflict.useExisting")}:</p>
          <Button size="sm" variant="outline" onClick={handleUseExisting}>
            {t("conflict.useExisting")}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">{t("common.or")}</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{t("conflict.uploadNewName")}</p>
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleUploadNew} disabled={uploading || !newName.trim()}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("common.upload")}
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageConflictPanel;
