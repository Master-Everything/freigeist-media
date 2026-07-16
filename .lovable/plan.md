## Ziel

Alle Arbeiten, die seit dem Freigeist-Remix (11.06.2026) in diesem Projekt gemacht wurden, als `time_entries`-Einträge im Hub anlegen — pro Teilaufgabe eine Zeile, Status `geschätzt`, tatsächliches Datum, gruppiert in Arbeitsblöcken. Damit ist die neue `/admin/aufwand`-Seite direkt gefüllt und du kannst später einzelne Zeilen bestätigen oder anpassen.

## Datenquellen

- **Chat-Verlauf** dieses Projekts seit 11.06.2026 (227 Messages) — treibende User-Requests und Ergebnisse.
- **Migrations-Timestamps** (`supabase/migrations/2026070*`, `2026071*`) — belegen technische Meilensteine.
- **`AdminChangelog.tsx`** — Einträge vom 30.06.2026 (Dark Mode Logo Fix, Publisher Rename, Footer Email Update).

## Arbeitsblöcke (Vorschlag)

Grobe Struktur mit vorläufigen Stunden pro Teilaufgabe. Alle Werte als **geschätzt** — du korrigierst nach Bedarf in der UI.

### Block „Remix-Setup" — 11.06.2026
```text
- Secret OPENAI_API_KEY setzen                       0,25 h
- Firecrawl-Connection linken                        0,25 h
- Logo-Upload + Rename freigeist-logo.png            0,25 h
- Branding brand.ts (Freigeist Kongress)             1,00 h
- Branding index.html (Meta, Title, OG)              0,50 h
```

### Block „Changelog Rebrand-Nachtrag" — 30.06.2026
```text
- Changelog-Einträge 2.1.0–2.1.2 nachtragen          0,75 h
```

### Block „Website-Import: Freigeist-Blog (WordPress)" — 30.06.–03.07.2026
```text
- Analyse freigeist.media (WP + Elementor)           1,00 h   (30.06)
- Import-Extractor: Body + Bilder + Videos           2,50 h   (30.06)
- Fehlerbericht Testimport auswerten                 0,50 h   (03.07)
- Subtitle/Excerpt-Mapping (positionsbasiert)        1,50 h   (03.07)
- Interview-Zusammenfassung als Accordion-Box        1,00 h   (03.07)
- Speaker-Box Erkennung + Deduplizierung             1,50 h   (05.07)
```

### Block „Interview-Feedback-Formular" — 04.07.2026
```text
- Plan + DB-Migration interview_feedback             0,75 h
- Public Formular unter Interview-Post               1,25 h
- Admin-Ansicht /admin/feedback                      1,00 h
```

### Block „MCP-Integration" — 05.07.2026
```text
- Lovable MCP-Server aktivieren (Plugin + Manifest)  0,75 h
- Tools: list-posts, get-post, list-categories       1,50 h
```

### Block „Content-Engine-Ingest (Interview-Push)" — 08.07.2026
```text
- Migration: source_engine_post_id + Interview-Cat   0,50 h
- Edge Function ingest-interview + Shared-Secret     2,00 h
```

### Block „Aufwand-Seite Import aus Composer" — 16.07.2026
```text
- Migration app_settings + time_entries              0,75 h
- Hooks useHourlyRate / useTimeEntries               0,50 h
- Seite AdminAufwand.tsx portieren                   1,00 h
- Route + Nav-Link + i18n                            0,50 h
- Seed der historischen Aufwände (dieser Task)       1,00 h
```

## Umsetzung

1. **Vor dem Insert**: Chat-Verlauf noch einmal chronologisch durchgehen und die obige Liste verfeinern (Details, die im Plan-Overview weggekürzt sind — z. B. kleinere Bugfixes zwischen den Blöcken — als eigene Zeilen ergänzen).
2. **`supabase--insert`** mit einem `INSERT INTO public.time_entries (entry_date, block, task, hours, status) VALUES (...)`-Batch. `created_by` bleibt `NULL` (Seed).
3. **Verifizieren**: `/admin/aufwand` öffnen, Blocksummen prüfen, kurzer Screenshot-Check.

## Offene Punkte, die ich beim Bauen entscheide

- Wenn beim Feindurchgang zusätzliche Themen aus dem Chat auftauchen (z. B. Bugfixes zum Import zwischen 03. und 05. Juli), lege ich sie als eigene Zeilen im passenden Block an, statt sie in bestehende Aufgaben zu quetschen.
- Stunden bleiben Schätzungen (Status `geschätzt`). Ich runde auf 0,25-h-Schritte.

## Nicht Teil dieses Plans

- Kein Setzen von Status `bestätigt`.
- Keine Änderung an der `/admin/aufwand`-UI, den Hooks oder der Migration.
- Keine Anpassung des Stundensatzes (bleibt 40 €).
