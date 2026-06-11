import { useState, useCallback, useRef } from "react";
import { Editor } from "@tiptap/react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import {
  RotateCcw, Minimize2, Maximize2, Languages, Sparkles,
  Wand2, Send, Copy, Check, Replace, Plus, Loader2, SpellCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assist`;

type Action =
  | "rewrite" | "shorten" | "expand" | "improve-style"
  | "translate-de" | "translate-en"
  | "suggest-title" | "suggest-subtitle"
  | "fix-grammar"
  | "custom";

interface AIAssistPanelProps {
  editor: Editor;
}

const AIAssistPanel = ({ editor }: AIAssistPanelProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [lastAction, setLastAction] = useState<Action | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const getSelectedText = useCallback(() => {
    const { from, to } = editor.state.selection;
    if (from === to) return "";
    return editor.state.doc.textBetween(from, to, "\n");
  }, [editor]);

  const getFullContent = useCallback(() => {
    return editor.state.doc.textContent;
  }, [editor]);

  const streamRequest = useCallback(
    async (action: Action, prompt?: string) => {
      const selectedText = getSelectedText();
      const fullContent = getFullContent();

      if (!selectedText && !fullContent) {
        toast({ title: t("ai.noContent"), variant: "destructive" });
        return;
      }

      const fullContentActions: Action[] = ["suggest-title", "suggest-subtitle", "fix-grammar", "custom"];
      if (
        !fullContentActions.includes(action) &&
        !selectedText
      ) {
        toast({ title: t("ai.selectText"), variant: "destructive" });
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setResponse("");
      setLastAction(action);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          toast({ title: t("ai.error"), description: "Not authenticated", variant: "destructive" });
          setLoading(false);
          return;
        }
        const resp = await fetch(AI_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action,
            selectedText,
            fullContent,
            customPrompt: prompt,
            language: document.documentElement.lang || "de",
          }),
          signal: controller.signal,
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: "Request failed" }));
          toast({ title: err.error || t("ai.error"), variant: "destructive" });
          setLoading(false);
          return;
        }

        const reader = resp.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let idx: number;
          while ((idx = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") break;
            try {
              const parsed = JSON.parse(json);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                accumulated += content;
                setResponse(accumulated);
              }
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }
      } catch (e: any) {
        if (e.name !== "AbortError") {
          toast({ title: t("ai.error"), variant: "destructive" });
        }
      } finally {
        setLoading(false);
      }
    },
    [getSelectedText, getFullContent, toast, t]
  );

  const handleInsert = useCallback(() => {
    if (!response) return;
    editor.chain().focus().insertContent(response).run();
    setResponse("");
  }, [editor, response]);

  const handleReplace = useCallback(() => {
    if (!response) return;
    const { from, to } = editor.state.selection;
    if (from === to) {
      handleInsert();
      return;
    }
    editor.chain().focus().deleteSelection().insertContent(response).run();
    setResponse("");
  }, [editor, response, handleInsert]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [response]);

  const handleCustomSubmit = () => {
    if (!customPrompt.trim()) return;
    streamRequest("custom", customPrompt.trim());
  };

  const isMeta = lastAction === "suggest-title" || lastAction === "suggest-subtitle";

  const actions: { action: Action; labelKey: string; icon: React.ReactNode }[] = [
    { action: "rewrite", labelKey: "ai.rewrite", icon: <RotateCcw size={12} /> },
    { action: "shorten", labelKey: "ai.shorten", icon: <Minimize2 size={12} /> },
    { action: "expand", labelKey: "ai.expand", icon: <Maximize2 size={12} /> },
    { action: "improve-style", labelKey: "ai.improveStyle", icon: <Wand2 size={12} /> },
    { action: "translate-de", labelKey: "ai.translateDE", icon: <Languages size={12} /> },
    { action: "translate-en", labelKey: "ai.translateEN", icon: <Languages size={12} /> },
    { action: "suggest-title", labelKey: "ai.suggestTitle", icon: <Sparkles size={12} /> },
    { action: "suggest-subtitle", labelKey: "ai.suggestSubtitle", icon: <Sparkles size={12} /> },
    { action: "fix-grammar", labelKey: "ai.fixGrammar", icon: <SpellCheck size={12} /> },
  ];

  return (
    <div className="p-3 border-b border-border bg-muted/30 space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {actions.map(({ action, labelKey, icon }) => (
          <Badge
            key={action}
            variant="outline"
            className="cursor-pointer hover:bg-accent transition-colors gap-1 px-2.5 py-1"
            onClick={() => streamRequest(action)}
          >
            {icon}
            <span className="text-xs">{t(labelKey)}</span>
          </Badge>
        ))}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder={t("ai.customPlaceholder")}
          className="min-h-[36px] h-9 resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleCustomSubmit();
            }
          }}
        />
        <Button
          size="sm"
          onClick={handleCustomSubmit}
          disabled={loading || !customPrompt.trim()}
          className="shrink-0"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </Button>
      </div>

      {(response || loading) && (
        <div className="rounded-md border border-border bg-background p-3">
          {loading && !response && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={14} className="animate-spin" />
              {t("ai.thinking")}
            </div>
          )}
          {response && (
            <>
              <div className="prose prose-sm max-w-none dark:prose-invert text-sm max-h-60 overflow-y-auto prose-headings:mt-6 prose-headings:font-semibold prose-p:my-3 [&_p:has(strong:first-child)]:mt-5">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
              <div className="flex gap-2 mt-3 pt-2 border-t border-border">
                {isMeta ? (
                  <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5">
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {t(copied ? "ai.copied" : "ai.copy")}
                  </Button>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={handleInsert} className="gap-1.5">
                      <Plus size={12} />
                      {t("ai.insert")}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleReplace} className="gap-1.5">
                      <Replace size={12} />
                      {t("ai.replace")}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCopy} className="gap-1.5 ml-auto">
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAssistPanel;
