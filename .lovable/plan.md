## Fixes für den Freigeist-Import

Vier Themen aus deinem Test-Report. Zwei sind reine Import-Fixes (Excerpt, Featured Image), zwei brauchen zusätzlich neue Editor-Bausteine (Accordion, Speaker-Profil), damit der Import überhaupt was zum Andocken hat.

### 1. Excerpt/Subtitle wird gespeichert

Der Freigeist-Extraktor liest `theme-post-excerpt.default` bereits korrekt aus, aber der Insert in `posts` mappt ihn nicht auf die DB-Spalte `subtitle`.

- In `supabase/functions/import-website/index.ts` beim `insert` das Feld `subtitle: excerpt` ergänzen (Freigeist-Pfad; GoDaddy-Pfad bleibt unverändert `null`).

### 2. Featured Image = WordPress-Featured-Image (nicht Video-Overlay)

Priorität in `extractFreigeistFeaturedImage` wird umgestellt:

1. `og:image` / `og:image:secure_url` aus dem `<head>` (das ist auf WordPress das Featured Image)
2. Schema.org `primaryImageOfPage` / `ImageObject` aus `<script type="application/ld+json">` als Absicherung
3. `wp-post-image`-Klasse im Body
4. Video-Overlay aus dem Elementor-Video-Widget (nur als Fallback)
5. Erstes „echtes" `<img>` im Body (mit vorhandener `isIconOrPlaceholder`-Filterung)

Das Overlay-Bild landet erst zum Schluss, damit Speaker-/Video-Vorschaubilder nicht mehr als Featured missverstanden werden. Die restliche Bild-Upload-/Dedup-Pipeline bleibt unverändert.

### 3. Accordion-Block „Zusammenfassung des Interviews"

Neuer Editor-Baustein und Import-Mapping:

- **Neue TipTap-Extension** `src/components/admin/extensions/AccordionExtension.ts` mit zwei Nodes:
  - `accordion` (Block-Container, enthält beliebig viele `accordionItem`)
  - `accordionItem` (Titel + collapsibler Body-Inhalt)
- **Node-View** `AccordionNodeView.tsx` nutzt das vorhandene `@/components/ui/accordion` (Radix) im Editor, damit Vorschau und öffentliche Ansicht identisch aussehen. Add/Remove-Item-Buttons im Node-View, Titel als contenteditable.
- **Öffentliche Rendering**: `renderHTML` gibt semantisches `<details><summary>Titel</summary>…Inhalt…</details>` aus, das wir in `ArticlePage` per CSS als Accordion stylen (bzw. optional per kleinem Hydrations-Wrapper mit Radix). So bleibt der gespeicherte HTML-Content sauber und ohne JS lesbar.
- **Toolbar-Eintrag** in `RichTextEditor.tsx`: „Accordion einfügen".
- **Freigeist-Import**: In `renderFreigeistBody` das `elementor-widget-n-accordion`-Widget nicht mehr in `<h3> + Inhalt` flatten, sondern in `<details class="lovable-accordion"><summary>…Titel…</summary>…gerenderter Item-Inhalt…</details>` konvertieren. TipTap `parseHTML` erkennt genau diese Struktur und macht daraus die neuen Nodes.

### 4. Speaker-Profil-Block

Elementor rendert das als 2-Spalten-Container: links `elementor-widget-image` (Speaker-Foto), rechts `elementor-widget-text-editor` mit `<h1>Name</h1>` gefolgt von 1–n `<p>`-Bio-Absätzen. Wir bauen das als eigenständigen Block nach.

- **Neue TipTap-Extension** `src/components/admin/extensions/SpeakerProfileExtension.ts`:
  - Node `speakerProfile` mit Attributen `imageSrc`, `imageAlt` und `content` (inline HTML — Name + Bio-Absätze), Content-Modell `block+` damit der Editor die Bio direkt editieren kann.
- **Node-View** `SpeakerProfileNodeView.tsx`: Zweispaltiges Layout (Foto quadratisch links, Text rechts) mit Image-Picker (nutzt vorhandene Image-Gallery/Upload-Logik) und editable Textbereich. Style passt zum Original: helle Card, Name als `<h3>`-Look, restliche Absätze als Bio-Text.
- **Öffentliches Rendering**: `renderHTML` gibt `<aside class="speaker-profile"><figure><img …></figure><div class="speaker-bio">…</div></aside>` aus; entsprechende Styles ergänzen wir in `src/index.css` (2 Spalten Desktop, gestapelt Mobile).
- **Toolbar-Eintrag** in `RichTextEditor.tsx`: „Speaker-Profil einfügen".
- **Freigeist-Import**: In `renderFreigeistBody` erkennen wir Elementor-Container mit exakt einer `image.default`-Widget-Kachel + einer `text-editor.default`-Widget-Kachel deren erstes Kind ein `<h1>` ist → in `<aside class="speaker-profile">…</aside>` konvertieren. TipTap parst diese Struktur zum `speakerProfile`-Node.

### 5. Änderungen an bestehenden Dateien

- `supabase/functions/import-website/index.ts` — Excerpt-Insert, Featured-Image-Priorität, Accordion + Speaker-Profil Mapping in `renderFreigeistBody`.
- `src/components/admin/RichTextEditor.tsx` — neue Extensions registrieren, Toolbar-Buttons.
- `src/components/admin/extensions/AccordionExtension.ts` + `AccordionNodeView.tsx` (neu).
- `src/components/admin/extensions/SpeakerProfileExtension.ts` + `SpeakerProfileNodeView.tsx` (neu).
- `src/pages/ArticlePage.tsx` / `src/index.css` — Styling für `details.lovable-accordion` und `aside.speaker-profile` im Public-Layout (kein JS nötig; `<details>` klappt nativ).
- `src/components/admin/PostPreview.tsx` — nichts, wenn die Preview den gleichen Renderer wie `ArticlePage` benutzt (verifiziere ich in Build-Mode).

### Nicht enthalten (bewusst)

- Backwards-Reparsing bereits importierter Posts.
- Volle Radix-Accordion-Interaktion auf öffentlichen Seiten (native `<details>` reicht — kannst du später upgraden).
- Weitere Elementor-Layouts über die 2-Spalten-Speaker-Card hinaus.

Nach deinem OK lege ich in Build-Mode los.