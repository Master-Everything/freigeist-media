import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assist`;

type CheckType = "journalism" | "press-release" | "company-news";

interface CheckEntry {
  result: string;
  created_at: string;
  created_by: string;
  display_name?: string;
}

export function useArticleCheck(postId: string | undefined, checkType: CheckType, action: string) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<CheckEntry[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  // Load history from database
  useEffect(() => {
    if (!postId) return;
    const load = async () => {
      const { data } = await supabase
        .from("article_checks" as any)
        .select("result, created_at, created_by")
        .eq("post_id", postId)
        .eq("check_type", checkType)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data && (data as any[]).length > 0) {
        const entries = data as any[];
        // Fetch display names for creators
        const userIds = [...new Set(entries.map((e: any) => e.created_by))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", userIds);

        const profileMap = new Map((profiles || []).map((p) => [p.id, p.display_name]));

        const enriched: CheckEntry[] = entries.map((e: any) => ({
          result: e.result,
          created_at: e.created_at,
          created_by: e.created_by,
          display_name: profileMap.get(e.created_by) || "Unknown",
        }));

        setHistory(enriched);
        // Show most recent result
        setResult(enriched[0].result);
      }
    };
    load();
  }, [postId, checkType]);

  const runCheck = useCallback(async (content: string) => {
    if (!content.trim()) {
      toast({ title: t(`ai.${checkType === "press-release" ? "pressRelease" : checkType === "company-news" ? "companyNews" : "journalism"}.noContent`), variant: "destructive" });
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setResult("");

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
          selectedText: "",
          fullContent: content,
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
              setResult(accumulated);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Save to database
      if (postId && accumulated) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("article_checks" as any).insert({
            post_id: postId,
            check_type: checkType,
            result: accumulated,
            created_by: user.id,
          } as any);

          // Refresh history
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, display_name")
            .eq("id", user.id);

          const displayName = profiles?.[0]?.display_name || "Unknown";
          setHistory((prev) => [
            { result: accumulated, created_at: new Date().toISOString(), created_by: user.id, display_name: displayName },
            ...prev,
          ]);
        }
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        toast({ title: t("ai.error"), variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  }, [postId, checkType, action, toast, t]);

  return { result, loading, history, runCheck, setResult };
}
