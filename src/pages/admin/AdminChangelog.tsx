import AdminLayout from "@/components/admin/AdminLayout";
import { Copy, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ChangeItem = { tag: string; text: string };
type Entry = { version: string; title: string; items: ChangeItem[] };
type Day = { date: string; entries: Entry[] };

const days: Day[] = [
  {
    date: "Friday, May 29, 2026",
    entries: [
      {
        version: "2.0.7",
        title: "Dark Mode as Default",
        items: [
          { tag: "Changed", text: "`defaultTheme` in `src/App.tsx` switched from `\"light\"` to `\"dark\"`. First-time visitors without a saved preference now see dark mode; `enableSystem` still honours an explicit OS-level light/dark setting, and any manual toggle is persisted in `localStorage`." },
        ],
      },
      {
        version: "2.0.6",
        title: "PDF Magazine Plan Saved",
        items: [
          { tag: "Added", text: "Saved the 4-layer PDF Magazine plan to `.lovable/plan.md` for later implementation: (1) `magazine_issues` + `magazine_issue_posts` data model with `/admin/magazine` UI, (2) `generate-magazine-pdf` edge function (Browserless/Playwright vs `@react-pdf/renderer`), (3) activation of the dormant subscription system with Stripe + `<Paywall>` / `<PricingTable>` / `useSubscription`, and (4) `dispatch-magazine-issue` for monthly delivery to subscribers. Plan still has 4 open decisions (PDF engine, pricing model, cadence, languages)." },
        ],
      },
    ],
  },
  {
    date: "Thursday, May 28, 2026",
    entries: [
      {
        version: "2.0.5",
        title: "TipTap NotFoundError Fix",
        items: [
          { tag: "Fixed", text: "Resolved `NotFoundError: removeChild` thrown by React/ProseMirror DOM conflicts when inserting images. Added `immediatelyRender: false` and `shouldRerenderOnTransaction: false` to the `useEditor()` hook in RichTextEditor." },
        ],
      },
      {
        version: "2.0.4",
        title: "AI Assist Session Auth",
        items: [
          { tag: "Fixed", text: "Edge function `ai-assist` returned 401 because callers were sending the anon publishable key as Bearer token. AIAssistPanel, AIMetadataPanel, AIResearchPanel, and useArticleCheck now send the logged-in user's `session.access_token` so `getClaims()` passes." },
        ],
      },
      {
        version: "2.0.3",
        title: "Legal Pages Localized (EN/DE)",
        items: [
          { tag: "Added", text: "Added `legalNotice` and `privacyPolicy` namespaces to `src/locales/en.ts` and `src/locales/de.ts` covering all headings and paragraphs (with `{{brand}}` and `{{email}}` placeholders) in formal German legal phrasing." },
          { tag: "Changed", text: "`Impressum.tsx` and `Datenschutz.tsx` now use `useTranslation()` instead of hardcoded English copy. Both pages switch between English and German with the language toggle." },
        ],
      },
      {
        version: "2.0.2",
        title: "CIRAS Institute Publisher Sections",
        items: [
          { tag: "Added", text: "New \"Publisher\" section in the Legal Notice naming CIRAS Institute as the legal entity responsible for the publication." },
          { tag: "Added", text: "New \"Publisher and Data Controller\" section in the Privacy Policy naming CIRAS Institute as the data controller for personal information processed via the website." },
        ],
      },
    ],
  },
  {
    date: "Tuesday, May 26, 2026",
    entries: [
      {
        version: "2.0.1",
        title: "Final Brand Pass — CIRAS Magazine & TV",
        items: [
          { tag: "Changed", text: "Renamed the publication from \"Media Magazine\" / \"CIRAS MEDIA MAGAZINE\" to \"CIRAS MAGAZINE & TV\" across `brand.ts`, `index.html` (title, description, og/twitter, RSS link title), locales, and the homepage headline." },
          { tag: "Changed", text: "Updated contact email from `press@avis.group` to `magazine@ciras.org`, footer copyright to \"© 2026 CIRAS INSTITUTE\", and the institute external link label to \"CIRAS INSTITUTE\"." },
          { tag: "Changed", text: "`brand.name` set to \"CIRAS Magazine & TV\" so Legal Notice, Privacy Policy, and RSS metadata read consistently." },
          { tag: "Added", text: "Localized footer tagline via new `footer.tagline` key in EN/DE; Footer now renders the translated tagline instead of `brand.siteDescription` (which is kept for SEO/RSS metadata)." },
        ],
      },
      {
        version: "2.0.0",
        title: "Post-Remix Security Hardening",
        items: [
          { tag: "Added", text: "JWT validation via `supabase.auth.getClaims()` at the top of `supabase/functions/ai-assist/index.ts` — unauthenticated calls now receive 401." },
          { tag: "Added", text: "DOMPurify sanitization of article HTML in `ArticlePage.tsx` and admin `PostPreview.tsx` (FORBID_TAGS/ATTR, ALLOWED_URI_REGEXP, ADD_TAGS/ATTR). Hardened the TipTap link extension and website importer to reject `javascript:`/`data:`/`vbscript:`/`file:` URIs." },
          { tag: "Added", text: "SSRF protection in `import-website` edge function: `isSafeFetchUrl()` blocks non-http(s) schemes, loopback, link-local (169.254.169.254), and RFC1918 private ranges, plus a 10s fetch timeout." },
          { tag: "Changed", text: "RSS edge function no longer leaks raw error messages — returns generic \"Feed temporarily unavailable\" instead." },
          { tag: "Changed", text: "Restricted `post-images` storage bucket listing: dropped the broad public SELECT policy on `storage.objects` and replaced it with role-scoped SELECT policies for admins, editorial managers, and editors. Public image URLs still load via the public bucket flag." },
          { tag: "Changed", text: "Tightened `subscription_plans` access: revoked SELECT from `anon`/`authenticated` and re-granted only non-sensitive columns (excludes `provider_price_id`, which is now server-side only)." },
          { tag: "Changed", text: "Tightened `subscriptions` access: revoked SELECT from `anon`/`authenticated` and re-granted to `authenticated` only on non-sensitive columns (excludes `provider_customer_id`, `provider_subscription_id`, `metadata`)." },
          { tag: "Changed", text: "`posts` table SELECT split into two policies: public reads now require `access_level IS NULL OR 'public'`; a separate authenticated policy validates active subscription tier or matching unexpired entitlement before exposing higher-tier content." },
        ],
      },
    ],
  },
  {
    date: "Monday, May 25, 2026",
    entries: [
      {
        version: "1.12.0",
        title: "Project Remix — CIRAS Rebrand",
        items: [
          { tag: "Added", text: "Configured `OPENAI_API_KEY` secret and linked the managed Firecrawl connection (`FIRECRAWL_API_KEY`) so AI assist and the website importer work in the remixed project." },
          { tag: "Added", text: "New CIRAS logo asset at `src/assets/ciras-logo.png` (monochrome, renders correctly in light/dark via existing invert behaviour)." },
          { tag: "Changed", text: "Rebranded `src/config/brand.ts` to CIRAS: `shortName`, `name`, `siteTitle`, `siteDescription`, `productionUrl` (`https://magazine.ciras.org`), `contactEmail`, `logoSrc`, `logoAlt`, and `externalLinks` (CIRAS IIGO + Institute)." },
          { tag: "Changed", text: "Updated `index.html` `<title>`, meta description, `og:`/`twitter:` tags, and RSS `<link rel=\"alternate\">` title to CIRAS branding. Removed outdated Lovable-hosted share images." },
          { tag: "Changed", text: "Replaced `public/favicon.png` with the new CIRAS favicon and removed the stale `public/favicon.ico` fallback." },
        ],
      },
    ],
  },
  {
    date: "Wednesday, March 18, 2026",
    entries: [
      {
        version: "1.11.1",
        title: "Self-Hosted AI Assistant Fallback",
        items: [
          { tag: "Added", text: "ai-assist backend function now falls back to OPENAI_API_KEY when the Lovable Cloud API key is unavailable. Supports configurable AI_BASE_URL and AI_MODEL environment variables for any OpenAI-compatible provider (OpenAI, Azure, Ollama, etc.)." },
          { tag: "Added", text: "Clear error message returned when no API key is configured." },
        ],
      },
    ],
  },
  {
    date: "Tuesday, March 17, 2026",
    entries: [
      {
        version: "1.11.0",
        title: "Remove Redundant Author Columns",
        items: [
          { tag: "Changed", text: "Dropped author_name and author_role columns from the posts table. Author information is now derived dynamically from profiles and user_roles via the created_by user ID." },
          { tag: "Changed", text: "Admin post form displays author name and role from profile lookup instead of stored fields. AuthorSelectDialog now reassigns the created_by user ID directly." },
          { tag: "Changed", text: "Article page, homepage hero, and import functions updated to remove all references to the dropped columns." },
        ],
      },
      {
        version: "1.10.4",
        title: "AI Research Panel",
        items: [
          { tag: "Added", text: "AI Research panel in the editor sidebar with four research actions: Web Research, Brainstorm Headlines, Find Sources, and Generate Outline. Each action accepts a custom prompt and streams the AI response." },
          { tag: "Added", text: "Research results are persisted to the article_checks table with extended check types, enabling per-post history with timestamps and author attribution." },
          { tag: "Added", text: "Save-to-editor button that appends research results directly into the article body." },
        ],
      },
      {
        version: "1.10.3",
        title: "AI Article Check Panels",
        items: [
          { tag: "Added", text: "Three AI-powered article check panels in the editor right sidebar: Journalism Standards, Press Release, and Company News checks. Each analyses the article content and returns a structured assessment." },
          { tag: "Added", text: "article_checks database table to persist check results per post, with check type, timestamp, and author tracking." },
          { tag: "Added", text: "Check history collapsible section showing previous runs with relative timestamps and author display names." },
          { tag: "Added", text: "Full-screen CheckResultDialog for reviewing long check results with copy-to-clipboard support." },
          { tag: "Added", text: "useArticleCheck hook that manages streaming AI responses, history loading, and result persistence." },
        ],
      },
      {
        version: "1.10.2",
        title: "AI Metadata & Right Sidebar",
        items: [
          { tag: "Added", text: "AI Metadata panel that analyses article content and generates title suggestions, subtitle, category recommendation, and reading time estimate. Each suggestion has a one-click Apply button." },
          { tag: "Added", text: "Collapsible AI right sidebar in the post editor that organises all AI panels (Assist, Metadata, Journalism Check, Press Release Check, Company News Check, Research) into accordion sections." },
          { tag: "Added", text: "Sidebar toggle button to collapse/expand the AI panel, preserving editor workspace." },
        ],
      },
    ],
  },
  {
    date: "Monday, March 16, 2026",
    entries: [
      {
        version: "1.10.1b",
        title: "Image Upload Conflict Handling",
        items: [
          { tag: "Added", text: "ImageConflictPanel shown when an uploaded image filename already exists in storage. Offers rename with a suggested alternative name, or overwrite options." },
        ],
      },
      {
        version: "1.10.1a",
        title: "Editorial Manager Storage Permissions",
        items: [
          { tag: "Added", text: "Editorial managers can now upload, update, and delete images in the post-images storage bucket, matching the permissions already granted to admins." },
        ],
      },
      {
        version: "1.10.1",
        title: "Homepage Headline & UI Cleanup",
        items: [
          { tag: "Added", text: "Full-width \"CIRAS MEDIA MAGAZINE\" headline section inserted between the Header component and the hero grid on the homepage (Index.tsx). The headline is rendered as an <h1> using the font-heading typeface at text-4xl / sm:text-5xl with font-bold, centered via text-center. It reuses the existing newsListing.title i18n translation key so it automatically adapts to German when the language is switched." },
          { tag: "Added", text: "useTranslation hook imported and initialised in the Index page component to enable the translated headline." },
          { tag: "Changed", text: "Hero section top padding reduced from pt-8 md:pt-12 to pt-4 md:pt-6 to tighten the visual gap between the new headline and the featured-article grid, creating a cohesive vertical rhythm." },
          { tag: "Changed", text: "Removed the border-b border-border CSS classes from the sticky category pill bar container (the element that holds the horizontal scrollable category filter pills). This eliminates the thin horizontal divider line that previously separated the pill bar from the article grid below, producing a cleaner, borderless transition." },
        ],
      },
      {
        version: "1.10.0",
        title: "Editor Guide Update (EN & DE)",
        items: [
          { tag: "Added", text: "Editor Guide page (/admin/editor-guide) now documents the image resize drag handles feature: left, right, and bottom-right corner handles for resizing images between 20–100% width, including the live percentage badge that appears during drag." },
          { tag: "Added", text: "Editor Guide documents float auto-sizing behaviour: enabling text wrap on images wider than 80% automatically shrinks them to 50%, and disabling text wrap restores 100% width." },
          { tag: "Added", text: "Editor Guide documents the post list author info display (author name and role shown beneath each article title) and the soft-delete trash system with restore and permanent delete actions." },
          { tag: "Changed", text: "English and German manual translations fully updated with all new sections, corrected descriptions, and consistent terminology across both languages." },
        ],
      },
    ],
  },
  {
    date: "Saturday, March 15, 2026",
    entries: [
      {
        version: "1.9.1",
        title: "Auto-Fill Author Name",
        items: [
          { tag: "Added", text: "When creating a new post, the author name field is automatically filled from the logged-in user's profile display name." },
        ],
      },
    ],
  },
  {
    date: "Saturday, March 14, 2026",
    entries: [
      {
        version: "1.9.0",
        title: "Image Resize & Float Auto-Sizing",
        items: [
          { tag: "Added", text: "Drag handles on left, right, and bottom-right corners of images in the editor for resizing (20–100% width). A live percentage badge appears during drag." },
          { tag: "Added", text: "Enabling text wrap on images wider than 80% automatically shrinks them to 50%. Disabling text wrap restores 100%." },
          { tag: "Changed", text: "Standard/Default button now also resets image width to 100%." },
        ],
      },
    ],
  },
  {
    date: "Friday, March 13, 2026",
    entries: [
      {
        version: "1.8.0",
        title: "Post List Author Info & Trash System",
        items: [
          { tag: "Added", text: "Post list now shows the author's display name and role beneath each article title (e.g. \"Jane Doe · Editor\"), resolved via the new useAuthorLookup hook." },
          { tag: "Added", text: "Soft-delete system: deleting a post sets deleted_at instead of removing it permanently." },
          { tag: "Added", text: "Trash tab in the Posts view (visible to admins and editorial managers) with restore and permanent delete actions." },
          { tag: "Added", text: "useAuthorLookup hook that batch-resolves user IDs to display names and role labels." },
        ],
      },
    ],
  },
  {
    date: "Wednesday, March 12, 2026",
    entries: [
      {
        version: "1.7.1",
        title: "Profile Visibility for Editors",
        items: [
          { tag: "Added", text: "Editors and editorial managers can now read all user profiles, enabling the author lookup feature in the post list." },
        ],
      },
    ],
  },
  {
    date: "Tuesday, March 11, 2026",
    entries: [
      {
        version: "1.7.0",
        title: "Editorial Manager Role",
        items: [
          { tag: "Added", text: "New editorial_manager role with full read/write access to all posts (select, insert, update) without the ownership restriction that editors have." },
          { tag: "Added", text: "Editorial managers can read all categories and all user profiles." },
          { tag: "Changed", text: "Role selector in User Management now includes \"Editorial Manager\" as an option alongside Admin and Editor." },
        ],
      },
    ],
  },
  {
    date: "Tuesday, March 10, 2026",
    entries: [
      {
        version: "1.6.0",
        title: "Editor Roles & Permissions",
        items: [
          { tag: "Added", text: "Editors can now view all posts and create new posts. Editors can only update their own posts (ownership tracked via created_by column)." },
          { tag: "Added", text: "created_by column on posts table to track post ownership." },
          { tag: "Changed", text: "Editor update policy now enforces ownership: editors can only edit posts they created." },
        ],
      },
    ],
  },
  {
    date: "Tuesday, March 3, 2026",
    entries: [
      {
        version: "1.5.0",
        title: "Relative Image URLs",
        items: [
          { tag: "Changed", text: "All image URLs in posts.image_url and posts.content are now stored as relative paths (post-images/filename.webp) instead of absolute Supabase URLs. A migration strips existing absolute URLs." },
          { tag: "Added", text: "imageUrl.ts utility with toRelativePath(), toAbsoluteUrl(), resolveContentUrls(), and relativizeContentUrls() for consistent image path handling across the app and self-hosted deployments." },
          { tag: "Added", text: "VITE_IMAGE_BASE_URL environment variable support for self-hosted instances to point images at a custom server." },
        ],
      },
    ],
  },
  {
    date: "Sunday, March 2, 2026",
    entries: [
      {
        version: "1.4.0",
        title: "Editor Image Controls",
        items: [
          { tag: "Added", text: "Clicking any image in the rich-text editor now selects it and reveals a floating toolbar with Delete, Move Up, and Move Down buttons — no more guessing how to remove or reorder images." },
          { tag: "Added", text: "The toolbar is implemented as a React-based TipTap NodeView, so it integrates seamlessly with the existing editor without affecting HTML serialisation." },
          { tag: "Changed", text: "Figcaption remains fully editable while the image is selected; clicking the caption area keeps the toolbar visible." },
        ],
      },
      {
        version: "1.3.1",
        title: "Bullet & Numbered List Fix",
        items: [
          { tag: "Fixed", text: "Bullet and numbered lists were invisible in both the editor and published articles because Tailwind's CSS reset removes default list styles." },
          { tag: "Added", text: "Explicit CSS rules for `.ProseMirror` and `.article-body` now restore list markers (`disc` / `decimal`) and proper indentation." },
        ],
      },
      {
        version: "1.3.0",
        title: "Admin Changelog Page",
        items: [
          { tag: "Added", text: "Dedicated changelog page at `/admin/changelog` so editors can see what changed and when without leaving the admin area." },
          { tag: "Added", text: "Navigation link in the admin sidebar for quick access." },
        ],
      },
      {
        version: "1.1.1",
        title: "Lightbox Auto-Open Bug Fix",
        items: [
          { tag: "Fixed", text: "The lightbox was opening automatically on page load whenever an article contained images, because the open state was derived solely from the image source being truthy." },
          { tag: "Added", text: "An explicit `isOpen` prop on ImageLightbox decouples the open state from the image source." },
          { tag: "Changed", text: "Dialog open condition changed from `open={!!src}` to `open={isOpen && !!src}`, so the lightbox only opens on deliberate user clicks." },
        ],
      },
      {
        version: "1.1.0",
        title: "Website Import: Image Deduplication Fix",
        items: [
          { tag: "Fixed", text: "Importing GoDaddy/Wix sites produced dozens of duplicate images because the same photo at different resolutions had unique URLs (e.g. `rs-w-1280.jpg`, `rs-w-640.jpg`)." },
          { tag: "Added", text: "`normalizeImageUrl()` strips resize suffixes and query params before deduplication, so the same image at different sizes is recognised as one file." },
          { tag: "Added", text: "`extractImageFilename()` walks URL path segments to find a real filename; falls back to a hash-based name when the URL contains only resize tokens." },
          { tag: "Added", text: "`isIconOrPlaceholder()` filters out favicons, logos, spacers, and tracking pixels during import to keep the media library clean." },
        ],
      },
    ],
  },
  {
    date: "Saturday, February 28, 2026",
    entries: [
      {
        version: "1.2.0",
        title: "Image Lightbox: Pinch-to-Zoom & Pan",
        items: [
          { tag: "Added", text: "Pinch-to-zoom gesture support (1×–5× range) on touch devices — readers can inspect high-resolution photos without leaving the article." },
          { tag: "Added", text: "Mouse-wheel zoom on desktop provides the same zoom capability for non-touch users." },
          { tag: "Added", text: "Drag-to-pan when zoomed in (touch and mouse) so users can explore every part of a large image." },
          { tag: "Added", text: "Double-tap / double-click resets zoom back to 1× for a quick escape." },
          { tag: "Changed", text: "Overlay click only closes the lightbox when the image is at 1× zoom; when zoomed in, clicking the backdrop pans instead of accidentally closing." },
          { tag: "Changed", text: "Cursor changes dynamically: `zoom-in` at 1×, `grab` when zoomed, `grabbing` while dragging." },
        ],
      },
      {
        version: "1.3.0-pre",
        title: "Image Lightbox: Multi-Image Navigation",
        items: [
          { tag: "Added", text: "Left/right swipe navigation lets readers browse all images in an article without closing the lightbox." },
          { tag: "Added", text: "ArrowLeft / ArrowRight keyboard shortcuts for desktop navigation between images." },
          { tag: "Added", text: "Previous/next chevron buttons on the lightbox overlay for mouse users." },
          { tag: "Added", text: "Image counter badge (\"2 / 5\") at the bottom of the lightbox so readers know where they are in the gallery." },
          { tag: "Changed", text: "ArticlePage and PostPreview now collect all article images (featured + body) into a single gallery array using DOMParser, enabling the new navigation." },
          { tag: "Changed", text: "Lightbox internal state changed from `lightboxSrc: string` to `lightboxIndex: number` to support indexed navigation." },
          { tag: "Changed", text: "Zoom and pan automatically reset when navigating between images so each photo starts at 1×." },
        ],
      },
    ],
  },
  {
    date: "Friday, February 27, 2026",
    entries: [
      {
        version: "1.0.0",
        title: "Initial Platform",
        items: [
          { tag: "Added", text: "Article listing page with category filtering, search, and responsive grid layout." },
          { tag: "Added", text: "Full article view with reading-time estimate, social share buttons, and reading-progress indicator." },
          { tag: "Added", text: "Admin dashboard with post management (create, edit, delete, publish/draft toggle)." },
          { tag: "Added", text: "Rich-text editor powered by TipTap with image upload, links, text alignment, and figure/caption support." },
          { tag: "Added", text: "Website import tool that scrapes external pages and converts them into draft posts with images." },
          { tag: "Added", text: "RSS feed generation at `/rss` for syndication." },
          { tag: "Added", text: "User management with role-based access (admin / editor) and password-set flow." },
          { tag: "Added", text: "Image lightbox for viewing article images full-screen." },
          { tag: "Added", text: "WebP batch converter for optimising uploaded images." },
        ],
      },
    ],
  },
];

function dayToMarkdown(day: Day): string {
  let md = `# ${day.date}\n\n`;
  for (const e of day.entries) {
    md += `## v${e.version} — ${e.title}\n`;
    for (const item of e.items) {
      md += `- **${item.tag}** ${item.text}\n`;
    }
    md += "\n";
  }
  return md.trimEnd();
}

function dayToHtmlDoc(day: Day): string {
  const entries = day.entries
    .map((e) => {
      const items = e.items
        .map(
          (item) =>
            `<li><strong style="color:${item.tag === "Added" ? "#16a34a" : item.tag === "Fixed" ? "#d97706" : "#2563eb"}">${item.tag}</strong> ${item.text}</li>`
        )
        .join("");
      return `<h2 style="margin:1.2em 0 .4em;font-size:1.1em">v${e.version} — ${e.title}</h2><ul style="padding-left:1.4em;line-height:1.7">${items}</ul>`;
    })
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Changelog – ${day.date}</title><style>body{font-family:system-ui,sans-serif;max-width:700px;margin:2em auto;color:#1a1a1a;font-size:14px}h1{font-size:1.4em}ul{list-style:disc}</style></head><body><h1>${day.date}</h1>${entries}</body></html>`;
}

function handleCopy(day: Day) {
  navigator.clipboard.writeText(dayToMarkdown(day)).then(
    () => toast.success("Markdown copied to clipboard"),
    () => toast.error("Failed to copy")
  );
}

function handleDownloadPdf(day: Day) {
  const html = dayToHtmlDoc(day);
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-9999px";
  iframe.style.width = "800px";
  iframe.style.height = "600px";
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 2000);
  }, 250);
}

const tagColor: Record<string, string> = {
  Added: "text-green-600",
  Changed: "text-blue-600",
  Fixed: "text-amber-600",
};

export default function AdminChangelog() {
  return (
    <AdminLayout>
      <h1 className="font-heading text-2xl font-bold mb-2">Changelog</h1>
      <p className="text-xs text-muted-foreground mb-6">Updated daily at 02:00 CET</p>
      <div className="space-y-10">
        {days.map((day) => (
          <div key={day.date}>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-heading text-base font-semibold text-muted-foreground">{day.date}</h2>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(day)} title="Copy as Markdown">
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDownloadPdf(day)} title="Download PDF">
                <FileDown className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="space-y-6">
              {day.entries.map((e) => (
                <section key={e.version} className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-heading text-lg font-semibold mb-1">
                    v{e.version} — {e.title}
                  </h3>
                  <ul className="space-y-1.5 text-sm mt-3">
                    {e.items.map((item, i) => (
                      <li key={i}>
                        <span className={`font-semibold ${tagColor[item.tag] ?? "text-foreground"}`}>{item.tag}</span>{" "}
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
