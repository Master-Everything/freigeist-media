import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Printer, Globe, Layout, Shield, Server, Database, Users, FileText,
  Search, Rss, Smartphone, Image, Import, PenTool, BookOpen, Lock,
  Container, Zap, FolderOpen, Eye, Video, Tags, Newspaper, Copy
} from "lucide-react";
import { toast } from "sonner";

const Section = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon size={18} className="text-primary" />
      </div>
      <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">{title}</h2>
    </div>
    <Separator />
    {children}
  </div>
);

const FeatureItem = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <div className="flex gap-3 items-start">
    <Icon size={15} className="text-muted-foreground mt-0.5 shrink-0" />
    <div>
      <span className="font-ui text-sm font-medium text-foreground">{title}</span>
      <span className="font-ui text-sm text-muted-foreground"> — {description}</span>
    </div>
  </div>
);

const techStack = [
  { layer: "Frontend", tech: "React 18, TypeScript, Vite, Tailwind CSS" },
  { layer: "UI", tech: "shadcn/ui, Radix Primitives, Lucide Icons" },
  { layer: "Editor", tech: "Tiptap 3 (ProseMirror)" },
  { layer: "State", tech: "TanStack Query v5, React Hook Form, Zod" },
  { layer: "Backend", tech: "Supabase (Postgres, Auth, Storage, Edge Functions)" },
  { layer: "Hosting", tech: "Lovable Cloud / Docker self-hosting" },
];

function handlePrint() {
  window.print();
}

function projectToMarkdown(): string {
  const lines: string[] = [];
  lines.push("# AVIS Umbrella");
  lines.push("");
  lines.push("A modern, editorial-grade news & insights platform built for corporate communications teams. Designed to publish, manage, and distribute branded content with speed and precision.");
  lines.push("");

  lines.push("## Purpose & Vision");
  lines.push("");
  lines.push("**AVIS Umbrella** is a purpose-built content platform that enables communications teams to publish news articles, industry insights, and internal updates through a streamlined editorial workflow.");
  lines.push("");
  lines.push("The platform prioritises **speed of publication**, **visual consistency**, and **editorial control** — giving non-technical editors a powerful CMS while maintaining a polished, brand-aligned reader experience.");
  lines.push("");
  lines.push("Content is organised by categories, surfaced through a curated homepage with featured articles, and distributed via RSS. The admin panel provides full lifecycle management from draft to publication.");
  lines.push("");

  const sections = [
    { title: "Frontend Features", items: [
      ["Hero & Featured Articles", "Curated homepage with large hero cards, featured flags, and chronological listing with pagination."],
      ["Category System", "Colour-coded category pills, slug-based filtering, and icon-mapped categories for visual distinction."],
      ["Reading Experience", "Full-width article layout with reading progress bar, estimated reading time, and social share buttons."],
      ["Image Lightbox", "Click-to-zoom image viewer with keyboard navigation for article images and figures."],
      ["Video Embeds", "Inline video support with responsive iframe rendering and native video player fallback."],
      ["Search & Navigation", "Full-text search dialog across all published posts with instant results."],
      ["RSS Feed", "Server-rendered RSS 2.0 feed via Edge Function for syndication and external readers."],
      ["Responsive Design", "Fully responsive layout from mobile to desktop with adaptive typography and spacing."],
      ["Legal Pages", "Static Impressum and Datenschutz pages for DACH-region legal compliance."],
    ]},
    { title: "Admin & CMS Features", items: [
      ["Rich-Text Editor", "Tiptap 3 editor with image upload, figure captions, video embeds, text alignment, links, and underline support."],
      ["Post Management", "Draft/published workflow, featured article flag, slug generation, category assignment, and soft-delete."],
      ["Content Import", "Bulk import from CSV, Markdown files, and website scraping via dedicated Edge Functions."],
      ["Image Management", "Gallery browser, WebP batch conversion, conflict detection panel, and inline image insertion."],
      ["User Management", "Invite-based user creation, password reset flow, role assignment (admin/editor), and user listing."],
      ["Documentation & Changelog", "Built-in admin documentation page and versioned changelog with PDF export."],
    ]},
    { title: "Backend & Infrastructure", items: [
      ["Authentication", "Email/password auth with invite-only registration, session management, and protected admin routes."],
      ["Role-Based Access", "Admin and editor roles stored in a dedicated user_roles table with a security-definer helper function."],
      ["Row-Level Security", "All tables protected by RLS policies ensuring users can only access data appropriate to their role."],
      ["Edge Functions", "Serverless functions for RSS generation, admin user listing, password management, and content imports."],
      ["File Storage", "Supabase Storage for article images with public read access and authenticated upload policies."],
      ["Self-Hosting", "Docker and Docker Compose configuration for on-premise deployment with full environment control."],
    ]},
  ];

  for (const section of sections) {
    lines.push(`## ${section.title}`);
    lines.push("");
    for (const [title, desc] of section.items) {
      lines.push(`- **${title}** — ${desc}`);
    }
    lines.push("");
  }

  lines.push("## Tech Stack");
  lines.push("");
  lines.push("| Layer | Technology |");
  lines.push("| --- | --- |");
  for (const row of techStack) {
    lines.push(`| ${row.layer} | ${row.tech} |`);
  }
  lines.push("");

  return lines.join("\n");
}

