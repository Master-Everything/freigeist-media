## Ziel

Featured Image beim Website-Import ausschließlich aus dem WordPress-Featured-Image-Feld ziehen. Kein Fallback mehr auf `og:image`, `twitter:image`, Video-Overlay oder erstes Body-Bild.

## Hintergrund

WordPress rendert das „Featured Image" (Beitragsbild) im Frontend mit der CSS-Klasse `wp-post-image` (Standard von `the_post_thumbnail()`). Das ist das einzige verlässliche 1:1-Mapping zum WP-Feld.

Alle anderen Quellen sind Heuristiken und liefern in Freigeist-Artikeln falsche Treffer (u.a. Speaker-Foto).

## Änderungen (nur `supabase/functions/import-website/index.ts`)

1. **`extractFreigeistFeaturedImage` vereinfachen**
   - Entfernen: `og:image`-Match, `twitter:image`-Match, Video-Overlay-Fallback, Body-Bild-Fallback inkl. `isInsideSpeakerAside`-Hilfe.
   - Behalten: ausschließlich Regex auf `<img … class="… wp-post-image …" …>` (zuerst im Body-Scope, dann im gesamten HTML).
   - Wenn kein `wp-post-image` gefunden: `imageUrl = null`, `source = "none"` — kein Ersatzbild.
   - Bild wird weiterhin aus `bodyHtml` entfernt, falls es dort steht (damit es nicht doppelt erscheint).
   - `source`-Enum reduzieren auf `"wp" | "none"`.

2. **Log anpassen**
   - `console.log("[import-website] extractFreigeistArticle: featuredSource=wp|none featured=yes|no")` bleibt, Werte-Set verkleinert.

3. **Nicht anfassen**
   - Speaker-Pair-Logik, Divider-Filter, Frontend, andere Import-Pfade (`import-md`, `import-csv`).

## Ergebnis

- Artikel ohne gesetztes WP-Featured-Image werden ohne Featured Image importiert (Admin kann später manuell setzen).
- Speaker-Foto kann nicht mehr fälschlich als Featured Image landen.

## Test

Nach Deploy: Test-Import derselben URL, dann prüfe ich `supabase--edge_function_logs` auf `featuredSource=wp` bzw. `none` und du verifizierst im Admin.
