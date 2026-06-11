# AVIS Umbrella — News & Insights Platform

> Corporate news platform for AVIS Umbrella with a CMS-style admin backend.

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite (SWC) |
| Styling | Tailwind CSS + shadcn/ui |
| Routing | react-router-dom v6 |
| Data fetching | TanStack React Query |
| Rich-text editor | Tiptap v3 |
| Backend / Auth / DB | Lovable Cloud (Supabase) |
| Edge Functions | Deno (deployed automatically) |
| Deployment | Lovable Cloud (preview + publish) |
| Self-hosting | Docker + nginx (optional) |

---

## 2. Project Structure

```
src/
├── assets/              # Static images (avis-logo.png)
├── components/
│   ├── admin/           # Admin UI: AdminLayout, ProtectedRoute, RichTextEditor, ImageGallery, WebPConverter
│   ├── ui/              # shadcn/ui primitives (button, dialog, table, etc.)
│   ├── Header.tsx        # Public site header with category dropdown & Genesis Bond link
│   ├── Footer.tsx        # Footer with RSS, categories, login/logout toggle
│   ├── CategoryPill.tsx  # Colored category badge
│   ├── ArticleThumbnail.tsx
│   ├── ReadingProgress.tsx
│   ├── ScrollToTop.tsx
│   └── AnimatedPage.tsx  # Page transition wrapper
├── hooks/
│   ├── usePosts.ts       # Fetches published posts
│   ├── usePost.ts        # Single post by slug
│   ├── useCategories.ts  # All categories
│   ├── useProfile.ts     # Current user profile
│   └── useGalleryImages.ts
├── pages/
│   ├── Index.tsx          # Homepage: hero + category pills + latest list
│   ├── NewsListing.tsx    # Filterable news listing (?kategorie=slug)
│   ├── ArticlePage.tsx    # Full article view
│   ├── Impressum.tsx      # Legal notice
│   ├── Datenschutz.tsx    # Privacy policy
│   ├── SetPassword.tsx    # Invite/recovery password form
│   ├── RssFeed.tsx        # RSS info page
│   ├── NotFound.tsx
│   └── admin/
│       ├── AdminLogin.tsx
│       ├── AdminDashboard.tsx
│       ├── AdminPosts.tsx
│       ├── AdminPostForm.tsx  # Create/edit post with Tiptap editor
│       └── AdminUsers.tsx     # User list + set-password dialog
├── integrations/supabase/
│   ├── client.ts          # Auto-generated Supabase client
│   └── types.ts           # Auto-generated DB types
├── lib/
│   ├── utils.ts           # cn() helper
│   ├── icons.ts           # Dynamic Lucide icon resolver
│   └── videoUtils.ts      # YouTube thumbnail helper
├── data/news.ts           # Legacy static data (unused)
└── index.css              # Design tokens, typography, article-body styles
```

---

## 3. Database Schema

### `posts`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| slug | text | Unique, URL-friendly |
| title | text | Required |
| subtitle | text | Optional |
| content | text | HTML from Tiptap |
| image_url | text | Hero image URL |
| video_url | text | YouTube embed URL |
| category_slug | text | FK → categories.slug |
| author_name | text | |
| author_role | text | |
| status | text | `draft` / `published` |
| featured | boolean | Default false |
| reading_time | integer | Minutes |
| published_at | timestamptz | |
| created_at / updated_at | timestamptz | Auto-managed |

**RLS:** Public can SELECT where `status = 'published'`. Admins have full access.

### `categories`
| Column | Type | Notes |
|---|---|---|
| id | serial (PK) | |
| slug | text | Unique |
| name | text | Display name |
| icon | text | Lucide icon name |
| color | text | Hex color |
| description | text | Optional |

**RLS:** Public read. Admins can manage.

### `profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | = auth.users.id |
| display_name | text | |
| created_at / updated_at | timestamptz | |

**RLS:** Users read/update own. Admins read all. No public INSERT/DELETE.

### `user_roles`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| user_id | uuid | |
| role | app_role enum | `admin` or `editor` |

**RLS:** Users view own roles. Admins manage all.

### Database Function
- `has_role(_user_id uuid, _role app_role) → boolean` — used in RLS policies and edge functions.

---

## 4. Edge Functions

All deployed automatically. JWT is verified manually inside each function.

