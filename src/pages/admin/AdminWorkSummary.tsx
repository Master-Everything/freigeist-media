import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Printer, Copy, Calendar, Layers, Sparkles, Wrench,
  Database, Shield, Layout, PenTool, Rss, Import, Users,
  Image, Container, Eye, Search, Video, Smartphone,
  BookOpen, FileText, Tags, BarChart3, Bot, Trash2,
  UserCheck, GripVertical, Newspaper
} from "lucide-react";
import { toast } from "sonner";

const phases = [
  {
    id: "foundation",
    title: "Phase 1 — Foundation",
    period: "Feb 17 – 22, 2026",
    icon: Layers,
    summary: "Core platform architecture, database design, authentication, public frontend, admin CMS, and content import infrastructure.",
    items: [
      { icon: Database, text: "Database schema design: posts, categories, profiles, user_roles tables with Row-Level Security policies" },
      { icon: Shield, text: "Authentication system with invite-only registration and role-based access control (admin / editor)" },
      { icon: Layout, text: "Public frontend: homepage with hero articles, category filtering, article pages with reading progress bar" },
      { icon: PenTool, text: "Admin dashboard with post CRUD, Tiptap 3 rich-text editor, inline image upload to storage" },
      { icon: Rss, text: "RSS 2.0 feed generation via Edge Function for external syndication" },
      { icon: Import, text: "Website import tool: scrape external pages and create draft posts automatically" },
      { icon: FileText, text: "CSV and Markdown bulk import Edge Functions for batch content migration" },
      { icon: Users, text: "User management with invite flow, password-set page, and admin user listing" },
      { icon: Image, text: "WebP batch image converter with conflict detection panel" },
      { icon: Container, text: "Docker and Docker Compose configuration for self-hosted deployment" },
    ],
  },
  {
    id: "polish",
    title: "Phase 2 — Polish & UX",
    period: "Feb 27 – 28, 2026",
    icon: Sparkles,
    summary: "Refined the reader experience with an advanced image lightbox and improved import reliability.",
    items: [
      { icon: Eye, text: "Image lightbox with pinch-to-zoom, mouse-wheel zoom, and drag-to-pan" },
      { icon: Search, text: "Multi-image navigation: swipe gestures, keyboard arrows, chevron buttons, counter badge" },
      { icon: Image, text: "Lightbox auto-open bug fix to prevent unintended modal triggers" },
      { icon: Import, text: "Website import image deduplication with GoDaddy / Wix resize-suffix normalization" },
    ],
  },
  {
    id: "admin",
    title: "Phase 3 — Editor & Admin Improvements",
    period: "Mar 2 – 3, 2026",
    icon: Wrench,
    summary: "Enhanced the editor, added comprehensive admin documentation, and implemented export utilities.",
    items: [
      { icon: PenTool, text: "Editor image controls: click-to-select with floating toolbar (delete, move up / move down)" },
      { icon: Tags, text: "Bullet and numbered list styling fix for consistent rendering" },
      { icon: BookOpen, text: "Admin changelog page with per-day Copy Markdown and PDF export" },
      { icon: FileText, text: "Admin documentation page: full technical reference for the platform" },
      { icon: Layout, text: "Admin project description page: professional overview with feature catalogue" },
      { icon: Copy, text: "Copy as Markdown functionality for documentation and project pages" },
      { icon: Smartphone, text: "Safari PDF download fix (setTimeout + focus instead of onload)" },
    ],
  },
  {
    id: "roles",
    title: "Phase 4 — Roles, Permissions & Content Management",
    period: "Mar 10 – 15, 2026",
    icon: UserCheck,
    summary: "Expanded the role system with editor ownership policies, added a trash system for safe content deletion, and introduced image resize controls.",
    items: [
      { icon: Shield, text: "Editor roles and ownership-based update policies via created_by column on posts" },
      { icon: UserCheck, text: "Editorial Manager role with full post read/write access across all authors" },
      { icon: Users, text: "Profile visibility for editors and editorial managers with RLS policies" },
      { icon: Trash2, text: "Soft-delete trash system with restore and permanent delete functionality" },
      { icon: Users, text: "Post list author info display via useAuthorLookup batch hook" },
      { icon: GripVertical, text: "Image resize drag handles (20–100% width) with float auto-sizing" },
      { icon: PenTool, text: "Auto-fill author name from logged-in user profile on post creation" },
    ],
  },
  {
    id: "ai",
    title: "Phase 5 — AI-Powered Editorial Tools",
    period: "Mar 16 – 18, 2026",
    icon: Bot,
    summary: "Integrated AI-powered editorial assistance with article quality checks, metadata suggestions, research tools, and a collapsible sidebar in the post editor.",
    items: [
      { icon: Newspaper, text: "Homepage headline section with i18n support for English and German" },
      { icon: BookOpen, text: "Editor Guide page with image resize and float documentation" },
      { icon: Bot, text: "AI Metadata panel: title suggestions, subtitle, category, reading time with one-click apply" },
      { icon: Bot, text: "AI article check panels: Journalism Standards, Press Release, Company News with check history" },
      { icon: Search, text: "AI Research panel: Web Research, Brainstorm Headlines, Find Sources, Generate Outline" },
      { icon: Database, text: "article_checks table with check history and author attribution" },
      { icon: Layout, text: "Collapsible AI right sidebar in the post editor with accordion sections" },
      { icon: Image, text: "Image upload conflict handling with rename / overwrite options" },
      { icon: Shield, text: "Editorial manager storage permissions for post-images bucket" },
      { icon: Database, text: "Removal of redundant author_name/author_role columns from posts" },
      { icon: Bot, text: "Self-hosted AI assistant fallback with configurable OPENAI_API_KEY and model" },
    ],
  },
  {
    id: "image-ux",
    title: "Phase 6 — Image Insertion & UX Overhaul",
    period: "Mar 21 – 24, 2026",
    icon: Image,
    summary: "Overhauled the image insertion pipeline with inline WebP conversion, inline conflict resolution with side-by-side preview, and improved paste handling for cross-tab images.",
    items: [
      { icon: Eye, text: "Smart scroll behavior: only scroll when inserted image is outside viewport" },
      { icon: Image, text: "Inline WebP conversion panel inside figure nodes, replacing top-of-editor panel" },
      { icon: Image, text: "Inline image conflict resolution with side-by-side comparison of existing and new image" },
      { icon: Import, text: "Paste priority fix: raw image data preferred over HTML for cross-tab image pasting" },
      { icon: Layout, text: "PendingImageContext for async image upload communication between editor and node views" },
    ],
  },
];

