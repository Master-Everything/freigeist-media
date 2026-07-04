## Ziel

Drei Fehler im Website-Import (`supabase/functions/import-website/index.ts`) für Freigeist-Artikel beheben:

1. Speaker-Foto landet fälschlich als Featured Image
2. Speaker-Profil-Box wird ohne Bild gerendert
3. Elementor-Divider tauchen weiterhin im Artikel auf

## Ursachenanalyse

**Featured Image & Speaker Box (Fehler 1 + 2 hängen zusammen)**

`renderFreigeistBody` erkennt Speaker-Paare (Bild-Widget + Text-Editor mit `<h1>`) und baut daraus `<aside class="speaker-profile">`. Wenn die Seite den Speaker-Namen als `<h2>`/`<h3>` (nicht `<h1>`) rendert, matcht das Regex-Pair nicht — das Bild wird zur normalen Body-`<figure>`.

Danach läuft `extractFreigeistFeaturedImage`:
- 1) og:image → auf manchen Freigeist-Seiten fehlend/anders
- 2) `wp-post-image` → nicht immer vorhanden
- 3) Fallback: „erstes echtes `<img>` im Body" → greift das Speaker-Foto ab

Zusätzlich entfernt der Fallback das Bild via `bodyHtml.replace(m[0], "")` — wenn das Pair-Regex diesmal doch gematcht hat, wird damit das `<img>` innerhalb `<aside class="speaker-profile">` leergeräumt → Speaker-Box ohne Bild.

**Divider (Fehler 3)**

`renderFreigeistBody` wandelt `divider.default`-Widgets aktuell in `<hr>` um (Zeile 608). Gewünscht ist: komplettes Rauswerfen.

## Änderungen (alle in `supabase/functions/import-website/index.ts`)

1. **Speaker-Pair-Regex robuster machen**
   - Text-Editor-Inhalt darf mit `<h1>`, `<h2>`, `<h3>` **oder** `<p><strong>` beginnen (typische Freigeist-Varianten für Speaker-Namen).
   - Kein Verhalten außerhalb Speaker-Kontext ändern.

2. **Featured-Image-Extraktion sicher gegen Speaker-Foto**
   - `extractFreigeistFeaturedImage`: og:image-Suche zusätzlich um `twitter:image` erweitern.
   - Beim Fallback „erstes `<img>` im Body" **`<img>`-Tags innerhalb `<aside class="speaker-profile">` überspringen**.
   - Beim Entfernen aus dem Body: nur ersetzen, wenn der Treffer nicht innerhalb einer Speaker-Aside liegt (damit die Box ihr Bild behält, falls doch mal getroffen).

3. **Divider ersatzlos entfernen**
   - Zeile 608: `<div … divider.default …>` → leerer String statt `<hr>`.
   - Zusätzlich `elementor-widget-divider` / `elementor-divider`-Wrapper (die auch auf dem Freigeist-Pfad durchrutschen) vor dem Rendern des Body-Scope in `extractFreigeistArticle` entfernen (spiegelt die vorhandene `cleanHtml`-Logik, aber gezielt).

4. **Logging ergänzen** (klein, für nächsten Test-Import)
   - `[import-website] speakerPairs=<n> dividersRemoved=<n> featuredSource=<og|twitter|wp|body|none>`

## Test-Plan

Nach dem Deploy:
1. Nutzer startet erneut den Test-Import mit derselben URL.
2. Ich lese `supabase--edge_function_logs` und prüfe:
   - `speakerPairs ≥ 1`
   - `dividersRemoved` > 0 falls Original Dividers hatte
   - `featuredSource` ≠ `body` (bzw. entspricht dem tatsächlich gewünschten Bild)
3. Im Admin: Featured Image, Speaker-Box und Body optisch verifizieren.

## Keine Änderungen an

- Frontend/Editor (Speaker-Extension, Rendering) — die generierte `<aside class="speaker-profile">` bleibt strukturgleich.
- Nicht-Freigeist-Import-Pfad.
