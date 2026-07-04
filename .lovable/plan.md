## Ziel

Unter jedem Interview-Post erscheint ein Feedback-Formular (Name, E-Mail, Nachricht). Einsendungen werden in einer eigenen Tabelle gespeichert für spätere Auswertung im Admin.

## Umsetzung

### 1. Datenbank (Migration)

Neue Tabelle `public.interview_feedback`:
- `id` uuid PK
- `post_id` uuid (FK auf posts.id, on delete cascade)
- `post_slug` text (denormalisiert für Export/Anzeige, falls Post gelöscht)
- `name` text
- `email` text
- `message` text
- `created_at` timestamptz

Grants + RLS:
- `GRANT INSERT ON public.interview_feedback TO anon, authenticated` (öffentliches Formular)
- `GRANT SELECT, DELETE ON public.interview_feedback TO authenticated` (Admins lesen via Policy)
- `GRANT ALL ... TO service_role`
- RLS an:
  - INSERT-Policy für anon+authenticated (WITH CHECK `length(name) between 1 and 120 AND length(email) between 3 and 255 AND length(message) between 1 and 4000`)
  - SELECT/DELETE-Policy nur für `has_role(auth.uid(), 'admin')` und `has_role(..., 'editorial_manager')`

### 2. Erkennung „Interview-Post"

Anzeigen nur, wenn Post der Kategorie „Interview" angehört, also `post.category_slug === 'interviews'` (bzw. `'interview'` — beim Umsetzen tatsächlichen Slug per `read_query` bestätigen). Kein neues Feld nötig.

### 3. Frontend-Komponente

Neu: `src/components/InterviewFeedbackForm.tsx`
- Design 1:1 nach Screenshot: zentrierte, große Headline in Primary-Teal, drei Felder (Name, E-Mail, Textarea), Full-Width-Submit-Button in Teal, weiß beschriftet — alles via Design-Tokens (`text-primary`, `bg-primary`, `text-primary-foreground`), keine Hardcode-Farben.
- Layout innerhalb der Artikel-Content-Breite (944px).
- Zod-Validierung (name ≤120, email valid ≤255, message 1–4000, trim).
- Submit → `supabase.from('interview_feedback').insert(...)`, Toast bei Erfolg/Fehler, Reset des Formulars, Success-State („Danke für dein Feedback!").
- i18n: neue Keys in `src/locales/{de,en}.ts` (Headline, Platzhalter, Button, Erfolg, Fehler).

Einbindung in `src/pages/ArticlePage.tsx`: nach Artikel-Content, vor Sidebar-/Footer-Bereich, konditional wenn Kategorie = Interview.

### 4. Admin-Ansicht (leichtgewichtig)

Neue Seite `src/pages/admin/AdminFeedback.tsx` + Route `/admin/feedback`, verlinkt in `AdminLayout` Sidebar:
- Tabelle mit Datum, Post (Titel/Slug als Link), Name, E-Mail, Nachricht (truncate + Dialog für Vollansicht), Delete-Button.
- Sortierung neueste zuerst.
- Zugriff via `ProtectedRoute` für admin/editorial_manager.

### 5. Verifikation

- Migration prüfen: Insert als anon möglich, Select nur als admin.
- Testpost der Interview-Kategorie: Formular sichtbar, Submit legt Zeile an, Toast erscheint.
- Nicht-Interview-Post: Formular nicht sichtbar.
- `/admin/feedback` zeigt Einträge, Löschung funktioniert.
- Light + Dark Mode-Check via Design-Tokens.

## Nicht enthalten

- Keine E-Mail-Benachrichtigung an Redaktion (kann später via Edge Function ergänzt werden).
- Kein Spam-Schutz (Captcha/Rate-Limit) — Feldlängen-Constraints in Policy als Minimalschutz. Bei Bedarf später nachrüsten.
- Kein Export/CSV in dieser Runde.