const stats = [
  { label: "Pages", value: "~20" },
  { label: "Components", value: "40+" },
  { label: "Edge Functions", value: "11" },
  { label: "DB Migrations", value: "15+" },
  { label: "Duration", value: "~5 weeks" },
];

function summaryToMarkdown(): string {
  const lines: string[] = [];
  lines.push("# AVIS Umbrella — Work Summary");
  lines.push("");
  lines.push("**Project Timeline:** Feb 17 – Mar 24, 2026 (~5 weeks)");
  lines.push("");

  for (const phase of phases) {
    lines.push(`## ${phase.title}`);
    lines.push(`*${phase.period}*`);
    lines.push("");
    lines.push(phase.summary);
    lines.push("");
    for (const item of phase.items) {
      lines.push(`- ${item.text}`);
    }
    lines.push("");
  }

  lines.push("## Project Statistics");
  lines.push("");
  lines.push("| Metric | Value |");
  lines.push("| --- | --- |");
  for (const s of stats) {
    lines.push(`| ${s.label} | ${s.value} |`);
  }
  lines.push("");

  return lines.join("\n");
}

async function handleCopyMarkdown() {
  try {
    await navigator.clipboard.writeText(summaryToMarkdown());
    toast.success("Markdown in die Zwischenablage kopiert");
  } catch {
    toast.error("Kopieren fehlgeschlagen");
  }
}

function handlePrint() {
  window.print();
}

const AdminWorkSummary = () => (
  <AdminLayout>
    <div className="space-y-10 max-w-[860px] print:max-w-none">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Work Summary
          </h1>
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handleCopyMarkdown}>
              <Copy size={14} /> Copy Markdown
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer size={14} /> Export PDF
            </Button>
          </div>
        </div>
        <p className="font-ui text-base text-muted-foreground leading-relaxed max-w-[680px]">
          A chronological overview of the development work completed on the AVIS Umbrella platform from inception to current state.
        </p>
        <p className="font-ui text-sm text-muted-foreground">
          <Calendar size={13} className="inline -mt-0.5 mr-1" />
          Feb 17 – Mar 24, 2026 · ~5 weeks
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-5 gap-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3 text-center">
              <div className="font-heading text-lg font-bold text-foreground">{s.value}</div>
              <div className="font-ui text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Phases */}
      {phases.map((phase) => (
        <div key={phase.id} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <phase.icon size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">{phase.title}</h2>
              <span className="font-ui text-xs text-muted-foreground">{phase.period}</span>
            </div>
          </div>
          <Separator />
          <p className="font-ui text-sm text-muted-foreground leading-relaxed">{phase.summary}</p>
          <Card>
            <CardContent className="pt-5 space-y-3">
              {phase.items.map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <item.icon size={15} className="text-muted-foreground mt-0.5 shrink-0" />
                  <span className="font-ui text-sm text-muted-foreground">{item.text}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ))}

      {/* Footer */}
      <div className="flex items-center gap-2 pt-2">
        <BarChart3 size={14} className="text-muted-foreground" />
        <span className="font-ui text-xs text-muted-foreground">
          Generated from project changelog, migration history, and development sessions.
        </span>
      </div>
    </div>
  </AdminLayout>
);

export default AdminWorkSummary;
