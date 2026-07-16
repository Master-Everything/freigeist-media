## Ziel

Bestehende `time_entries` verfeinern: zusätzliche Teilaufgaben aus dem Chat-Verlauf einfügen, die im ersten Durchgang gefehlt haben. Alles bleibt Status `geschätzt`, 0,25-h-Raster, tatsächliches Datum.

## Neue Einträge (zusätzlich zu den bestehenden 24)

### Ergänzung Block „Remix-Setup" — 11.06.2026
```text
- Dark-Mode-Logo Fix (logo-invertible, teal→weiß)        0,50 h
- Rename CIRAS MAGAZINE & TV → FREIGEIST MEDIA & TV       0,50 h
```

### Neuer Block „Footer-Redesign & Disclaimer" — 04.07.2026
```text
- Transparenzhinweis / Disclaimer im Footer               0,75 h
- Sophisticated Editorial Grid Footer (12-col Layout)     1,50 h
```

### Ergänzung Block „Website-Import Freigeist-Blog"
```text
- Featured Image Handling im Import                       0,75 h   (03.07)
- Divider-Erkennung + Cleanup                             0,50 h   (03.07)
- Speaker-Box: Bild als Erkennungsmerkmal                 0,75 h   (05.07)
- Enrico Eckebrecht automatisch als Autor beim Import     0,50 h   (05.07)
```

### Neuer Block „CTA-Buttons im Post" — 05.07.2026
```text
- .freigeist-cta Style 15% größer                         0,50 h
```

### Neuer Block „Homepage-Redesign (Hero + Masthead)" — 05.07.2026
```text
- Featured Images voll anzeigen, Text darunter            1,75 h
- Headline "FREIGEIST MEDIA & TV" State-of-the-art        1,00 h
```

### Neuer Block „User-Management" — 05.07.2026
```text
- User Enrico Eckebrecht anlegen (admin + editorial_mgr)  0,50 h
```

### Neuer Block „Speaker-Integration (Konzept)" — 05.07.2026
```text
- Konzept Speaker aus Composer via public Edge Function   1,00 h
- Konzept in Projekt-Memory speichern                     0,25 h
```

## Umsetzung

Einzelner `supabase--insert`-Batch mit den obigen ~15 neuen Zeilen. Bestehende Einträge werden nicht angefasst — nur addiert. Danach kurzer Blick auf `/admin/aufwand`, dass Blocksummen konsistent sind.

## Nicht Teil dieses Plans

- Keine Umsortierung/Löschung existierender Einträge.
- Kein Status-Wechsel.
- Kein Code-Change an UI oder Hooks.
