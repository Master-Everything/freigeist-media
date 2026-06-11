## Goal
Apply Freigeist Kongress branding to `src/config/brand.ts` and `index.html`, using the already-uploaded logo `src/assets/freigeist-logo.png`.

## Source of truth
freigeistkongress.com — German-language exclusive network for "Bewusstsein, Gesundheit & finanzielle Souveränität" with weekly Thursday 19:00 live calls.

## Changes

### `src/config/brand.ts`
- `logoSrc` import → `@/assets/freigeist-logo.png`
- `shortName`: `"FREIGEIST"`
- `name`: `"Freigeist Kongress"`
- `siteTitle`: `"Freigeist Kongress — Wahrheit. Freiheit. Netzwerk."`
- `siteDescription`: `"Deutschlands exklusivstes Netzwerk für Bewusstsein, Gesundheit & finanzielle Souveränität. Wöchentliche Live Calls, Experten-Archiv und geschützte Community — nur auf Einladung."`
- `productionUrl`: `"https://freigeistkongress.com"`
- `contactEmail`: `"kontakt@freigeistkongress.com"` (site only exposes a contact form; using the conventional address — flag for user override if different)
- `logoAlt`: `"Freigeist Kongress"`
- `externalLinks`:
  - `genesisBond` → `{ label: "Live Calls", url: "https://freigeistkongress.com/#live-calls" }`
  - `marketplace` → `{ label: "Zugang anfragen", url: "https://freigeistkongress.com/#admission" }`
- `features.subscriptions` and `payments` left as-is.

### `index.html`
- `<html lang>` → `de`
- `<title>` → Freigeist title
- `<meta name="description">` → Freigeist description
- `og:title`, `og:description`, `twitter:title`, `twitter:description` → Freigeist values
- Remove stale CIRAS `og:image` / `twitter:image` (no Freigeist OG asset provided; per head-meta guidance, omit rather than ship a placeholder)
- Update RSS `<link>` title to `"Freigeist Kongress RSS"` (keep the existing Supabase functions URL — edge function URL is unchanged)
- Leave `<meta name="author">` and `twitter:site` untouched unless requested

## Notes / open items
- Real contact email is not published on freigeistkongress.com. Plan uses `kontakt@freigeistkongress.com` as a sensible default; confirm or provide the correct address.
- No OG share image will be set. If you want one generated, say the word.
- Backend env vars used by edge functions (SITE_URL / BRAND_NAME / BRAND_DESCRIPTION) are not touched here — update those in project settings if RSS output should reflect the new brand.
