import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { convertToWebP, formatFileSize } from "./webpConverter";

interface WebPConvertPanelProps {
  file: File;
  onResult: (file: File) => void;
  onCancel: () => void;
}

const WebPConvertPanel = ({ file, onResult, onCancel }: WebPConvertPanelProps) => {
  const [converting, setConverting] = useState(false);
  const { t } = useTranslation();

  const handleConvert = async () => {
    setConverting(true);
    const converted = await convertToWebP(file);
    setConverting(false);
    onResult(converted);
  };

  return (
    <div className="rounded-md border border-border p-4 space-y-3">
      <p className="text-sm font-medium">{t("webp.convertTitle")}</p>
      <p className="text-xs text-muted-foreground">
        {file.name} ({formatFileSize(file.size)})
      </p>
      {converting ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("webp.converting")}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleConvert}>
            {t("webp.convertBtn")}
          </Button>
          <Button size="sm" variant="outline" onClick={() => onResult(file)}>
            {t("webp.keepOriginal")}
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WebPConvertPanel;
