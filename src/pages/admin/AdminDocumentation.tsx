import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { FileDown, Copy } from "lucide-react";
import { toast } from "sonner";

function docsToMarkdown(): string {
  const lines: string[] = [];
  lines.push("# AVIS Umbrella — News & Insights Platform");
  lines.push("*Corporate news platform for AVIS Umbrella with a CMS-style admin backend.*");
  lines.push("");

  // 1. Tech Stack
  lines.push("## 1. Tech Stack");
  lines.push("");
  lines.push("| Layer | Technology |");
  lines.push("| --- | --- |");
  lines.push("| Framework | React 18 + TypeScript |");
  lines.push("| Build | Vite (SWC) |");
  lines.push("| Styling | Tailwind CSS + shadcn/ui |");
  lines.push("| Routing | react-router-dom v6 |");
  lines.push("| Data fetching | TanStack React Query |");
  lines.push("| Rich-text editor | Tiptap v3 |");
  lines.push("| Backend / Auth / DB | Lovable Cloud |");
  lines.push("| Edge Functions | Deno (auto-deployed) |");
  lines.push("| Self-hosting | Docker + nginx (optional) |");
  lines.push("");

  // 2. Project Structure
  lines.push("## 2. Project Structure");
  lines.push("");
  lines.push("```");
  lines.push(`src/
├── assets/              # Static images (avis-logo.png)
├── components/
│   ├── admin/           # AdminLayout, ProtectedRoute, RichTextEditor, ImageGallery, WebPConverter
│   ├── ui/              # shadcn/ui primitives
│   ├── Header.tsx       # Public site header with category dropdown & Genesis Bond link
│   ├── Footer.tsx       # Footer with RSS, categories, login/logout toggle
│   ├── CategoryPill.tsx # Colored category badge
│   └── ...
├── hooks/
│   ├── usePosts.ts      # Fetches published posts
│   ├── usePost.ts       # Single post by slug
│   ├── useCategories.ts # All categories
│   ├── useProfile.ts    # Current user profile
│   └── useGalleryImages.ts
├── pages/
│   ├── Index.tsx         # Homepage: hero + category pills + latest list
│   ├── NewsListing.tsx   # Filterable news listing (?kategorie=slug)
│   ├── ArticlePage.tsx   # Full article view
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminPosts.tsx
│   │   ├── AdminPostForm.tsx  # Create/edit with Tiptap editor
│   │   ├── AdminUsers.tsx
│   │   └── AdminDocumentation.tsx
│   └── ...
├── integrations/supabase/
│   ├── client.ts         # Auto-generated client
│   └── types.ts          # Auto-generated DB types
└── index.css             # Design tokens, typography, article-body styles`);
  lines.push("```");
  lines.push("");

  // 3. Database Schema
  lines.push("## 3. Database Schema");
  lines.push("");
  lines.push("### posts");
  lines.push("| Column | Type | Note |");
  lines.push("| --- | --- | --- |");
  lines.push("| id | uuid (PK) | Auto-generated |");
  lines.push("| slug | text | Unique, URL-friendly |");
  lines.push("| title | text | Required |");
  lines.push("| subtitle | text | Optional |");
  lines.push("| content | text | HTML from Tiptap |");
  lines.push("| image_url | text | Hero image URL |");
  lines.push("| video_url | text | YouTube embed URL |");
  lines.push("| category_slug | text | FK → categories.slug |");
  lines.push("| status | text | draft / published |");
  lines.push("| featured | boolean | Default false |");
  lines.push("| published_at | timestamptz | |");
  lines.push("");
  lines.push("**RLS:** Public SELECT where status = 'published'. Admins full access.");
  lines.push("");

  lines.push("### categories");
  lines.push("| Column | Type | Note |");
  lines.push("| --- | --- | --- |");
  lines.push("| id | serial (PK) | |");
  lines.push("| slug | text | Unique |");
  lines.push("| name | text | Display name |");
  lines.push("| icon | text | Lucide icon name |");
  lines.push("| color | text | Hex color |");
  lines.push("");

  lines.push("### profiles");
  lines.push("| Column | Type | Note |");
  lines.push("| --- | --- | --- |");
  lines.push("| id | uuid (PK) | = auth.users.id |");
  lines.push("| display_name | text | |");
  lines.push("| created_at / updated_at | timestamptz | |");
  lines.push("");

  lines.push("### user_roles");
  lines.push("| Column | Type | Note |");
  lines.push("| --- | --- | --- |");
  lines.push("| id | uuid (PK) | |");
  lines.push("| user_id | uuid | |");
  lines.push("| role | app_role enum | admin / editor |");
  lines.push("");
  lines.push("**DB Function:** `has_role(_user_id, _role)` — used in RLS policies.");
  lines.push("");

  // 4. Edge Functions
  lines.push("## 4. Edge Functions");
  lines.push("| Function | Purpose | Auth |");
  lines.push("| --- | --- | --- |");
  lines.push("| `rss` | RSS 2.0 XML feed (last 50 posts) | Public |");
  lines.push("| `admin-list-users` | List all auth users | Admin only |");
  lines.push("| `admin-set-password` | Set password for user | Admin only |");
  lines.push("| `import-csv` | Bulk import from CSV | Admin only |");
  lines.push("| `import-md` | Import from Markdown | Admin only |");
  lines.push("");

  // 5. Routing
  lines.push("## 5. Routing");
  lines.push("| Path | Component | Access |");
  lines.push("| --- | --- | --- |");
  lines.push("| `/` | Index | Public |");
  lines.push("| `/news` | NewsListing | Public |");
  lines.push("| `/news/:slug` | ArticlePage | Public |");
  lines.push("| `/rss` | RssFeed | Public |");
  lines.push("| `/admin` | AdminDashboard | Protected |");
  lines.push("| `/admin/posts` | AdminPosts | Protected |");
  lines.push("| `/admin/posts/:id` | AdminPostForm | Protected |");
  lines.push("| `/admin/users` | AdminUsers | Protected |");
  lines.push("| `/admin/documentation` | AdminDocumentation | Protected |");
  lines.push("");

  // 6. Design System
  lines.push("## 6. Design System");
  lines.push("### Fonts");
  lines.push("- **Headings:** Plus Jakarta Sans (500–800)");
  lines.push("- **Body / UI:** Source Sans 3 (300–700)");
  lines.push("");
  lines.push("### Color Tokens (HSL)");
  lines.push("| Token | Value | Usage |");
  lines.push("| --- | --- | --- |");
  lines.push("| `--primary` | 43 72% 38% (Gold) | Brand, Buttons, Links |");
  lines.push("| `--secondary` | 43 50% 72% | Light gold accents |");
  lines.push("| `--accent` | 40 55% 42% | Secondary brand |");
  lines.push("| `--background` | 0 0% 100% | Page background |");
  lines.push("| `--foreground` | 0 0% 10% | Text |");
  lines.push("");
  lines.push("**Admin Theme:** `.theme-admin` overrides tokens to a blue palette (`--primary: 217 72% 40%`).");
  lines.push("");

  // 7. Key Features
  lines.push("## 7. Key Features");
  lines.push("- Hero article with featured flag and gradient overlay");
  lines.push("- Category filtering via URL parameters (`?kategorie=slug`)");
  lines.push("- Rich-text editor (Tiptap) with image upload, figure captions, video embeds");
  lines.push("- Image management — gallery dialog, WebP conversion, conflict detection");
  lines.push("- RSS feed via Edge Function");
  lines.push("- User management — admin can list users and set passwords");
  lines.push("- CSV / Markdown import for bulk content migration");
  lines.push("- Reading progress bar on article pages");
  lines.push("- Invite flow — email links redirect to /set-password");
  lines.push("- Genesis Bond external link → genesis.family");
  lines.push("");

  // 8. Environment
  lines.push("## 8. Environment Variables");
  lines.push("| Variable | Purpose |");
  lines.push("| --- | --- |");
  lines.push("| `VITE_SUPABASE_URL` | Backend API URL |");
  lines.push("| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon/Public Key |");
  lines.push("| `VITE_SUPABASE_PROJECT_ID` | Project ID |");
  lines.push("");

  // 9. Self-Hosting
  lines.push("## 9. Self-Hosting (Optional)");
  lines.push("Multi-stage Dockerfile (Node build → nginx serve) and docker-compose.yml are included.");
  lines.push("");
  lines.push("```bash");
  lines.push("# Local dev");
  lines.push("cp .env.local.example .env.local");
  lines.push("supabase start");
  lines.push("npm run dev");
  lines.push("");
  lines.push("# Docker");
  lines.push("docker compose up --build");
  lines.push("```");
  lines.push("");
  lines.push("---");
  lines.push("*As of: February 2026 · Generated from DOCUMENTATION.md*");

  return lines.join("\n");
}

