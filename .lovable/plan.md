# Homepage-Hero: Featured Images voll anzeigen, Text darunter

## Ziel
Auf der Startseite (`src/pages/Index.tsx`) sollen der Haupt-Hero und die drei Secondary-Storys ihre Featured Images **komplett** zeigen (kein Beschnitt, kein Overlay-Gradient). Kategorie-Pill, Titel, Subtitle und Meta-Zeile rutschen **unter** das Bild — sauber, editorial, state of the art.

Die darunterliegenden Kategorie-Sektionen bleiben unverändert (dort ist das Layout bereits „Bild oben, Text unten").

## Was sich ändert

### Main Hero (lg:col-span-3)
- Container verliert `aspect-[16/10] lg:aspect-auto lg:min-h-[525px]` und wird zu `flex flex-col`.
- Bild-Wrapper: eigener Block mit `aspect-[16/9]`, `rounded-xl`, `overflow-hidden`, `bg-muted`.
- `<img>`: `object-contain` statt `object-cover`, damit **kein Bildinhalt beschnitten** wird. Hintergrund des Wrappers (`bg-muted` bzw. subtiler Gradient bei fehlendem Bild) füllt Letterbox-Ränder ruhig auf.
- Hover-Zoom bleibt (dezent, `group-hover:scale-[1.02]`).
- Overlay-Gradient (`bg-gradient-to-t from-black/80 …`) entfällt komplett.
- Textblock wandert **unter** das Bild in einen eigenen `div` mit `pt-5`:
  - Kategorie-Pill (Farbe der Kategorie beibehalten, aber Kontrast an Light/Dark anpassen: `color: cat.color`, `background: ${cat.color}15`)
  - `<h2>` (statt `<h1>` in Karten-Kontext) mit `text-foreground` statt `text-white`
  - Subtitle mit `text-muted-foreground`
  - Meta-Zeile mit `text-muted-foreground`, Autor `text-foreground font-semibold`

### Secondary Stories (lg:col-span-2, 3 Karten)
- Gleiches Prinzip: Karte wird `flex flex-col`, Bild-Wrapper mit `aspect-[16/9]` + `object-contain` + `bg-muted`, Text darunter (`pt-3`).
- Kategorie-Label + Titel in `text-foreground` / `text-muted-foreground`, kein Overlay.
- Horizontaler Mobile-Scroll (`flex-row … overflow-x-auto`) und Card-Breite `w-[280px]` bleiben.

### Grid-Ausrichtung
`grid grid-cols-1 lg:grid-cols-5 gap-5` bleibt. Damit die Höhen der Spalten schön aufgehen, kriegt die Secondary-Spalte auf Desktop `lg:grid-rows-3` mit `gap-5`, sodass die drei Kacheln zusammen etwa auf Höhe des Hero-Blocks landen (Bild + Text). Keine feste `min-h` mehr — die Spalten dürfen atmen.

## Technische Details

Betroffene Datei: **`src/pages/Index.tsx`** (Zeilen ~90–187). Keine anderen Dateien, keine Business-Logik, keine Datenmodell-Änderungen.

Design-Tokens: nur semantische Tokens (`text-foreground`, `text-muted-foreground`, `bg-muted`, `border-border`) — keine `text-white`/`bg-black`-Hardcodes. Dark Mode funktioniert dadurch automatisch.

`object-contain` + `bg-muted` ist die saubere Lösung für „Bild immer voll zeigen": Portrait-Bilder bekommen seitliche, Landscape-Bilder ggf. minimale Ränder in dezentem Muted-Ton — kein aggressiver Letterbox-Effekt, weil `aspect-[16/9]` nahe am typischen Bildformat liegt (Memory: „Aspect 16:9, WebP" ist Standard).

## Nicht Teil dieses Plans
- Kategorie-Sektionen weiter unten (schon korrekt: Bild oben, Text unten).
- Änderungen an Editor, Upload, Featured-Image-Regeln oder DB.
- Änderungen an anderen Seiten (`/news`, Artikelseite).
