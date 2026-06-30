## Ziel

Der bestehende "Import from Website"-Dialog scrapet aktuell GoDaddy-Blogs (sucht nach `data-ux="BlogContent"`). Für `freigeist.media` (WordPress + Elementor) findet er nichts Brauchbares und importiert leeres oder kaputtes HTML.

Wir erweitern die Edge Function `supabase/functions/import-website/index.ts` um einen zweiten Extraktor speziell für Freigeist-Artikel, der ausgewählt wird, wenn die URL auf `freigeist.media` zeigt. Der GoDaddy-Pfad bleibt für ältere Importe erhalten.

## Was aus jedem Post übernommen wird

Am Beispiel `https://freigeist.media/guenter-marc-silber-knappheit-physische-realitaet/`:

- **Titel** → erstes `<h1 class="elementor-heading-title">` (oben, nicht die H1en im Body)
- **Excerpt** → `elementor-widget-theme-post-excerpt` → in `excerpt`/Meta-Description
- **Veröffentlichungsdatum** → deutsches `dd.mm.yyyy` aus `elementor-widget-post-info`
- **Featured Image** (`posts.image_url`) — Priorität:
  1. `image_overlay.url` aus dem ersten `elementor-widget-video` `data-settings` (Cover-Bild des Videos — bei diesem Beispiel `Guenther-und-Mark-Edelmetalle-Aktuell.jpg`)
  2. `og:image` aus dem `<head>`
  3. `<link rel="image_src">`
  4. WordPress Featured-Image-Marker (`wp-post-image`-Klasse) wenn das Theme eines rendert
  5. Erstes "echtes" `<img>` im Body (mit der bestehenden `isIconOrPlaceholder`-Filterung)

  Das Bild wird wie alle anderen Bilder über den vorhandenen Pfad nach `post-images/` hochgeladen, in WebP konvertiert/dedupliziert und die resultierende relative URL in `posts.image_url` gespeichert.
- **Featured Video** (`posts.video_url`) → `youtube_url`/`vimeo_url` aus dem ersten `elementor-widget-video` `data-settings`
- **Body-Content** → gesamter Inhalt von `elementor-widget-theme-post-content`, gerendert als saubere HTML-Sequenz:
  - `elementor-widget-heading` → `<h2>`
  - `elementor-widget-text-editor` → eingebettete `<p>`, `<h1-6>`, `<ul>`, `<ol>`, `<strong>`, `<em>`, `<a>` 1:1
  - `elementor-widget-image` → `<figure><img …></figure>` (inkl. umschließender Links wenn vorhanden)
  - `elementor-widget-n-accordion` (Zusammenfassung) → wird zu `<h2>` + Absätzen geflacht
  - `elementor-widget-divider` → `<hr>`
  - `elementor-widget-button` → `<p><a class="button" …>Text</a></p>`
  - **Entfernt:** Cookie-Banner, Sharing-Widgets, "Recent Posts", Footer, Navigationen, Skripte/Styles, leere Container, das Featured-Video-Widget (kommt separat in `video_url`), das als Featured gewählte Bild (kommt separat in `image_url`)
- **Bilder im Body** → wie bisher: nach `post-images/` hochgeladen, Dedup über `normalizeImageUrl`, Originaldateinamen erhalten, WebP-Reuse
- **Weitere Videos im Body** → als `<div class="video-embed"><iframe …></div>` eingebettet

## Auswahl-Logik

Am Anfang von `Deno.serve` pro URL:

```text
host = new URL(url).hostname
if (host === 'freigeist.media' || host.endsWith('.freigeist.media')) {
  use extractFreigeistArticle(html)
} else {
  use bestehender GoDaddy-Pfad
}
```

Beide Pfade liefern dasselbe Zwischenformat `{ title, slug, publishedAt, excerpt, featuredImageSrc, firstVideoUrl, bodyHtml }`, danach läuft der bereits vorhandene Bild-Upload-, Slug-Dedup- und `posts`-Insert-Code unverändert. **Wichtig:** Der bestehende Code mappt `featuredImageSrc` bereits über `urlMap` auf die hochgeladene relative URL und schreibt sie in `posts.image_url` — das funktioniert für den neuen Freigeist-Pfad ohne Änderung.

## Technische Details

**Freigeist-Parser** (neue Helfer in derselben Datei):

- `extractFreigeistTitle(html)` — erstes `h1.elementor-heading-title` außerhalb von `theme-post-content`.
- `extractFreigeistExcerpt(html)` — Text aus `elementor-widget-theme-post-excerpt`.
- `extractFreigeistDate(html)` — Regex `(\d{2})\.(\d{2})\.(\d{4})` im `elementor-widget-post-info`-Block.
- `extractFreigeistVideo(html)` — JSON-decodet `data-settings` des ersten `elementor-widget-video`, liest `youtube_url`/`vimeo_url` und `image_overlay.url`. Returns `{ videoUrl, overlayImage }`. Entfernt den Widget-Block aus dem HTML.
- `extractFreigeistFeaturedImage(html, overlayImage)` — wendet die oben beschriebene 5-Stufen-Priorität an und entfernt das gewählte `<img>` aus dem Body, damit es nicht doppelt erscheint.
- `extractFreigeistBody(html)` — isoliert `elementor-widget-theme-post-content` per balancierter Div-Klammerung, läuft pro Elementor-Widget-Klasse durch und mappt sie auf das oben beschriebene saubere HTML. Inline-Tags über die bestehende `cleanHtml`-Whitelist.

**Firecrawl-Aufruf:** Wir bleiben bei `formats: ["html"]` und `onlyMainContent: false`, weil wir die Elementor-Struktur und das `<head>` (für `og:image`) brauchen.

**Sicherheit:** Vorhandene `isSafeUrl`, `isSafeFetchUrl` (SSRF-Schutz), Auth-Check (`has_role admin`) bleiben unverändert.

## Frontend

Keine Änderungen an `WebsiteImportDialog.tsx` außer Placeholder-Update auf Freigeist-Beispiel-URLs.

## Out of Scope

- Bulk-Discovery aller Freigeist-Posts via Sitemap
- Kategorien/Tags aus `category-*`/`tag-*`-Body-Klassen mappen
- Vimeo-Spezialfälle jenseits der Standard-`vimeo_url` in `data-settings`

Nach Approval: Edits nur in `supabase/functions/import-website/index.ts` und Placeholder-Update im Dialog.
