import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { FileText, Loader2, Copy, Check, ChevronDown, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useArticleCheck } from "@/hooks/useArticleCheck";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import CheckResultDialog from "./CheckResultDialog";

interface AIPressReleaseCheckPanelProps {
  content: string;
  postId?: string;
}

const AIPressReleaseCheckPanel = ({ content, postId }: AIPressReleaseCheckPanelProps) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { result, loading, history, runCheck } = useArticleCheck(postId, "press-release", "check-press-release");

  const handleRun = useCallback(() => runCheck(content), [runCheck, content]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleRun} disabled={loading || !content.trim()} className="gap-1.5">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
          {t("ai.pressRelease.run")}
        </Button>
      </div>

      {history.length > 0 && !loading && (
        <p className="text-xs text-muted-foreground">
          {t("ai.pressRelease.lastCheck")}: {formatTimestamp(history[0].created_at)} {t("ai.checkedBy")} {history[0].display_name}
        </p>
      )}

      {(result || loading) && (
        <div className="rounded-md border border-border bg-background p-3">
          {loading && !result && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={14} className="animate-spin" />
              {t("ai.thinking")}
            </div>
          )}
          {result && (
            <>
              <div className="prose prose-sm max-w-none dark:prose-invert text-sm max-h-60 overflow-y-auto prose-headings:mt-6 prose-headings:font-semibold prose-p:my-3 [&_p:has(strong:first-child)]:mt-5">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
              <div className="flex gap-2 mt-3 pt-2 border-t border-border">
                <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5">
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {t(copied ? "ai.copied" : "ai.copy")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)} className="gap-1.5">
                  <Maximize2 size={12} />
                  {t("ai.expandResult")}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {history.length > 1 && (
        <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
              <ChevronDown size={12} className={`transition-transform ${historyOpen ? "rotate-180" : ""}`} />
              {t("ai.checkHistory")} ({history.length - 1})
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            {history.slice(1).map((entry, i) => (
              <div key={i} className="rounded-md border border-border bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground mb-1">
                  {formatTimestamp(entry.created_at)} {t("ai.checkedBy")} {entry.display_name}
                </p>
                <div className="prose prose-sm max-w-none dark:prose-invert text-xs max-h-32 overflow-y-auto">
                  <ReactMarkdown>{entry.result}</ReactMarkdown>
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      <CheckResultDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={t("ai.tabs.pressRelease")}
        result={result}
      />
    </div>
  );
};

export default AIPressReleaseCheckPanel;