async function handleCopyMarkdown() {
  try {
    await navigator.clipboard.writeText(projectToMarkdown());
    toast.success("Markdown in die Zwischenablage kopiert");
  } catch {
    toast.error("Kopieren fehlgeschlagen");
  }
}

const AdminProject = () => (
  <AdminLayout>
    <div className="space-y-10 max-w-[860px] print:max-w-none">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            AVIS Umbrella
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
          A modern, editorial-grade news &amp; insights platform built for corporate communications teams.
          Designed to publish, manage, and distribute branded content with speed and precision.
        </p>
      </div>

      {/* Purpose & Vision */}
      <Section icon={Globe} title="Purpose & Vision">
        <Card>
          <CardContent className="pt-5 space-y-3 font-ui text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">AVIS Umbrella</strong> is a purpose-built content platform that enables communications teams to publish news articles, industry insights, and internal updates through a streamlined editorial workflow.
            </p>
            <p>
              The platform prioritises <strong className="text-foreground">speed of publication</strong>, <strong className="text-foreground">visual consistency</strong>, and <strong className="text-foreground">editorial control</strong> — giving non-technical editors a powerful CMS while maintaining a polished, brand-aligned reader experience.
            </p>
            <p>
              Content is organised by categories, surfaced through a curated homepage with featured articles, and distributed via RSS. The admin panel provides full lifecycle management from draft to publication.
            </p>
          </CardContent>
        </Card>
      </Section>

      {/* Frontend Features */}
      <Section icon={Layout} title="Frontend Features">
        <Card>
          <CardContent className="pt-5 space-y-3">
            <FeatureItem icon={Newspaper} title="Hero & Featured Articles" description="Curated homepage with large hero cards, featured flags, and chronological listing with pagination." />
            <FeatureItem icon={Tags} title="Category System" description="Colour-coded category pills, slug-based filtering, and icon-mapped categories for visual distinction." />
            <FeatureItem icon={Eye} title="Reading Experience" description="Full-width article layout with reading progress bar, estimated reading time, and social share buttons." />
            <FeatureItem icon={Image} title="Image Lightbox" description="Click-to-zoom image viewer with keyboard navigation for article images and figures." />
            <FeatureItem icon={Video} title="Video Embeds" description="Inline video support with responsive iframe rendering and native video player fallback." />
            <FeatureItem icon={Search} title="Search & Navigation" description="Full-text search dialog across all published posts with instant results." />
            <FeatureItem icon={Rss} title="RSS Feed" description="Server-rendered RSS 2.0 feed via Edge Function for syndication and external readers." />
            <FeatureItem icon={Smartphone} title="Responsive Design" description="Fully responsive layout from mobile to desktop with adaptive typography and spacing." />
            <FeatureItem icon={FileText} title="Legal Pages" description="Static Impressum and Datenschutz pages for DACH-region legal compliance." />
          </CardContent>
        </Card>
      </Section>

      {/* Admin / CMS Features */}
      <Section icon={PenTool} title="Admin & CMS Features">
        <Card>
          <CardContent className="pt-5 space-y-3">
            <FeatureItem icon={BookOpen} title="Rich-Text Editor" description="Tiptap 3 editor with image upload, figure captions, video embeds, text alignment, links, and underline support." />
            <FeatureItem icon={FileText} title="Post Management" description="Draft/published workflow, featured article flag, slug generation, category assignment, and soft-delete." />
            <FeatureItem icon={Import} title="Content Import" description="Bulk import from CSV, Markdown files, and website scraping via dedicated Edge Functions." />
            <FeatureItem icon={Image} title="Image Management" description="Gallery browser, WebP batch conversion, conflict detection panel, and inline image insertion." />
            <FeatureItem icon={Users} title="User Management" description="Invite-based user creation, password reset flow, role assignment (admin/editor), and user listing." />
            <FeatureItem icon={BookOpen} title="Documentation & Changelog" description="Built-in admin documentation page and versioned changelog with PDF export." />
          </CardContent>
        </Card>
      </Section>

      {/* Backend & Infrastructure */}
      <Section icon={Shield} title="Backend & Infrastructure">
        <Card>
          <CardContent className="pt-5 space-y-3">
            <FeatureItem icon={Lock} title="Authentication" description="Email/password auth with invite-only registration, session management, and protected admin routes." />
            <FeatureItem icon={Users} title="Role-Based Access" description="Admin and editor roles stored in a dedicated user_roles table with a security-definer helper function." />
            <FeatureItem icon={Database} title="Row-Level Security" description="All tables protected by RLS policies ensuring users can only access data appropriate to their role." />
            <FeatureItem icon={Zap} title="Edge Functions" description="Serverless functions for RSS generation, admin user listing, password management, and content imports." />
            <FeatureItem icon={FolderOpen} title="File Storage" description="Supabase Storage for article images with public read access and authenticated upload policies." />
            <FeatureItem icon={Container} title="Self-Hosting" description="Docker and Docker Compose configuration for on-premise deployment with full environment control." />
          </CardContent>
        </Card>
      </Section>

      {/* Tech Stack */}
      <Section icon={Server} title="Tech Stack">
        <Card>
          <CardContent className="pt-5">
            <div className="grid grid-cols-[100px_1fr] gap-y-2.5 font-ui text-sm">
              {techStack.map((row) => (
                <div key={row.layer} className="contents">
                  <span className="font-medium text-foreground">{row.layer}</span>
                  <span className="text-muted-foreground">{row.tech}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Section>
    </div>
  </AdminLayout>
);

export default AdminProject;