async function handleCopyDocs() {
  try {
    await navigator.clipboard.writeText(docsToMarkdown());
    toast.success("Markdown copied to clipboard");
  } catch {
    toast.error("Copy failed");
  }
}

const AdminDocumentation = () => {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8 no-print">
        <h1 className="font-heading text-2xl font-bold text-foreground">Project Documentation</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopyDocs}>
            <Copy size={16} /> Copy Markdown
          </Button>
          <Button onClick={() => window.print()}>
            <FileDown size={16} /> Download as PDF
          </Button>
        </div>
      </div>

      <article className="print-content prose prose-sm max-w-none text-foreground">
        <h1 className="font-heading text-2xl font-bold border-b border-border pb-3 mb-6">AVIS Umbrella — News &amp; Insights Platform</h1>
        <p className="text-muted-foreground italic mb-8">Corporate news platform for AVIS Umbrella with a CMS-style admin backend.</p>

        {/* 1. Tech Stack */}
        <h2 className="font-heading text-xl font-bold mt-8 mb-4 text-foreground">1. Tech Stack</h2>
        <table className="w-full text-sm border-collapse mb-8">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-semibold text-foreground">Layer</th>
              <th className="text-left py-2 font-semibold text-foreground">Technology</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50"><td className="py-2 pr-4">Framework</td><td>React 18 + TypeScript</td></tr>
            <tr className="border-b border-border/50"><td className="py-2 pr-4">Build</td><td>Vite (SWC)</td></tr>
            <tr className="border-b border-border/50"><td className="py-2 pr-4">Styling</td><td>Tailwind CSS + shadcn/ui</td></tr>
            <tr className="border-b border-border/50"><td className="py-2 pr-4">Routing</td><td>react-router-dom v6</td></tr>
            <tr className="border-b border-border/50"><td className="py-2 pr-4">Data fetching</td><td>TanStack React Query</td></tr>
            <tr className="border-b border-border/50"><td className="py-2 pr-4">Rich-text editor</td><td>Tiptap v3</td></tr>
            <tr className="border-b border-border/50"><td className="py-2 pr-4">Backend / Auth / DB</td><td>Lovable Cloud</td></tr>
            <tr className="border-b border-border/50"><td className="py-2 pr-4">Edge Functions</td><td>Deno (auto-deployed)</td></tr>
            <tr><td className="py-2 pr-4">Self-hosting</td><td>Docker + nginx (optional)</td></tr>
          </tbody>
        </table>

        {/* 2. Project Structure */}
        <h2 className="font-heading text-xl font-bold mt-8 mb-4 text-foreground">2. Project Structure</h2>
        <pre className="bg-muted text-foreground text-xs p-4 rounded-md overflow-x-auto mb-8 leading-relaxed">{`src/
├── assets/              # Static images (avis-logo.png)
├── components/
│   ├── admin/           # AdminLayout, ProtectedRoute, RichTextEditor, ImageGallery, WebPConverter
│   ├── ui/              # shadcn/ui primitives
│   ├── Header.tsx       # Public site header with category dropdown & Genesis Bond link
│   ├── Footer.tsx       # Footer with RSS, categories, login/logout toggle
│   ├── CategoryPill.tsx # Colored category badge
│   └── ...
├── hooks/
│   ├── usePosts.ts      # Fetches published posts
│   ├── usePost.ts       # Single post by slug
│   ├── useCategories.ts # All categories
│   ├── useProfile.ts    # Current user profile
│   └── useGalleryImages.ts
├── pages/
│   ├── Index.tsx         # Homepage: hero + category pills + latest list
│   ├── NewsListing.tsx   # Filterable news listing (?kategorie=slug)
│   ├── ArticlePage.tsx   # Full article view
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminPosts.tsx
│   │   ├── AdminPostForm.tsx  # Create/edit with Tiptap editor
│   │   ├── AdminUsers.tsx
│   │   └── AdminDocumentation.tsx
│   └── ...
├── integrations/supabase/
│   ├── client.ts         # Auto-generated client
│   └── types.ts          # Auto-generated DB types
└── index.css             # Design tokens, typography, article-body styles`}</pre>

        {/* 3. Database Schema */}
        <h2 className="font-heading text-xl font-bold mt-8 mb-4 text-foreground">3. Database Schema</h2>

        <h3 className="font-heading text-lg font-semibold mt-6 mb-3 text-foreground">posts</h3>
        <table className="w-full text-sm border-collapse mb-6">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-semibold text-foreground">Column</th>
              <th className="text-left py-2 pr-4 font-semibold text-foreground">Type</th>
              <th className="text-left py-2 font-semibold text-foreground">Note</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4">id</td><td className="pr-4">uuid (PK)</td><td>Auto-generated</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4">slug</td><td className="pr-4">text</td><td>Unique, URL-friendly</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4">title</td><td className="pr-4">text</td><td>Required</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4">subtitle</td><td className="pr-4">text</td><td>Optional</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4">content</td><td className="pr-4">text</td><td>HTML from Tiptap</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4">image_url</td><td className="pr-4">text</td><td>Hero image URL</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4">video_url</td><td className="pr-4">text</td><td>YouTube embed URL</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4">category_slug</td><td className="pr-4">text</td><td>FK → categories.slug</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4">status</td><td className="pr-4">text</td><td>draft / published</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4">featured</td><td className="pr-4">boolean</td><td>Default false</td></tr>
            <tr><td className="py-1.5 pr-4">published_at</td><td className="pr-4">timestamptz</td><td></td></tr>
          </tbody>
        </table>
        <p className="text-sm text-muted-foreground mb-6"><strong className="text-foreground">RLS:</strong> Public SELECT where status = 'published'. Admins full access.</p>

        <h3 className="font-heading text-lg font-semibold mt-6 mb-3 text-foreground">categories</h3>
        <table className="w-full text-sm border-collapse mb-6">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-semibold text-foreground">Column</th>
              <th className="text-left py-2 pr-4 font-semibold text-foreground">Type</th>
              <th className="text-left py-2 font-semibold text-foreground">Note</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4">id</td><td className="pr-4">serial (PK)</td><td></td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4">slug</td><td className="pr-4">text</td><td>Unique</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4">name</td><td className="pr-4">text</td><td>Display name</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4">icon</td><td className="pr-4">text</td><td>Lucide icon name</td></tr>
            <tr><td className="py-1.5 pr-4">color</td><td className="pr-4">text</td><td>Hex color</td></tr>
          </tbody>
        </table>

        <h3 className="font-heading text-lg font-semibold mt-6 mb-3 text-foreground">profiles</h3>
        <table className="w-full text-sm border-collapse mb-6">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-semibold text-foreground">Column</th>
              <th className="text-left py-2 pr-4 font-semibold text-foreground">Type</th>
              <th className="text-left py-2 font-semibold text-foreground">Note</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4">id</td><td className="pr-4">uuid (PK)</td><td>= auth.users.id</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4">display_name</td><td className="pr-4">text</td><td></td></tr>
            <tr><td className="py-1.5 pr-4">created_at / updated_at</td><td className="pr-4">timestamptz</td><td></td></tr>
          </tbody>
        </table>

        <h3 className="font-heading text-lg font-semibold mt-6 mb-3 text-foreground">user_roles</h3>
        <table className="w-full text-sm border-collapse mb-6">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-semibold text-foreground">Column</th>
              <th className="text-left py-2 pr-4 font-semibold text-foreground">Type</th>
              <th className="text-left py-2 font-semibold text-foreground">Note</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4">id</td><td className="pr-4">uuid (PK)</td><td></td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4">user_id</td><td className="pr-4">uuid</td><td></td></tr>
            <tr><td className="py-1.5 pr-4">role</td><td className="pr-4">app_role enum</td><td>admin / editor</td></tr>
          </tbody>
        </table>
        <p className="text-sm text-muted-foreground mb-6"><strong className="text-foreground">DB Function:</strong> <code className="bg-muted px-1.5 py-0.5 rounded text-xs">has_role(_user_id, _role)</code> — used in RLS policies.</p>

        {/* 4. Edge Functions */}
        <h2 className="font-heading text-xl font-bold mt-8 mb-4 text-foreground">4. Edge Functions</h2>
        <table className="w-full text-sm border-collapse mb-8">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-semibold text-foreground">Function</th>
              <th className="text-left py-2 pr-4 font-semibold text-foreground">Purpose</th>
              <th className="text-left py-2 font-semibold text-foreground">Auth</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4 font-mono text-xs">rss</td><td className="pr-4">RSS 2.0 XML feed (last 50 posts)</td><td>Public</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4 font-mono text-xs">admin-list-users</td><td className="pr-4">List all auth users</td><td>Admin only</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4 font-mono text-xs">admin-set-password</td><td className="pr-4">Set password for user</td><td>Admin only</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4 font-mono text-xs">import-csv</td><td className="pr-4">Bulk import from CSV</td><td>Admin only</td></tr>
            <tr><td className="py-1.5 pr-4 font-mono text-xs">import-md</td><td className="pr-4">Import from Markdown</td><td>Admin only</td></tr>
          </tbody>
        </table>

        {/* 5. Routing */}
        <h2 className="font-heading text-xl font-bold mt-8 mb-4 text-foreground">5. Routing</h2>
        <table className="w-full text-sm border-collapse mb-8">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-semibold text-foreground">Path</th>
              <th className="text-left py-2 pr-4 font-semibold text-foreground">Component</th>
              <th className="text-left py-2 font-semibold text-foreground">Access</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4 font-mono text-xs">/</td><td className="pr-4">Index</td><td>Public</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4 font-mono text-xs">/news</td><td className="pr-4">NewsListing</td><td>Public</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4 font-mono text-xs">/news/:slug</td><td className="pr-4">ArticlePage</td><td>Public</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4 font-mono text-xs">/rss</td><td className="pr-4">RssFeed</td><td>Public</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4 font-mono text-xs">/admin</td><td className="pr-4">AdminDashboard</td><td>Protected</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4 font-mono text-xs">/admin/posts</td><td className="pr-4">AdminPosts</td><td>Protected</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4 font-mono text-xs">/admin/posts/:id</td><td className="pr-4">AdminPostForm</td><td>Protected</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4 font-mono text-xs">/admin/users</td><td className="pr-4">AdminUsers</td><td>Protected</td></tr>
            <tr><td className="py-1.5 pr-4 font-mono text-xs">/admin/documentation</td><td className="pr-4">AdminDocumentation</td><td>Protected</td></tr>
          </tbody>
        </table>

        {/* 6. Design System */}
        <h2 className="font-heading text-xl font-bold mt-8 mb-4 text-foreground">6. Design System</h2>
        <h3 className="font-heading text-lg font-semibold mt-4 mb-3 text-foreground">Fonts</h3>
        <ul className="list-disc pl-6 text-sm text-muted-foreground mb-4 space-y-1">
          <li><strong className="text-foreground">Headings:</strong> Plus Jakarta Sans (500–800)</li>
          <li><strong className="text-foreground">Body / UI:</strong> Source Sans 3 (300–700)</li>
        </ul>
        <h3 className="font-heading text-lg font-semibold mt-4 mb-3 text-foreground">Color Tokens (HSL)</h3>
        <table className="w-full text-sm border-collapse mb-6">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-semibold text-foreground">Token</th>
              <th className="text-left py-2 pr-4 font-semibold text-foreground">Value</th>
              <th className="text-left py-2 font-semibold text-foreground">Usage</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4 font-mono text-xs">--primary</td><td className="pr-4">43 72% 38% (Gold)</td><td>Brand, Buttons, Links</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4 font-mono text-xs">--secondary</td><td className="pr-4">43 50% 72%</td><td>Light gold accents</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4 font-mono text-xs">--accent</td><td className="pr-4">40 55% 42%</td><td>Secondary brand</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4 font-mono text-xs">--background</td><td className="pr-4">0 0% 100%</td><td>Page background</td></tr>
            <tr><td className="py-1.5 pr-4 font-mono text-xs">--foreground</td><td className="pr-4">0 0% 10%</td><td>Text</td></tr>
          </tbody>
        </table>
        <p className="text-sm text-muted-foreground mb-8"><strong className="text-foreground">Admin Theme:</strong> <code className="bg-muted px-1.5 py-0.5 rounded text-xs">.theme-admin</code> overrides tokens to a blue palette (<code className="bg-muted px-1.5 py-0.5 rounded text-xs">--primary: 217 72% 40%</code>).</p>

        {/* 7. Key Features */}
        <h2 className="font-heading text-xl font-bold mt-8 mb-4 text-foreground">7. Key Features</h2>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1.5 mb-8">
          <li>Hero article with featured flag and gradient overlay</li>
          <li>Category filtering via URL parameters (<code className="bg-muted px-1 py-0.5 rounded text-xs">?kategorie=slug</code>)</li>
          <li>Rich-text editor (Tiptap) with image upload, figure captions, video embeds</li>
          <li>Image management — gallery dialog, WebP conversion, conflict detection</li>
          <li>RSS feed via Edge Function</li>
          <li>User management — admin can list users and set passwords</li>
          <li>CSV / Markdown import for bulk content migration</li>
          <li>Reading progress bar on article pages</li>
          <li>Invite flow — email links redirect to /set-password</li>
          <li>Genesis Bond external link → genesis.family</li>
        </ul>

        {/* 8. Environment */}
        <h2 className="font-heading text-xl font-bold mt-8 mb-4 text-foreground">8. Environment Variables</h2>
        <table className="w-full text-sm border-collapse mb-8">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-semibold text-foreground">Variable</th>
              <th className="text-left py-2 font-semibold text-foreground">Purpose</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4 font-mono text-xs">VITE_SUPABASE_URL</td><td>Backend API URL</td></tr>
            <tr className="border-b border-border/50"><td className="py-1.5 pr-4 font-mono text-xs">VITE_SUPABASE_PUBLISHABLE_KEY</td><td>Anon/Public Key</td></tr>
            <tr><td className="py-1.5 pr-4 font-mono text-xs">VITE_SUPABASE_PROJECT_ID</td><td>Project ID</td></tr>
          </tbody>
        </table>

        {/* 9. Self-Hosting */}
        <h2 className="font-heading text-xl font-bold mt-8 mb-4 text-foreground">9. Self-Hosting (Optional)</h2>
        <p className="text-sm text-muted-foreground mb-4">Multi-stage Dockerfile (Node build → nginx serve) and docker-compose.yml are included.</p>
        <pre className="bg-muted text-foreground text-xs p-4 rounded-md overflow-x-auto mb-4">{`# Local dev
cp .env.local.example .env.local
supabase start
npm run dev

# Docker
docker compose up --build`}</pre>

        <p className="text-xs text-muted-foreground mt-12 border-t border-border pt-4">As of: February 2026 · Generated from DOCUMENTATION.md</p>
      </article>
    </AdminLayout>
  );
};

export default AdminDocumentation;
