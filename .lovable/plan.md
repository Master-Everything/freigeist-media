## Ziel

Aufwand-Erfassungsseite aus **Freigeist Composer** unverändert in dieses Projekt übernehmen — parallel zur bestehenden `/admin/estimate`. Neue Route: `/admin/aufwand`, Nav-Label „Aufwand". Startet leer, du erfasst die Arbeiten seit dem Remix selbst.

## 1) DB-Migration

Zwei neue Tabellen im Hub, gleiches Schema wie im Composer-Projekt:

- **`public.app_settings`** — Key-Value-Store (jsonb). Seeded mit `hourly_rate = 40`.
- **`public.time_entries`** — `entry_date`, `block`, `task`, `hours` (numeric 6,2), `note`, `status` (`geschätzt`/`bestätigt`, default `geschätzt`), `created_by → auth.users`.

Beide mit GRANTs an `authenticated`/`service_role`, RLS aktiv, Policy `USING/WITH CHECK public.has_role(auth.uid(), 'admin')`, `updated_at`-Trigger auf bestehendem `public.update_updated_at_column()`. Index `time_entries_date_block_idx` auf `(entry_date, block)`.

## 2) Neue Dateien

- `src/hooks/useHourlyRate.ts` — 1:1 wie im Composer.
- `src/hooks/useTimeEntries.ts` — 1:1 wie im Composer (Types `TimeEntry`, `TimeEntryInput`, `TimeEntryStatus`).
- `src/pages/admin/AdminAufwand.tsx` — Portierung der Composer-`Aufwand.tsx`, aber in `<AdminLayout>` gewrappt (statt der Composer-Sidebar) und ohne den äußeren `mx-auto max-w-6xl p-6`-Wrapper, damit das 1400px-Admin-Layout greift. Kompletter Inhalt (Dialog zum Anlegen, Inline-Edit, Block-Gruppierung, CSV-Export, Stundensatz-Card, Filter Von/Bis + „Nur geschätzte", Status-Toggle) bleibt identisch. `EntryDialog`-Subkomponente (ab Zeile 447 der Composer-Datei) wird mit übernommen.

## 3) Routing & Navigation

- `src/App.tsx`: Import + Route `/admin/aufwand` mit `<ProtectedRoute requiredRole="admin">`.
- `src/components/admin/AdminLayout.tsx`: Neuer Nav-Link „Aufwand" (nur `isAdmin`) neben „Estimate", mit `Euro`-Icon-Style bleibt beim reinen Text-Link im bestehenden Nav-Stil (kein Icon, konsistent mit den anderen Admin-Links).
- Neuen i18n-Key `nav.aufwand` in `src/locales/de.ts` und `src/locales/en.ts` (`"Aufwand"` / `"Effort"`).

## 4) Nicht angefasst

- Bestehende `AdminEstimate.tsx` und Route `/admin/estimate` bleiben unverändert.
- Kein Seed von Startdaten — Tabelle startet leer.
- Kein Faktor-1.3-Skript (Composer-spezifisch, hier irrelevant).

## Technische Details

- `app_settings.value` wird als JSON-Zahl gespeichert (`'40'::jsonb`), Hook liest via `Number(raw)`.
- Composer-Feld `status` enthält den deutschen Wert `"geschätzt"` mit ß — beim Aufsetzen der CHECK-Constraint achtet die Migration auf UTF-8-Encoding.
- Text im UI bleibt deutsch (Composer-Original), auch wenn die Core-Regel für Admin-UI englisch ist — abgestimmt darauf, dass es 1:1 aus dem Composer übernommen wird.