| Function | Purpose | Auth |
|---|---|---|
| `rss` | Generates RSS 2.0 XML feed of published posts (last 50) | Public (`verify_jwt = false`) |
| `admin-list-users` | Returns list of all auth users (id, email, dates) | Admin only (checks `has_role`) |
| `admin-set-password` | Sets password for any user via `auth.admin.updateUserById` | Admin only |
| `import-csv` | Bulk-import posts from CSV | Admin only |
| `import-md` | Import posts from Markdown | Admin only |

---

## 5. Routing

| Path | Component | Access |
|---|---|---|
| `/` | Index | Public |
| `/news` | NewsListing | Public |
| `/news/:slug` | ArticlePage | Public |
| `/impressum` | Impressum | Public |
| `/datenschutz` | Datenschutz | Public |
| `/rss` | RssFeed | Public |
| `/set-password` | SetPassword | Public (invite/recovery link) |
| `/admin/login` | AdminLogin | Public |
| `/admin` | AdminDashboard | Protected (auth required) |
| `/admin/posts` | AdminPosts | Protected |
| `/admin/posts/:id` | AdminPostForm | Protected |
| `/admin/users` | AdminUsers | Protected |
| `/admin/changelog` | AdminChangelog | Protected |

`ProtectedRoute` checks for an active session and redirects to `/admin/login` if none.
`InviteRedirectHandler` detects invite/recovery tokens in the URL hash and redirects to `/set-password`.

---

## 6. Design System

### Fonts
- **Headings:** Plus Jakarta Sans (500–800)
- **Body / UI:** Source Sans 3 (300–700)

### Color Tokens (HSL in `index.css`)
| Token | Value | Usage |
|---|---|---|
| `--primary` | 43 72% 38% (warm gold) | Brand color, buttons, links |
| `--secondary` | 43 50% 72% | Lighter gold accents |
| `--accent` | 40 55% 42% | Secondary brand |
| `--background` | 0 0% 100% | Page background |
| `--foreground` | 0 0% 10% | Text |
| `--muted` | 210 17% 97% | Subtle backgrounds |
| `--muted-foreground` | 208 10% 36% | Secondary text |
| `--border` | 43 35% 78% | Borders |

### Admin Theme
The `.theme-admin` class overrides tokens to a blue palette (`--primary: 217 72% 40%`) for the admin area.

### Article Styles
Rich article content uses `.article-body` CSS with styled `p`, `h2`, `a`, `figure`, `.pull-quote`, `.highlight`, and `.video-embed` classes.

---

## 7. Key Features

- **Hero article** with featured flag, gradient overlay, category pill
- **Category filtering** via URL query params (`?kategorie=slug`)
- **Category dropdown** in header (desktop mega-menu, mobile accordion)
- **Rich-text editor** (Tiptap) with image upload, figure captions, video embeds, text alignment
- **Image management** — gallery dialog, WebP conversion panel, image conflict detection
- **RSS feed** via edge function (public, no JWT)
- **User management** — admin can list users and set passwords
- **CSV / Markdown import** for bulk content migration
- **Reading progress bar** on article pages
- **Invite flow** — email invite links redirect to `/set-password`
- **Genesis Bond** external link in header → `https://genesis.family/`
- **Subscriptions / Paywall** (dormant in master) — full schema, helpers and admin hook are present but gated behind `brand.features.subscriptions`. Activated per remix. Complete docs: [docs/SUBSCRIPTIONS.md](./docs/SUBSCRIPTIONS.md)

---

## 8. Environment Variables

| Variable | Source | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | Auto-configured | Backend API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Auto-configured | Anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Auto-configured | Project identifier |

Edge functions automatically have access to `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

---

## 9. Self-Hosting (Optional)

A multi-stage `Dockerfile` (Node build → nginx serve) and `docker-compose.yml` are included for self-hosting. The compose file defaults `VITE_SUPABASE_URL` to `http://127.0.0.1:54321` for local Supabase CLI usage.

```bash
# Local dev with Supabase CLI
cp .env.local.example .env.local
supabase start
npm run dev

# Docker
docker compose up --build
```

---

## 10. Published URLs

| Environment | URL |
|---|---|
| Preview | `https://id-preview--7437e779-0b5b-45dd-9f3c-28bf466b1a45.lovable.app` |
| Production | `https://avis-land-news.lovable.app` |
