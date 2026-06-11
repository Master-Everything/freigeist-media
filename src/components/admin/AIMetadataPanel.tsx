import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assist`;

interface MetadataResult {
  titles: string[];
  subtitle: string;
  category: string;
  reading_time: number;
}

interface AIMetadataPanelProps {
  content: string;
  categorySlugs: string[];
  onApplyTitle: (title: string) => void;
  onApplySubtitle: (subtitle: string) => void;
  onApplyCategory: (slug: string) => void;
  onApplyReadingTime: (minutes: number) => void;
}

const AIMetadataPanel = ({
  content,
  categorySlugs,
  onApplyTitle,
  onApplySubtitle,
  onApplyCategory,
  onApplyReadingTime,
}: AIMetadataPanelProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MetadataResult | null>(null);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [applied, setApplied] = useState<Record<string, boolean>>({});

  const generate = async () => {
    if (!content?.trim()) {
      toast({ title: t("ai.metadata.noContentYet"), variant: "destructive" });
      return;
    }

    setLoading(true);
    setResult(null);
    setApplied({});

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
          action: "suggest-metadata",
          fullContent: content,
          categorySlugs,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Request failed" }));
        toast({ title: err.error || t("ai.error"), variant: "destructive" });
        setLoading(false);
        return;
      }

      const data: MetadataResult = await resp.json();
      setResult(data);
      if (data.titles?.length) setSelectedTitle(data.titles[0]);
    } catch {
      toast({ title: t("ai.error"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const applyField = (field: string, fn: () => void) => {
    fn();
    setApplied((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <div className="rounded-md border border-border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium flex items-center gap-1.5">
          <Sparkles size={14} className="text-primary" />
          {t("ai.metadata.heading")}
        </span>
        <Button size="sm" variant="outline" onClick={generate} disabled={loading} className="gap-1.5">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {loading ? t("ai.metadata.generating") : t("ai.metadata.generate")}
        </Button>
      </div>

      {result && (
        <div className="space-y-4 pt-2 border-t border-border">
          {/* Titles */}
          {result.titles?.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t("ai.metadata.suggestedTitles")}</Label>
              <RadioGroup value={selectedTitle} onValueChange={setSelectedTitle}>
                {result.titles.map((title, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <RadioGroupItem value={title} id={`title-${i}`} className="mt-0.5" />
                    <Label htmlFor={`title-${i}`} className="text-sm font-normal cursor-pointer leading-snug">
                      {title}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  disabled={!selectedTitle}
                  onClick={() => applyField("title", () => onApplyTitle(selectedTitle))}
                >
                  {t("ai.metadata.applyTitle")}
                </Button>
                {applied.title && (
                  <span className="text-xs text-green-600 flex items-center gap-1 animate-in fade-in">
                    <Check size={12} /> {t("ai.metadata.applied")}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Subtitle */}
          {result.subtitle && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t("ai.metadata.suggestedSubtitle")}</Label>
              <p className="text-sm">{result.subtitle}</p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => applyField("subtitle", () => onApplySubtitle(result.subtitle))}
                >
                  {t("ai.metadata.applySubtitle")}
                </Button>
                {applied.subtitle && (
                  <span className="text-xs text-green-600 flex items-center gap-1 animate-in fade-in">
                    <Check size={12} /> {t("ai.metadata.applied")}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Category */}
          {result.category && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t("ai.metadata.suggestedCategory")}</Label>
              <p className="text-sm font-medium">{result.category}</p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => applyField("category", () => onApplyCategory(result.category))}
                >
                  {t("ai.metadata.applyCategory")}
                </Button>
                {applied.category && (
                  <span className="text-xs text-green-600 flex items-center gap-1 animate-in fade-in">
                    <Check size={12} /> {t("ai.metadata.applied")}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Reading time */}
          {result.reading_time && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t("ai.metadata.suggestedReadingTime")}</Label>
              <p className="text-sm">{result.reading_time} min</p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => applyField("reading_time", () => onApplyReadingTime(result.reading_time))}
                >
                  {t("ai.metadata.applyReadingTime")}
                </Button>
                {applied.reading_time && (
                  <span className="text-xs text-green-600 flex items-center gap-1 animate-in fade-in">
                    <Check size={12} /> {t("ai.metadata.applied")}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIMetadataPanel;
