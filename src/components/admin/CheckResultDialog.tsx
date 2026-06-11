import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CheckResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  result: string;
}

const CheckResultDialog = ({ open, onOpenChange, title, result }: CheckResultDialogProps) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[65vh]">
          <div className="prose prose-base max-w-none dark:prose-invert p-4 leading-relaxed prose-headings:font-heading prose-headings:tracking-tight prose-headings:mt-10 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-li:my-1 prose-p:my-4 [&_p:has(strong:first-child)]:mt-8 [&_p:has(strong:first-child)]:font-semibold">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
        <DialogFooter>
          <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5">
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {t(copied ? "ai.copied" : "ai.copy")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CheckResultDialog;
