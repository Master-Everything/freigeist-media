import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import {
  Globe, Lightbulb, BookOpen, ListTree,
  Send, Copy, Check, Loader2, Maximize2, Save,
  ChevronDown, Clock, User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CheckResultDialog from "./CheckResultDialog";
import { formatDistanceToNow } from "date-fns";
import { de, enUS } from "date-fns/locale";

const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assist`;

type ResearchAction = "research-web" | "brainstorm-headlines" | "find-sources" | "generate-outline";

const RESEARCH_TYPES: ResearchAction[] = ["research-web", "brainstorm-headlines", "find-sources", "generate-outline"];

const ACTION_LABEL_MAP: Record<ResearchAction, string> = {
  "research-web": "ai.research.webResearch",
  "brainstorm-headlines": "ai.research.brainstormHeadlines",
  "find-sources": "ai.research.findSources",
  "generate-outline": "ai.research.generateOutline",
};

const ACTION_ICON_MAP: Record<ResearchAction, React.ReactNode> = {
  "research-web": <Globe size={10} />,
  "brainstorm-headlines": <Lightbulb size={10} />,
  "find-sources": <BookOpen size={10} />,
  "generate-outline": <ListTree size={10} />,
};

interface SavedEntry {
  id: string;
  check_type: ResearchAction;
  result: string;
  created_at: string;
  created_by: string;
  display_name?: string;
}

interface AIResearchPanelProps {
  content: string;
  postId?: string;
}

const AIResearchPanel = ({ content, postId }: AIResearchPanelProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customTopic, setCustomTopic] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lastActionLabel, setLastActionLabel] = useState("");
  const [lastAction, setLastAction] = useState<ResearchAction | "">("");
  const abortRef = useRef<AbortController | null>(null);

  // History state
  const [history, setHistory] = useState<SavedEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<SavedEntry | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  const dateFnsLocale = i18n.language === "de" ? de : enUS;

  // Load saved research results
  const loadHistory = useCallback(async () => {
    if (!postId) return;
    const { data } = await supabase
      .from("article_checks")
      .select("id, check_type, result, created_at, created_by")
      .eq("post_id", postId)
      .in("check_type", RESEARCH_TYPES)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((e) => e.created_by))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", userIds);
      const profileMap = new Map((profiles || []).map((p) => [p.id, p.display_name]));

      setHistory(
        data.map((e) => ({
          ...e,
          check_type: e.check_type as ResearchAction,
          display_name: profileMap.get(e.created_by) || "Unknown",
        }))
      );
    }
  }, [postId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const streamRequest = useCallback(
    async (action: ResearchAction, label: string) => {
      const textToSend = customTopic.trim() || content;
      if (!textToSend) {
        toast({ title: t("ai.research.noContent"), variant: "destructive" });
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setResponse("");
      setSaved(false);
      setLastActionLabel(label);
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
            fullContent: textToSend,
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
              const c = parsed.choices?.[0]?.delta?.content;
              if (c) {
                accumulated += c;
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
    [content, customTopic, toast, t]
  );

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [response]);

  const handleSave = useCallback(async () => {
    if (!postId || !response || !lastAction) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("article_checks").insert({
        post_id: postId,
        check_type: lastAction,
        result: response,
        created_by: user.id,
      });
      if (error) throw error;
      setSaved(true);
      toast({ title: t("ai.research.saveSuccess") });
      // Refresh history
      loadHistory();
    } catch {
      toast({ title: t("ai.error"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [postId, response, lastAction, toast, t, loadHistory]);

  const actions: { action: ResearchAction; labelKey: string; icon: React.ReactNode }[] = [
    { action: "research-web", labelKey: "ai.research.webResearch", icon: <Globe size={12} /> },
    { action: "brainstorm-headlines", labelKey: "ai.research.brainstormHeadlines", icon: <Lightbulb size={12} /> },
    { action: "find-sources", labelKey: "ai.research.findSources", icon: <BookOpen size={12} /> },
    { action: "generate-outline", labelKey: "ai.research.generateOutline", icon: <ListTree size={12} /> },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {actions.map(({ action, labelKey, icon }) => (
          <Badge
            key={action}
            variant="outline"
            className="cursor-pointer hover:bg-accent transition-colors gap-1 px-2.5 py-1"
            onClick={() => streamRequest(action, t(labelKey))}
          >
            {icon}
            <span className="text-xs">{t(labelKey)}</span>
          </Badge>
        ))}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          placeholder={t("ai.research.topicPlaceholder")}
          className="min-h-[36px] h-9 resize-none text-sm"
        />
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
              <div className="prose prose-sm max-w-none dark:prose-invert text-sm max-h-48 overflow-y-auto prose-headings:mt-6 prose-headings:font-semibold prose-p:my-3 [&_p:has(strong:first-child)]:mt-5">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
              <div className="flex gap-2 mt-3 pt-2 border-t border-border">
                <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5">
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {t(copied ? "ai.copied" : "ai.copy")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDialogOpen(true)}
                  className="gap-1.5"
                >
                  <Maximize2 size={12} />
                  {t("ai.expandResult")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSave}
                  disabled={!postId || saving || saved}
                  title={!postId ? t("ai.research.noPostId") : ""}
                  className="gap-1.5"
                >
                  {saved ? <Check size={12} /> : <Save size={12} />}
                  {t(saved ? "ai.research.saved" : "ai.research.save")}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Saved Results History */}
      {postId && history.length > 0 && (
        <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
          <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full">
            <ChevronDown size={12} className={`transition-transform ${historyOpen ? "rotate-0" : "-rotate-90"}`} />
            {t("ai.research.savedResults")} ({history.length})
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-1.5">
            {history.map((entry) => (
              <button
                key={entry.id}
                onClick={() => {
                  setSelectedEntry(entry);
                  setHistoryDialogOpen(true);
                }}
                className="w-full text-left rounded-md border border-border bg-muted/30 hover:bg-muted/60 transition-colors p-2 space-y-1"
              >
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="secondary" className="gap-1 text-[10px] px-1.5 py-0">
                    {ACTION_ICON_MAP[entry.check_type]}
                    {t(ACTION_LABEL_MAP[entry.check_type])}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <User size={9} /> {entry.display_name}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock size={9} />
                    {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true, locale: dateFnsLocale })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {entry.result.replace(/[#*_`]/g, "").slice(0, 150)}
                </p>
              </button>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      <CheckResultDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={lastActionLabel}
        result={response}
      />

      {/* Dialog for viewing saved history entries */}
      {selectedEntry && (
        <CheckResultDialog
          open={historyDialogOpen}
          onOpenChange={setHistoryDialogOpen}
          title={t(ACTION_LABEL_MAP[selectedEntry.check_type])}
          result={selectedEntry.result}
        />
      )}
    </div>
  );
};

export default AIResearchPanel;
