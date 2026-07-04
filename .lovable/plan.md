# Footer Redesign – Sophisticated Editorial Grid

## Ziel
Der Footer wird nach dem gewählten Prototyp v2 neu gebaut: großzügiges 12-Spalten-Grid, klare typografische Hierarchie, Disclaimer als integrierte Editorial-Karte statt grauer Anhang.

## Struktur (nur `src/components/Footer.tsx`)

```
┌────────────────────────────────────────────────────────────┐
│  BRAND (5 cols)          │  NAV COLUMNS (7 cols, 2-3 spalt.)│
│  Logo + Tagline          │  Navigation │ Rechtliches       │
├────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐ │
│  │ • TRANSPARENZHINWEIS / DISCLAIMER                    │ │
│  │   (6 Absätze in eleganter Karte,                     │ │
│  │    max-w-4xl, weicher Background, subtile Border)    │ │
│  └──────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│  © 2026 …                                    (rechts frei) │
└────────────────────────────────────────────────────────────┘
```

## Was sich ändert
- Layout auf `grid-cols-12` mit Brand-Block (col-span-5) + Nav-Bereich (col-span-7, innen 2 Spalten für Navigation und Rechtliches — keine dritte Dummy-Spalte, da wir keine „Unternehmen"-Sektion haben)
- Deutlich mehr Whitespace (`py-16 md:py-20`), größere Marken-Headline
- Disclaimer bekommt eigene Editorial-Karte mit dezenter Border, Dot-Marker vor Headline, italic Fließtext, alle 6 Absätze bleiben wörtlich erhalten
- Copyright rutscht in eine schmale Bottom-Bar mit `border-t`, `uppercase tracking-widest`
- Hover-States nutzen `hover:text-foreground` statt `hover:text-primary` für ruhigeren Editorial-Look

## Was gleich bleibt
- Semantische Design-Tokens (`bg-muted`, `border-border`, `text-muted-foreground`, `text-foreground`) — kein Hardcoding von Stone/Slate-Farben
- Alle bestehenden Links, i18n-Keys (`t("footer.*")`, `t("nav.*")`, `t("common.*")`)
- Auth-Logik (Login/Logout/Admin je nach `isLoggedIn`)
- Logo via `brand.logoSrc`, Tagline via `t("footer.tagline")`
- Disclaimer-Text 1:1 aus aktueller Version
- `max-w-[1600px]` Container-Breite (Core-Regel)
- `pb-20` unten für Fixed-Bottom-Category-Nav

## Technische Details
- Keine neuen Fonts, keine neuen Packages — Prototyp-Fonts (Playfair/Inter) werden auf bestehende Projekt-Fonts gemappt (`font-heading` / `font-body`)
- Keine Farben außerhalb der Tokens, Dark-Mode bleibt funktional
- Keine Änderungen an Business-Logik, keine anderen Dateien

## Nur betroffene Datei
- `src/components/Footer.tsx`