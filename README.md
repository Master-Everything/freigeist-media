# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Remixing this project

All project-specific branding lives in **`src/config/brand.ts`** — a single source of truth.

Eine ausführliche Schritt-für-Schritt-Liste findest du in **[REMIX_CHECKLIST.md](./REMIX_CHECKLIST.md)**.

Kurzfassung:

1. **Edit `src/config/brand.ts`** — update `shortName`, `name`, `siteTitle`, `siteDescription`, `productionUrl`, `contactEmail`, and `externalLinks`.
2. **Replace the logo** — swap `src/assets/avis-news-logo.png` (or change the import in `brand.ts`).
3. **Update `index.html`** — adjust `<title>`, `<meta description>`, OG/Twitter tags, and the `<link rel="alternate">` RSS URL.
4. **Set edge function env vars** in the new Lovable Cloud backend: `SITE_URL`, `BRAND_NAME`, `BRAND_DESCRIPTION`, `BRAND_LANGUAGE` (used by `supabase/functions/rss`).
5. **Project-specific content to clean up manually**:
   - `src/data/news.ts` — legacy demo content, can be deleted
   - `src/pages/admin/AdminDocumentation.tsx`, `AdminProject.tsx`, `AdminWorkSummary.tsx`, `AdminEstimate.tsx` — AVIS-specific documents
   - DB content (posts, categories, users) — separate per-project

