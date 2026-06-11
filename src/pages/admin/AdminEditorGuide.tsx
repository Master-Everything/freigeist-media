import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Printer, Copy, LogIn, FileText, Type, Image, Send,
  Shield, ChevronRight, Bold, Italic, Underline, Heading,
  List, ListOrdered, Link, AlignLeft, AlignCenter, AlignRight,
  ArrowUp, ArrowDown, Trash2, RotateCcw, Video, Calendar,
  Star, Eye, PenTool, Maximize2, Users, Sparkles, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface Section {
  id: string;
  titleKey: string;
  icon: React.ElementType;
  markdownKey: string;
  content: React.ReactNode;
}

const HtmlSpan = ({ html }: { html: string }) => (
  <span dangerouslySetInnerHTML={{ __html: html }} />
);

const Item = ({ icon: Icon, html }: { icon: React.ElementType; html: string }) => (
  <li className="flex gap-2 items-start font-ui text-sm text-muted-foreground">
    <Icon size={14} className="mt-0.5 shrink-0 text-primary" />
    <HtmlSpan html={html} />
  </li>
);

const AdminEditorGuide = () => {
  const { t } = useTranslation();

  const sections: Section[] = [
    {
      id: "login",
      titleKey: "guide.s1.title",
      icon: LogIn,
      markdownKey: "guide.s1.markdown",
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s1.signingIn")}</h3>
            <p className="font-ui text-sm text-muted-foreground leading-relaxed">
              {t("guide.s1.signingInText1")}{" "}
              <a href="https://6f84d1b9c3e2.igate.pw/admin/login" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                https://6f84d1b9c3e2.igate.pw/admin/login
              </a>
            </p>
            <p className="font-ui text-sm text-muted-foreground leading-relaxed mt-2">{t("guide.s1.signingInText2")}</p>
            <p className="font-ui text-sm text-muted-foreground leading-relaxed mt-2">{t("guide.s1.signingInText3")}</p>
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s1.dashboard")}</h3>
            <p className="font-ui text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: t("guide.s1.dashboardText") }} />
          </div>
        </div>
      ),
    },
    {
      id: "new-post",
      titleKey: "guide.s2.title",
      icon: FileText,
      markdownKey: "guide.s2.markdown",
      content: (
        <div className="space-y-4">
          <p className="font-ui text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: t("guide.s2.intro") }} />
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s2.required")}</h3>
            <ul className="space-y-2">
              <Item icon={ChevronRight} html={t("guide.s2.reqTitle")} />
              <Item icon={ChevronRight} html={t("guide.s2.reqCategory")} />
            </ul>
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s2.optional")}</h3>
            <ul className="space-y-2">
              <Item icon={ChevronRight} html={t("guide.s2.optSubtitle")} />
              <Item icon={ChevronRight} html={t("guide.s2.optAuthor")} />
              <Item icon={ChevronRight} html={t("guide.s2.optHero")} />
              <Item icon={Video} html={t("guide.s2.optVideo")} />
            </ul>
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s2.postList")}</h3>
            <ul className="space-y-2">
              <Item icon={Users} html={t("guide.s2.postListText")} />
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "editor",
      titleKey: "guide.s3.title",
      icon: Type,
      markdownKey: "guide.s3.markdown",
      content: (
        <div className="space-y-4">
          <p className="font-ui text-sm text-muted-foreground leading-relaxed">{t("guide.s3.intro")}</p>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s3.formatting")}</h3>
            <ul className="space-y-2">
              <Item icon={Bold} html={t("guide.s3.bold")} />
              <Item icon={Italic} html={t("guide.s3.italic")} />
              <Item icon={Underline} html={t("guide.s3.underline")} />
            </ul>
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s3.headings")}</h3>
            <ul className="space-y-2">
              <Item icon={Heading} html={t("guide.s3.h2")} />
              <Item icon={Heading} html={t("guide.s3.h3")} />
            </ul>
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s3.lists")}</h3>
            <ul className="space-y-2">
              <Item icon={List} html={t("guide.s3.bulletList")} />
              <Item icon={ListOrdered} html={t("guide.s3.numberedList")} />
            </ul>
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s3.links")}</h3>
            <p className="font-ui text-sm text-muted-foreground leading-relaxed">
              <Link size={13} className="inline -mt-0.5 mr-1" />
              {t("guide.s3.linksText")}
            </p>
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s3.alignment")}</h3>
            <ul className="space-y-2">
              <Item icon={AlignLeft} html={t("guide.s3.alignLeft")} />
              <Item icon={AlignCenter} html={t("guide.s3.alignCenter")} />
              <Item icon={AlignRight} html={t("guide.s3.alignRight")} />
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "images",
      titleKey: "guide.s4.title",
      icon: Image,
      markdownKey: "guide.s4.markdown",
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s4.inserting")}</h3>
            <p className="font-ui text-sm text-muted-foreground leading-relaxed">{t("guide.s4.insertingText")}</p>
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s4.conflict")}</h3>
            <p className="font-ui text-sm text-muted-foreground leading-relaxed">{t("guide.s4.conflictText")}</p>
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s4.caption")}</h3>
            <p className="font-ui text-sm text-muted-foreground leading-relaxed">{t("guide.s4.captionText")}</p>
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s4.selecting")}</h3>
            <p className="font-ui text-sm text-muted-foreground leading-relaxed mb-3">{t("guide.s4.selectingText")}</p>
            <div className="space-y-3 pl-1">
              <div>
                <h4 className="font-ui text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">{t("guide.s4.alignment")}</h4>
                <ul className="space-y-1.5">
                  <Item icon={AlignLeft} html={t("guide.s4.alignLeft")} />
                  <Item icon={AlignCenter} html={t("guide.s4.alignCenter")} />
                  <Item icon={AlignRight} html={t("guide.s4.alignRight")} />
                </ul>
              </div>
              <div>
                <h4 className="font-ui text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">{t("guide.s4.textWrap")}</h4>
                <ul className="space-y-1.5">
                  <Item icon={PenTool} html={t("guide.s4.floatLeft")} />
                  <Item icon={PenTool} html={t("guide.s4.floatRight")} />
                  <Item icon={RotateCcw} html={t("guide.s4.floatDefault")} />
                </ul>
              </div>
              <div>
                <h4 className="font-ui text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">{t("guide.s4.resize")}</h4>
                <ul className="space-y-1.5">
                  <Item icon={Maximize2} html={t("guide.s4.resizeDrag")} />
                  <Item icon={Maximize2} html={t("guide.s4.resizeAutoFloat")} />
                </ul>
              </div>
              <div>
                <h4 className="font-ui text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">{t("guide.s4.move")}</h4>
                <ul className="space-y-1.5">
                  <Item icon={ArrowUp} html={t("guide.s4.moveUp")} />
                  <Item icon={ArrowDown} html={t("guide.s4.moveDown")} />
                </ul>
              </div>
              <div>
                <h4 className="font-ui text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">{t("guide.s4.deleteSection")}</h4>
                <ul className="space-y-1.5">
                  <Item icon={Trash2} html={t("guide.s4.deleteText")} />
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "publishing",
      titleKey: "guide.s5.title",
      icon: Send,
      markdownKey: "guide.s5.markdown",
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s5.status")}</h3>
            <ul className="space-y-2">
              <Item icon={ChevronRight} html={t("guide.s5.draft")} />
              <Item icon={ChevronRight} html={t("guide.s5.published")} />
            </ul>
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s5.scheduled")}</h3>
            <p className="font-ui text-sm text-muted-foreground leading-relaxed">
              <Calendar size={13} className="inline -mt-0.5 mr-1" />
              {t("guide.s5.scheduledText")}
            </p>
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s5.featured")}</h3>
            <p className="font-ui text-sm text-muted-foreground leading-relaxed">
              <Star size={13} className="inline -mt-0.5 mr-1" />
              {t("guide.s5.featuredText")}
            </p>
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s5.preview")}</h3>
            <p className="font-ui text-sm text-muted-foreground leading-relaxed">
              <Eye size={13} className="inline -mt-0.5 mr-1" />
              {t("guide.s5.previewText")}
            </p>
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s5.trash")}</h3>
            <p className="font-ui text-sm text-muted-foreground leading-relaxed">
              <Trash2 size={13} className="inline -mt-0.5 mr-1" />
              {t("guide.s5.trashText")}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "permissions",
      titleKey: "guide.s6.title",
      icon: Shield,
      markdownKey: "guide.s6.markdown",
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s6.canDo")}</h3>
            <ul className="space-y-2">
              <Item icon={ChevronRight} html={t("guide.s6.can1")} />
              <Item icon={ChevronRight} html={t("guide.s6.can2")} />
              <Item icon={ChevronRight} html={t("guide.s6.can3")} />
              <Item icon={ChevronRight} html={t("guide.s6.can4")} />
            </ul>
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s6.cannotDo")}</h3>
            <ul className="space-y-2">
              <Item icon={ChevronRight} html={t("guide.s6.cannot1")} />
              <Item icon={ChevronRight} html={t("guide.s6.cannot2")} />
              <Item icon={ChevronRight} html={t("guide.s6.cannot3")} />
              <Item icon={ChevronRight} html={t("guide.s6.cannot4")} />
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "ai-assistant",
      titleKey: "guide.s7.title",
      icon: Sparkles,
      markdownKey: "guide.s7.markdown",
      content: (
        <div className="space-y-4">
          <p className="font-ui text-sm text-muted-foreground leading-relaxed">{t("guide.s7.intro")}</p>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s7.metadata")}</h3>
            <p className="font-ui text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: t("guide.s7.metadataText") }} />
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s7.writing")}</h3>
            <p className="font-ui text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: t("guide.s7.writingText") }} />
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s7.research")}</h3>
            <p className="font-ui text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: t("guide.s7.researchText") }} />
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s7.checks")}</h3>
            <p className="font-ui text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: t("guide.s7.checksText") }} />
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{t("guide.s7.toggle")}</h3>
            <p className="font-ui text-sm text-muted-foreground leading-relaxed">{t("guide.s7.toggleText")}</p>
          </div>
        </div>
      ),
    },
  ];

  const docsToMarkdown = () => {
    const lines: string[] = [t("guide.markdownHeader"), ""];
    for (const section of sections) {
      lines.push(t(section.markdownKey));
      lines.push("");
    }
    return lines.join("\n");
  };

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(docsToMarkdown());
      toast.success(t("common.markdownCopied"));
    } catch {
      toast.error(t("common.copyFailed"));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-[860px] print:max-w-none">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {t("guide.title")}
            </h1>
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" size="sm" onClick={handleCopyMarkdown}>
                <Copy size={14} /> {t("common.copyMarkdown")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer size={14} /> {t("common.exportPdf")}
              </Button>
            </div>
          </div>
          <p className="font-ui text-base text-muted-foreground leading-relaxed max-w-[680px]">
            {t("guide.subtitle")}
          </p>
        </div>

        <Card className="print:hidden">
          <CardContent className="pt-5 pb-4">
            <h2 className="font-heading text-sm font-bold text-foreground mb-3">{t("guide.contents")}</h2>
            <nav className="space-y-1.5">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-center gap-2 font-ui text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <s.icon size={14} className="text-primary shrink-0" />
                  {t(s.titleKey)}
                </a>
              ))}
            </nav>
          </CardContent>
        </Card>

        {sections.map((section) => (
          <div key={section.id} id={section.id} className="space-y-4 scroll-mt-20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <section.icon size={18} className="text-primary" />
              </div>
              <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
                {t(section.titleKey)}
              </h2>
            </div>
            <Separator />
            <Card>
              <CardContent className="pt-5">
                {section.content}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminEditorGuide;
