import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Printer, Copy, Clock, Users, Layers, Sparkles, Wrench,
  Calculator, Timer, Database, Shield, Layout, PenTool,
  Rss, Image, Container, Eye, Search, Import, BookOpen, Calendar,
  FileText, Smartphone, FolderSync, Bot, Trash2, UserCheck,
  GripVertical, Newspaper, Crown, Server
} from "lucide-react";
import { toast } from "sonner";

const teamStats = [
  { icon: Users, value: "2 + 1 AI", label: "Team Size" },
  { icon: Bot, value: "Co-pilot", label: "AI Developer" },
  { icon: Crown, value: "Lead Dev", label: "3 h/day · 6 d/wk" },
  { icon: Server, value: "Sysadmin", label: "2 h/day · 6 d/wk" },
  { icon: Timer, value: "5 Weeks", label: "Sprint Duration" },
  { icon: Clock, value: "~450 h", label: "Total Person-Hours" },
];

interface SubTask {
  icon: React.ElementType;
  title: string;
  description: string;
  hours: string;
  steps: string[];
}

interface Phase {
  icon: React.ElementType;
  title: string;
  hours: string;
  subTasks: SubTask[];
}

const phaseBreakdown: Phase[] = [
  {
    icon: Layers,
    title: "Phase 1 — Foundation",
    hours: "~90 h",
    subTasks: [
      {
        icon: Database,
        title: "Database & Security",
        description: "Schema design for 4 tables (posts, categories, profiles, user_roles), Row-Level Security policies, has_role security-definer function, migration scripts",
        hours: "~10–12 h",
        steps: [
          "Design and create the posts table with columns for title, slug, content (HTML), excerpt, image_url, status (draft/published), featured flag, author reference, category reference, and timestamps. Define appropriate column types, defaults, and nullable constraints.",
          "Design and create the categories table with name, slug, and color columns. Seed initial category data for the publication's topic areas.",
          "Design and create the profiles table linked to auth.users via user_id. Include display_name and avatar_url columns to store user-facing information without modifying the protected auth schema.",
          "Design and create the user_roles table with a custom app_role enum (admin, editor, user). Implement a unique constraint on (user_id, role) to prevent duplicate role assignments.",
          "Write Row-Level Security (RLS) policies for every table: public read access for published posts, authenticated-only write access scoped by role, profile self-management policies.",
          "Create the has_role() security-definer function that safely checks role membership without triggering recursive RLS evaluation. Use SECURITY DEFINER with a pinned search_path.",
          "Write and test migration scripts for the complete schema, ensuring idempotent execution and rollback safety.",
        ],
      },
      {
        icon: Shield,
        title: "Authentication System",
        description: "Email/password auth, invite-only registration, session management, protected route guards, password-set page",
        hours: "~8–10 h",
        steps: [
          "Implement email/password sign-up and login forms with validation using react-hook-form and zod schemas. Handle error states for invalid credentials, network failures, and rate limiting.",
          "Build the invite-only registration flow: admins create user accounts via an edge function, the new user receives a link to the password-set page where they choose their password on first login.",
          "Implement session management with automatic token refresh using the Supabase auth client. Handle session expiry gracefully by redirecting to the login page.",
          "Create the ProtectedRoute component that checks authentication state and role membership before rendering admin pages. Redirect unauthenticated users to /admin/login.",
          "Build the /set-password page that validates the recovery token from the URL, presents a password form with confirmation field, and calls the auth API to update the user's password.",
        ],
      },
      {
        icon: Layout,
        title: "Public Frontend",
        description: "Homepage with hero article, category pills, article listing with pagination, article detail page with reading progress bar, responsive layout",
        hours: "~12–16 h",
        steps: [
          'Build the homepage layout with a hero section that prominently displays the latest featured article with its image, title, excerpt, and publication date. Include a "read more" call-to-action.',
          'Implement the category pill bar — a horizontally scrollable row of colored badges that filter the article listing by category. Highlight the active category and support an "all" state.',
          "Create the article listing grid with responsive columns (1 on mobile, 2–3 on desktop). Each card shows a thumbnail, title, excerpt, category badge, date, and author name.",
          'Implement cursor-based or offset pagination for the article listing with "load more" or page navigation controls. Ensure the URL reflects the current page for shareability.',
          "Build the article detail page with full HTML content rendering, a hero image, publication metadata (date, author, category), and social share buttons.",
          "Add a reading progress bar that tracks scroll position relative to article content length and displays as a thin colored bar fixed to the top of the viewport.",
          "Ensure full responsive design across mobile, tablet, and desktop breakpoints. Test navigation, typography scaling, and image aspect ratios at each size.",
        ],
      },
      {
        icon: PenTool,
        title: "Rich-Text Editor & CMS",
        description: "Tiptap 3 integration with image upload, figure captions, video embeds, text alignment, links; post CRUD with draft/published workflow, slug generation, featured flag",
        hours: "~14–18 h",
        steps: [
          "Integrate Tiptap 3 as the core editor with the StarterKit extension bundle (paragraphs, headings, bold, italic, code, blockquotes, lists, hard breaks, horizontal rules).",
          "Add the Image extension with a custom upload handler that intercepts paste/drop events, uploads the file to storage, and inserts the resulting URL into the document.",
          "Build a custom Figure extension (TipTap node) that wraps images in <figure> tags with an editable <figcaption> element for image captions.",
          "Integrate the Video extension to support embedded video content via URL input, rendering responsive <iframe> elements within the editor.",
          "Add the TextAlign extension for left, center, right, and justify alignment controls. Wire these to toolbar buttons with active-state indicators.",
          "Add the Link extension with a URL input popover for creating and editing hyperlinks. Support auto-detection of pasted URLs.",
          "Add the Underline extension and connect it to a toolbar button alongside bold and italic.",
          "Build the post creation/editing form with fields for title (auto-generates slug), excerpt, category selector, featured image upload, featured toggle, and status (draft/published).",
          "Implement slug generation from the title using lowercase, hyphen-separated, special-character-stripped transformation. Allow manual override of the generated slug.",
          "Wire up post CRUD operations: create new post, update existing post, delete with confirmation dialog. Show success/error toasts for each operation.",
        ],
      },
      {
        icon: Rss,
        title: "Edge Functions",
        description: "RSS 2.0 feed generator, admin user listing, admin password management, CSV import, Markdown import, website scraper — 6 serverless functions with JWT verification",
        hours: "~12–14 h",
        steps: [
          "Build the RSS 2.0 feed edge function that queries published posts, formats them as valid RSS XML with title, link, description, pubDate, and guid elements, and returns with application/rss+xml content type.",
          "Build the admin-list-users edge function that calls the Supabase admin API to list all auth users with their metadata. Verify the calling user has admin role via JWT inspection.",
          "Build the admin-set-password edge function that allows admins to set or reset another user's password via the admin API. Include input validation and role verification.",
          "Build the CSV import edge function that parses uploaded CSV files, maps columns to post fields, creates draft posts for each row, and returns a summary of imported/skipped records.",
          "Build the Markdown import edge function that parses .md files with frontmatter (title, date, category), converts the body to HTML, and creates draft posts.",
          "Build the website scraper edge function that fetches a given URL, extracts the main content using DOM parsing, downloads and re-uploads images to storage, and creates a draft post with the cleaned HTML.",
          "Implement consistent JWT verification across all admin edge functions using the Supabase auth helpers. Return 401 for unauthenticated requests and 403 for insufficient roles.",
        ],
      },
      {
        icon: Image,
        title: "Image Pipeline",
        description: "Storage bucket setup, upload utilities, WebP batch converter, image conflict detection panel, gallery browser dialog",
        hours: "~10–12 h",
        steps: [
          "Configure the post-images storage bucket with appropriate access policies: public read for serving images, authenticated write for uploads, admin-only delete.",
          "Build the image upload utility that handles file selection, generates a unique filename, uploads to the storage bucket, and returns the storage path. Support progress tracking.",
          "Implement the WebP batch converter that lists all non-WebP images in the bucket, converts them client-side using Canvas API and toBlob('image/webp'), uploads the WebP version, and updates all database references.",
          "Build the image conflict detection panel that compares image filenames across the bucket, identifies duplicates (same name, different sizes or formats), and presents resolution options (keep, replace, rename).",
          "Create the image gallery browser dialog that lists all images in the storage bucket with thumbnails, displays file size and dimensions, and allows selecting an image for insertion into the editor or as a featured image.",
        ],
      },
      {
        icon: Container,
        title: "Infrastructure",
        description: "Dockerfile (multi-stage Node → nginx), Docker Compose, environment variable configuration, self-hosting documentation",
        hours: "~5–7 h",
        steps: [
          "Write a multi-stage Dockerfile: first stage uses Node to install dependencies and run vite build, second stage copies the built assets into an nginx:alpine image for minimal production serving.",
          "Create docker-compose.yml with the app service, build arguments for environment variables, port mapping, and restart policy.",
          "Add an Nginx image server service to Docker Compose that serves a local ./public-images volume, enabling fully self-hosted image delivery without external storage dependency.",
          "Document all environment variables in .env.local.example with descriptions and default values. Include VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_IMAGE_BASE_URL.",
          "Write self-hosting documentation covering prerequisites, build steps, configuration, and deployment with Docker Compose.",
        ],
      },
    ],
  },
  {
    icon: Sparkles,
    title: "Phase 2 — Polish & UX",
    hours: "~20 h",
    subTasks: [
      {
        icon: Eye,
        title: "Image Lightbox",
        description: "Click-to-zoom viewer, pinch-to-zoom on mobile, mouse-wheel zoom, drag-to-pan, keyboard navigation",
        hours: "~8–10 h",
        steps: [
          "Build a full-screen overlay component that displays a clicked image at maximum viewport size with a dark backdrop. Include close button, click-outside-to-close, and Escape key dismissal.",
          "Implement mouse-wheel zoom with smooth scaling centered on the cursor position. Clamp zoom level between 1× and 5× to prevent excessive scaling.",
          "Add pinch-to-zoom support for touch devices using pointer events. Track two-finger distance changes and map them to the zoom scale factor.",
          "Implement drag-to-pan when zoomed in: track mouse/touch movement and translate the image position accordingly. Constrain panning so the image edges don't leave the viewport.",
          "Add keyboard navigation: Escape to close, arrow keys to move between images when multiple are present, plus/minus for zoom control.",
        ],
      },
      {
        icon: Search,
        title: "Multi-Image Navigation",
        description: "Swipe gestures, arrow key support, chevron buttons, image counter badge, auto-open bug fix",
        hours: "~6–8 h",
        steps: [
          "Detect all images within the current article content and build an ordered index. When the lightbox opens, populate the navigation context with the full image set.",
          "Add left/right chevron buttons overlaid on the lightbox for navigating between images. Hide the appropriate chevron when at the first or last image.",
          "Implement touch swipe gestures for mobile navigation: detect horizontal swipe direction and distance, trigger image transition when the swipe exceeds a threshold.",
          'Add an image counter badge (e.g., "3 / 7") displayed in the lightbox corner to indicate the current position within the image set.',
          "Fix the auto-open bug where the lightbox would trigger unintentionally on page load or content re-render by guarding the open state with explicit user interaction flags.",
        ],
      },
      {
        icon: Import,
        title: "Import Reliability",
        description: "Image deduplication logic, GoDaddy/Wix resize-suffix normalization, URL conflict resolution",
        hours: "~4–6 h",
        steps: [
          "Implement image deduplication logic during website import: before uploading a scraped image, check if a file with the same name (or content hash) already exists in the bucket. Skip the upload if it's a duplicate and reuse the existing path.",
          "Add GoDaddy and Wix resize-suffix normalization: strip URL suffixes like -300×200, _thumb, or query-string resize parameters to identify the canonical image URL before deduplication.",
          "Build URL conflict resolution that handles the case where two different images share the same filename: append a numeric suffix or short hash to disambiguate while preserving the original name for readability.",
        ],
      },
      {
        icon: Search,
        title: "Search",
        description: "Full-text search dialog across published posts with instant results",
        hours: "~3–4 h",
        steps: [
          "Build a search dialog component (triggered by a search icon in the header) using the command/dialog pattern. Include a text input with instant-as-you-type filtering.",
          "Query published posts matching the search term against title and content fields. Use Supabase textSearch or ilike matching with result ranking by relevance.",
          "Display search results as a scrollable list with post title, excerpt snippet, category badge, and date. Clicking a result navigates to the article page and closes the dialog.",
        ],
      },
    ],
  },
  {
    icon: Wrench,
    title: "Phase 3 — Editor & Admin",
    hours: "~30 h",
    subTasks: [
      {
        icon: PenTool,
        title: "Editor Enhancements",
        description: "Click-to-select images with floating toolbar (delete, move up/down), list styling fixes, figure extension",
        hours: "~7–9 h",
        steps: [
          "Implement click-to-select behavior for images in the Tiptap editor: clicking an image node highlights it with a visible selection border and reveals a floating toolbar positioned above the image.",
          "Build the floating image toolbar with actions: delete image (with confirmation), move image up (swap with previous node), and move image down (swap with next node). Disable actions at document boundaries.",
          "Fix list rendering inconsistencies: ensure bullet lists and numbered lists receive proper indentation, marker styling, and nested list support in both the editor view and the public article rendering.",
          "Implement the custom Figure node extension that wraps <img> in <figure> and adds an editable <figcaption> child node. Handle serialization to/from HTML correctly.",
        ],
      },
      {
        icon: BookOpen,
        title: "Admin Documentation Suite",
        description: "Project overview page, technical documentation page, changelog page, work summary page — all with Copy Markdown and PDF export",
        hours: "~10–12 h",
        steps: [
          "Build the Project overview page (/admin/project) with a professional description of the platform, a feature catalogue organized by area (content, admin, infrastructure), and technology stack listing.",
          "Build the Technical Documentation page (/admin/documentation) with detailed coverage of database schema, API endpoints, edge functions, authentication flow, image pipeline, and deployment process.",
          "Build the Changelog page (/admin/changelog) that presents development work organized by date, with each day showing the changes made. Include per-day and full-document Copy Markdown and PDF export.",
          "Build the Work Summary page (/admin/work-summary) as a high-level chronological narrative of each development phase with key deliverables listed.",
          "Implement Copy as Markdown for each documentation page: serialize the page content to well-formatted Markdown and copy to clipboard with a success toast.",
          "Implement PDF export using window.print() with print-specific CSS: hide navigation and action buttons, adjust layout to full width, ensure proper page breaks.",
        ],
      },
      {
        icon: Smartphone,
        title: "Cross-Browser Fixes",
        description: "Safari PDF download workaround (setTimeout + focus), responsive admin layout adjustments",
        hours: "~2–3 h",
        steps: [
          "Fix Safari PDF download: replace iframe.onload approach with setTimeout + window.focus() workaround, since Safari blocks programmatic focus changes during synchronous print flows.",
          "Adjust responsive admin layout for narrow viewports: ensure the sidebar collapses properly, form fields stack vertically, and table views scroll horizontally without breaking the layout.",
        ],
      },
      {
        icon: FolderSync,
        title: "Portable Image Paths",
        description: "Relative URL storage system with configurable base URL, data migration, Docker image server",
        hours: "~5–7 h",
        steps: [
          "Create a central imageUrl.ts utility with toRelativePath() and toAbsoluteUrl() functions. Define IMAGE_BASE_URL from VITE_IMAGE_BASE_URL environment variable, defaulting to the current storage URL.",
          "Update all write paths (upload, import, batch convert) to store relative paths like post-images/filename.webp instead of full absolute URLs.",
          "Update all read paths (article pages, thumbnails, editor, gallery, preview) to resolve relative paths to absolute URLs at render time using the configurable base URL.",
          "Write a SQL migration to strip existing absolute storage URLs from the image_url and content columns in the posts table, converting them to relative paths.",
          "Add the Nginx image server container to Docker Compose so self-hosted deployments can serve images locally from a ./public-images volume mount.",
        ],
      },
    ],
  },
  {
    icon: UserCheck,
    title: "Phase 4 — Roles & Content Management",
    hours: "~55 h",
    subTasks: [
      {
        icon: Shield,
        title: "Role System Expansion",
        description: "Editor ownership policies, editorial_manager role, profile visibility RLS, role selector updates",
        hours: "~10–12 h",
        steps: [
          "Add created_by column to the posts table and update RLS policies so editors can only update their own posts while admins retain full access.",
          "Create the editorial_manager role in the app_role enum with full post read/write access across all authors, bridging the gap between editor and admin.",
          "Write RLS policies for profile visibility: editors and editorial managers can view other profiles for author attribution, while regular users cannot.",
          "Update the admin user management UI to support assigning the new editorial_manager role via the role selector dropdown.",
        ],
      },
      {
        icon: Trash2,
        title: "Trash & Author Features",
        description: "Soft-delete with deleted_at, trash tab with restore/permanent delete, useAuthorLookup batch hook, post list author display",
        hours: "~8–10 h",
        steps: [
          "Add deleted_at column to the posts table. Update the post listing query to exclude soft-deleted posts by default.",
          "Build a trash tab in the admin post listing that shows soft-deleted posts with restore and permanent delete actions.",
          "Create the useAuthorLookup hook that batch-fetches author profiles by user_id for efficient display in the post listing table.",
          "Add author name display to the post listing table, showing who created each post alongside the title and status.",
        ],
      },
      {
        icon: GripVertical,
        title: "Image Resize & Float",
        description: "Drag handles on 3 corners, live percentage badge, float auto-sizing logic, Standard/Default width reset",
        hours: "~7–9 h",
        steps: [
          "Add drag handles to three corners of figure nodes in the editor. Track mouse movement to calculate the new width as a percentage of the editor container width.",
          "Display a live percentage badge during resize that updates in real-time as the user drags, showing the current width value.",
          "Implement float auto-sizing logic: when a figure is floated left or right, automatically constrain its maximum width to prevent layout overlap with text content.",
          "Add Standard (100%) and Default width reset buttons to the figure toolbar for quickly restoring common sizes.",
        ],
      },
      {
        icon: BookOpen,
        title: "Editor Guide",
        description: "Full documentation page for image features, float behavior, trash system in EN and DE",
        hours: "~5–6 h",
        steps: [
          "Build the Editor Guide page (/admin/editor-guide) with comprehensive documentation of image insertion, resize controls, and float behavior.",
          "Document the trash system workflow: soft-delete, restore, and permanent delete with clear visual examples.",
          "Implement full i18n support with English and German translations for all guide content.",
          "Add navigation links from the admin sidebar and editor toolbar to the guide page for easy discoverability.",
        ],
      },
    ],
  },
  {
    icon: Bot,
    title: "Phase 5 — AI Editorial Suite",
    hours: "~55 h",
    subTasks: [
      {
        icon: Bot,
        title: "AI Check Panels",
        description: "Three specialized check panels (Journalism, Press Release, Company News), article_checks table, useArticleCheck hook with streaming, CheckResultDialog",
        hours: "~12–14 h",
        steps: [
          "Build the AI Journalism Check panel that analyzes article content against professional journalism standards (objectivity, sourcing, balance, factual accuracy) and returns a structured assessment.",
          "Build the AI Press Release Check panel that evaluates whether content reads like a press release and suggests improvements for editorial independence.",
          "Build the AI Company News Check panel that identifies promotional language, corporate bias, and suggests neutral alternatives.",
          "Create the article_checks database table to persist check results with check_type, result, created_by, and post_id columns. Enable RLS for authenticated access.",
          "Build the useArticleCheck hook with streaming response support, check history retrieval, and automatic author attribution.",
          "Create the CheckResultDialog component for viewing full check results in an expanded modal with Markdown rendering and copy functionality.",
        ],
      },
      {
        icon: Bot,
        title: "AI Metadata Panel",
        description: "Content analysis for title/subtitle/category/reading-time suggestions, one-click apply buttons",
        hours: "~7–9 h",
        steps: [
          "Build the AI Metadata panel that analyzes article content and suggests an optimized title based on SEO best practices and editorial guidelines.",
          "Add subtitle suggestion that generates a compelling sub-headline summarizing the article's key message.",
          "Implement category suggestion that matches article content against available categories and recommends the best fit.",
          "Add reading time calculation that estimates minutes based on word count and content complexity, with one-click apply to the post form.",
        ],
      },
      {
        icon: Search,
        title: "AI Research Panel",
        description: "Four research actions with custom prompts, streaming responses, save-to-editor, result persistence",
        hours: "~7–9 h",
        steps: [
          "Build the Web Research action that searches for related articles and background information on the article's topic.",
          "Build the Brainstorm Headlines action that generates multiple alternative headline options with different angles and tones.",
          "Build the Find Sources action that identifies potential expert sources, organizations, and data references relevant to the article topic.",
          "Build the Generate Outline action that creates a structured article outline based on the current content or topic description.",
        ],
      },
      {
        icon: Layout,
        title: "AI Sidebar & Infrastructure",
        description: "Collapsible right sidebar with accordion sections, toggle button, self-hosted AI fallback with configurable provider",
        hours: "~7–9 h",
        steps: [
          "Build the collapsible AI right sidebar component with expand/collapse toggle and persistent state.",
          "Implement accordion sections for each AI tool (Metadata, Writing Assistant, Research, Journalism Check, Press Release Check, Company News Check).",
          "Configure the self-hosted AI assistant fallback using OPENAI_API_KEY environment variable with configurable model selection.",
          "Integrate AI assistant as the primary provider with automatic fallback to self-hosted OpenAI when available.",
        ],
      },
      {
        icon: Database,
        title: "Schema & Permissions",
        description: "Author column removal migration, editorial manager storage policies, homepage headline, conflict panel",
        hours: "~5–7 h",
        steps: [
          "Write a migration to remove the redundant author_name and author_role columns from the posts table, consolidating author data in the profiles table.",
          "Add storage bucket policies for the editorial_manager role to allow image upload and management in the post-images bucket.",
          "Build the homepage headline section with i18n support for dynamic, localized hero section messaging.",
          "Build the image upload conflict panel for handling filename collisions during upload with rename and overwrite options.",
        ],
      },
    ],
  },
  {
    icon: Image,
    title: "Phase 6 — Image Insertion Overhaul",
    hours: "~30 h",
    subTasks: [
      {
        icon: Image,
        title: "Inline Pending Image System",
        description: "PendingImageContext, dataPending figure attribute, placeholder-first insertion, async upload with in-place src update",
        hours: "~10–12 h",
        steps: [
          "Create the PendingImageContext React context to manage communication between RichTextEditor and FigureNodeView for async image operations.",
          "Add the dataPending attribute to the Figure extension that flags a node as awaiting upload, conversion, or conflict resolution.",
          "Implement placeholder-first insertion: immediately insert a figure node with a local blob URL and dataPending flag before any async work begins.",
          "Build the async upload flow that uploads the file in the background and updates the figure node's src attribute in place once the upload completes.",
        ],
      },
      {
        icon: Image,
        title: "Inline WebP Conversion",
        description: "Convert/keep UI inside figure node, removal of top-level WebPConvertPanel, FigureNodeView pending state rendering",
        hours: "~7–9 h",
        steps: [
          "Build the inline WebP conversion UI that renders inside the figure node when dataPending is 'webp-convert', showing convert and keep-original buttons.",
          "Remove the top-level WebPConvertPanel component from the editor layout, moving all conversion interaction to the inline figure UI.",
          "Implement FigureNodeView rendering for the pending state: show a loading spinner during conversion and upload, with progress indication.",
        ],
      },
      {
        icon: Eye,
        title: "Inline Conflict Resolution",
        description: "Side-by-side image comparison, use-existing/rename/cancel buttons inside figure, absolute URL resolution for previews",
        hours: "~5–7 h",
        steps: [
          "Build the inline conflict resolution UI with side-by-side comparison of the existing image and the newly pasted image.",
          "Add action buttons: 'Use existing' (reuses the already-uploaded file), 'Upload with new name' (renames and uploads), and 'Cancel' (removes the figure).",
          "Implement absolute URL resolution using toAbsoluteUrl() for existing image previews, since storage paths are stored as relative URLs.",
        ],
      },
      {
        icon: Import,
        title: "Paste & Scroll Fixes",
        description: "Image data priority over HTML in paste handler, viewport-aware scroll behavior, cross-tab WebP paste fix",
        hours: "~3–4 h",
        steps: [
          "Reorder paste handler logic to check for raw image/* clipboard items before text/html, ensuring cross-tab image pastes use actual pixel data instead of unreachable external URLs.",
          "Implement viewport-aware scroll behavior: only scroll to an inserted image when it falls outside the current viewport, preventing jarring page jumps during mid-article editing.",
          "Fix cross-tab WebP paste by ensuring the paste handler correctly processes image/webp MIME types from clipboard items.",
        ],
      },
    ],
  },
];

