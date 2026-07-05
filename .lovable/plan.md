## Ziel
Die Top-Headline auf `/` von einem simplen zentrierten H1 in einen state-of-the-art Editorial-Masthead im "Modern Swiss Editorial"-Stil umbauen.

## Umsetzung

**Datei:** `src/pages/Index.tsx` (Zeilen ~83–88, der aktuelle `<h1>`-Block über dem Hero-Grid)

**Neuer Aufbau (drei Zeilen, links/rechts ausgerichtet, untere `border-b`):**

```text
┌─────────────────────────────────────────────────────────────┐
│ EST. 2005                                    ISSUE NO. XX   │
│ ENGINEERING THE FUTURE                                      │
│                                                             │
│ FREIGEIST                                                   │
│ MEDIA & TV        ← rechts daneben: kurzer Descriptor       │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│ KATEGORIE · KATEGORIE · KATEGORIE       FR, 05. JUL 2026    │
└─────────────────────────────────────────────────────────────┘
```

**Konkret:**
- Container `max-w-[1600px] w-full border-b border-foreground/80 pb-8 md:pb-12 mb-10`
- Top-Meta-Row: links `EST. 2005` + Tagline (aus `brand`/i18n: "ENGINEERING THE FUTURE"), rechts `ISSUE NO. XX` in dünnem Border-Kästchen. Klein, `tracking-[0.3em]`, uppercase, DM Sans.
- Wordmark: `text-[12vw] md:text-[11vw] lg:text-[160px] leading-[0.85] font-bold tracking-tighter uppercase` (Space Grotesk). Zwei Zeilen: `FREIGEIST` und `MEDIA & TV`. Das `&` als Outline (`-webkit-text-stroke: 1px currentColor; color: transparent`).
- Neben `MEDIA & TV` rechts (nur `md:`): kurzer Descriptor (2 Sätze, aus i18n), normaler Schnitt, `text-muted-foreground`, `max-w-sm`.
- Bottom-Row mit `border-t border-foreground/10 pt-4`: links 3 Top-Kategorie-Links aus vorhandenen Kategorien, rechts aktuelles Datum (locale-abhängig via `date-fns` + i18n).

**Design-Tokens & Fonts:**
- Nur semantische Tokens: `text-foreground`, `text-muted-foreground`, `border-foreground/10`, `border-foreground/80`. Keine `text-black`/`text-white`. Funktioniert automatisch im Dark Mode.
- Bestehende Fonts (Space Grotesk / DM Sans) — kein neuer Import.

**Motion:**
- Sanftes On-Load-Reveal via `framer-motion`: Wordmark `opacity 0→1`, `y: 12→0`, `letter-spacing` von `-0.02em` auf `tracking-tighter` in 700ms, Meta-Rows leicht verzögert (stagger 80ms).

**i18n:**
- Neue Keys in `src/locales/en.ts` und `src/locales/de.ts`:
  - `home.masthead.established` → "EST. 2005"
  - `home.masthead.tagline` → "ENGINEERING THE FUTURE" / "TECHNIK VON MORGEN"
  - `home.masthead.descriptor` → kurzer 1–2-Satz-Descriptor
  - `home.masthead.issue` → "ISSUE NO. {{n}}"
- Issue-Nummer: fortlaufend berechnet aus Anzahl publizierter Posts (oder statisch aus `brand.ts`, falls einfacher).

**Kategorien in Bottom-Row:**
- Top 3 nicht-leere Kategorien aus der bereits geladenen Kategorien-Liste, jeweils als `<Link>` zur Kategorie-Route (analog zum bestehenden Category-Nav).

## Nicht enthalten
- Keine Änderungen am Hero-Grid oder anderen Sektionen.
- Keine Layout- oder Datenmodell-Änderungen.
- Kein Umstieg auf globale `<Header>`-Komponente — bleibt lokal auf der Homepage.

## Betroffene Dateien
- `src/pages/Index.tsx` (Headline-Block ersetzen)
- `src/locales/en.ts`, `src/locales/de.ts` (neue Masthead-Keys)
- ggf. `src/config/brand.ts` (Issue-Startnummer, falls statisch)
