## Plan

1. **Featured Image aus WordPress holen (mehrstufig, ohne Heuristik-Fallbacks)**
   Für Freigeist-URLs in dieser Reihenfolge, ohne Rückfall auf `og:image`, `twitter:image`, Video-Overlay oder Body-Bilder:
   
   a. **WordPress REST API**: `GET https://freigeist.media/wp-json/wp/v2/posts?slug=<slug>&_embed=1`
      - Beitragsbild aus `_embedded["wp:featuredmedia"][0].source_url`.
      - Fallback: `GET /wp-json/wp/v2/media/<featured_media>` falls kein `_embed` da ist.
   b. **HTML-Fallback**: Suche im ganzen HTML nach `<img class="… (wp-post-image|attachment-post-thumbnail|size-post-thumbnail) …">` (Post-Thumbnail heißt bei WP je nach Theme so).
   c. Nichts gefunden → `imageUrl = null`, kein Ersatz.
   
   Log: `featuredSource=wp-rest|post-thumbnail|none featured=yes|no`.

2. **Speaker-Block-Erkennung präzisieren**
   Regel: Speaker-Profil nur, wenn das `image.default`-Widget direkt gefolgt wird von einem `text-editor.default`, dessen **erster Textblock eine Überschrift (`<h1>`–`<h3>`) ist, die ausschließlich den Speakernamen enthält** — d.h. reiner Textinhalt (evtl. in `<strong>` gewrappt), **kein Satzzeichen (`.,:;!?`), keine Ziffern, max. ~6 Wörter, Länge ≤ 60 Zeichen**.
   
   Dadurch wird der Content-Abschnitt „Immobilien · Jurisdiktionen · Strategische Diversifikation" (langer `<h2>` mit Punkten/Sonderzeichen) nicht mehr fälschlich als zweiter Speaker erkannt, während der echte Block (`<h1><strong>Florian Wilk</strong></h1>`) weiterhin matched.

3. **Nicht ändern**
   - Divider-Filter.
   - Andere Import-Pfade (`import-md`, `import-csv`, generischer Website-Import).
   - Frontend / Editor-UI.

4. **Deploy + Verifikation**
   - `import-website` neu deployen.
   - Testimport der gleichen URL.
   - Erwartet: `featuredSource=wp-rest featured=yes`, `speakerPairs=1`, im Admin ein Featured Image + genau ein Speaker-Block.