function estimateToMarkdown(): string {
  const lines: string[] = [];
  lines.push("# Avis News platform development effort");
  lines.push("");
  lines.push("Implementation of the project in a five-week sprint with 2 developers, each pair-programming with one AI developer for ~5 hours per day, 6 days per week.");
  lines.push("");

  lines.push("## Team & Effort");
  lines.push("");
  lines.push("| Metric | Value |");
  lines.push("| --- | --- |");
  for (const s of teamStats) {
    lines.push(`| ${s.label} | ${s.value} |`);
  }
  lines.push(`| Estimated Total Cost | ~$64,200 |`);
  lines.push(`| — 2 Developers (300 h × $120/h) | $36,000 |`);
  lines.push(`| — Lead Developer (90 h × $180/h) | $16,200 |`);
  lines.push(`| — System Admin (60 h × $200/h) | $12,000 |`);
  lines.push("");

  lines.push("## Phase Breakdown");
  lines.push("");
  for (const p of phaseBreakdown) {
    lines.push(`### ${p.title} (${p.hours})`);
    lines.push("");
    for (const st of p.subTasks) {
      lines.push(`#### ${st.title} (${st.hours})`);
      lines.push(`${st.description}`);
      lines.push("");
      for (const step of st.steps) {
        lines.push(`- ${step}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

async function handleCopyMarkdown() {
  try {
    await navigator.clipboard.writeText(estimateToMarkdown());
    toast.success("Markdown in die Zwischenablage kopiert");
  } catch {
    toast.error("Kopieren fehlgeschlagen");
  }
}

function handlePrint() {
  window.print();
}

const AdminEstimate = () => (
  <AdminLayout>
    <div className="space-y-10 max-w-[860px] print:max-w-none">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Avis News platform development effort
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
          Implementation of the project in a five-week sprint with 2 developers, each pair-programming with one AI developer for ~5 hours per day, 6 days per week.
        </p>
      </div>

      {/* Team & Effort Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {teamStats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3 flex flex-col items-center text-center gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon size={16} className="text-primary" />
              </div>
              <div className="font-heading text-base font-bold text-foreground leading-tight">{s.value}</div>
              <div className="font-ui text-[11px] text-muted-foreground leading-tight">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cost Breakdown */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-5 pb-4 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Calculator size={18} className="text-primary" />
            </div>
            <div>
              <div className="font-ui text-xs text-muted-foreground">Estimated Total Cost</div>
              <div className="font-heading text-2xl font-bold text-foreground">~$64,200</div>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border bg-background p-3">
              <div className="font-ui text-xs text-muted-foreground">2 Developers × 5 h/day × 6 d/wk</div>
              <div className="font-heading text-lg font-semibold mt-1">300 h × $120/h</div>
              <div className="text-muted-foreground">= $36,000</div>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <div className="font-ui text-xs text-muted-foreground">Lead Developer × 3 h/day × 6 d/wk</div>
              <div className="font-heading text-lg font-semibold mt-1">90 h × $180/h</div>
              <div className="text-muted-foreground">= $16,200</div>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <div className="font-ui text-xs text-muted-foreground">System Admin × 2 h/day × 6 d/wk</div>
              <div className="font-heading text-lg font-semibold mt-1">60 h × $200/h</div>
              <div className="text-muted-foreground">= $12,000</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase Breakdown */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Calculator size={16} className="text-muted-foreground" />
          <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">Phase Breakdown</h2>
        </div>
        <Separator />

        {phaseBreakdown.map((phase) => (
          <Card key={phase.title}>
            <CardContent className="pt-5 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <phase.icon size={16} className="text-primary" />
                  </div>
                  <h3 className="font-heading text-sm font-bold text-foreground">{phase.title}</h3>
                </div>
                <div className="font-ui text-xs text-muted-foreground font-medium">
                  {phase.hours}
                </div>
              </div>
              <div className="space-y-5 pl-11">
                {phase.subTasks.map((st, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <st.icon size={13} className="text-muted-foreground shrink-0" />
                      <span className="font-ui text-sm font-medium text-foreground">{st.title}</span>
                      <span className="font-ui text-xs text-muted-foreground ml-auto whitespace-nowrap">{st.hours}</span>
                    </div>
                    <p className="font-ui text-xs text-muted-foreground leading-relaxed pl-[21px]">{st.description}</p>
                    <ul className="space-y-1.5 pl-[21px]">
                      {st.steps.map((step, j) => (
                        <li key={j} className="font-ui text-xs text-muted-foreground/80 leading-relaxed flex gap-2">
                          <span className="text-muted-foreground/50 shrink-0 mt-[3px]">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </AdminLayout>
);

export default AdminEstimate;
