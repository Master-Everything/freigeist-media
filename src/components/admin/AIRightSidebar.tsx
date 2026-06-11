import { useState } from "react";
import { Editor } from "@tiptap/react";
import { useTranslation } from "react-i18next";
import { PanelRightClose, PanelRightOpen, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import AIAssistPanel from "./AIAssistPanel";
import AIMetadataPanel from "./AIMetadataPanel";
import AIJournalismCheckPanel from "./AIJournalismCheckPanel";
import AIPressReleaseCheckPanel from "./AIPressReleaseCheckPanel";
import AICompanyNewsCheckPanel from "./AICompanyNewsCheckPanel";
import AIResearchPanel from "./AIResearchPanel";

interface AIRightSidebarProps {
  editor: Editor | null;
  content: string;
  categorySlugs: string[];
  postId?: string;
  onApplyTitle: (title: string) => void;
  onApplySubtitle: (sub: string) => void;
  onApplyCategory: (slug: string) => void;
  onApplyReadingTime: (min: number) => void;
}

const AIRightSidebar = ({
  editor,
  content,
  categorySlugs,
  postId,
  onApplyTitle,
  onApplySubtitle,
  onApplyCategory,
  onApplyReadingTime,
}: AIRightSidebarProps) => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [metaOpen, setMetaOpen] = useState(true);
  const [assistOpen, setAssistOpen] = useState(true);
  const [journalismOpen, setJournalismOpen] = useState(true);
  const [pressReleaseOpen, setPressReleaseOpen] = useState(true);
  const [companyNewsOpen, setCompanyNewsOpen] = useState(true);
  const [researchOpen, setResearchOpen] = useState(true);

  if (collapsed) {
    return (
      <div className="sticky top-14 h-fit">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(false)}
          title={t("ai.sidebar.expand")}
          className="mt-2"
        >
          <PanelRightOpen size={18} />
        </Button>
      </div>
    );
  }

  return (
    <div className="sticky top-14 h-[calc(100vh-3.5rem-4rem)] w-80 shrink-0 border-l border-border bg-background flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-sm font-medium">{t("ai.sidebar.title")}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setCollapsed(true)}
          title={t("ai.sidebar.collapse")}
        >
          <PanelRightClose size={16} />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {/* AI Metadata Section */}
          <Collapsible open={metaOpen} onOpenChange={setMetaOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium py-1 hover:text-primary transition-colors">
              {t("ai.metadata.heading")}
              <ChevronDown size={14} className={`transition-transform ${metaOpen ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-2">
                <AIMetadataPanel
                  content={content}
                  categorySlugs={categorySlugs}
                  onApplyTitle={onApplyTitle}
                  onApplySubtitle={onApplySubtitle}
                  onApplyCategory={onApplyCategory}
                  onApplyReadingTime={onApplyReadingTime}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* AI Writing Assistant Section */}
          <Collapsible open={assistOpen} onOpenChange={setAssistOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium py-1 hover:text-primary transition-colors">
              {t("ai.sidebar.writing")}
              <ChevronDown size={14} className={`transition-transform ${assistOpen ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-2">
                {editor ? (
                  <AIAssistPanel editor={editor} />
                ) : (
                  <p className="text-xs text-muted-foreground">{t("ai.noContent")}</p>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Research & Ideation Section */}
          <Collapsible open={researchOpen} onOpenChange={setResearchOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium py-1 hover:text-primary transition-colors">
              {t("ai.sidebar.research")}
              <ChevronDown size={14} className={`transition-transform ${researchOpen ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-2">
                <AIResearchPanel content={content} postId={postId} />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Journalism Check Section */}
          <Collapsible open={journalismOpen} onOpenChange={setJournalismOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium py-1 hover:text-primary transition-colors">
              {t("ai.sidebar.journalism")}
              <ChevronDown size={14} className={`transition-transform ${journalismOpen ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-2">
                <AIJournalismCheckPanel content={content} postId={postId} />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Press Release Check Section */}
          <Collapsible open={pressReleaseOpen} onOpenChange={setPressReleaseOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium py-1 hover:text-primary transition-colors">
              {t("ai.sidebar.pressRelease")}
              <ChevronDown size={14} className={`transition-transform ${pressReleaseOpen ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-2">
                <AIPressReleaseCheckPanel content={content} postId={postId} />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Company News Check Section */}
          <Collapsible open={companyNewsOpen} onOpenChange={setCompanyNewsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium py-1 hover:text-primary transition-colors">
              {t("ai.sidebar.companyNews")}
              <ChevronDown size={14} className={`transition-transform ${companyNewsOpen ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-2">
                <AICompanyNewsCheckPanel content={content} postId={postId} />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AIRightSidebar;
