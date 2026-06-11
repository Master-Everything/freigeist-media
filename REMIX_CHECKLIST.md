# Remix-Checkliste

Schritt-für-Schritt-Anleitung zum Aufsetzen eines neuen Projekts (B, C, …) als Remix dieses Master-Projekts (A).

Diese Liste ergänzt den Abschnitt „Remixing this project" in der [README.md](./README.md).

---

## 1. Vor dem Remix (in Projekt A)

- [ ] Alle generischen Änderungen sind committed und laufen sauber in A
- [ ] `src/config/brand.ts` ist vollständig — keine vergessenen Hardcodings (`rg -n "AVIS\|avis\.press\|avis\.land" src/`)
- [ ] Edge Functions sind grün (keine Build-Errors)
- [ ] DB-Migrationen sauber angewendet
- [ ] `brand.features.subscriptions = false` in A (Subscriptions werden ausschließlich pro Remix aktiviert)

## 2. Remix erstellen

- Im Lovable-Dashboard: Projekt A → Drei-Punkte-Menü (⋯) → **Remix**
- Neues Projekt umbenennen (z. B. „Projekt B")
- Lovable Cloud wird beim Remix automatisch frisch initialisiert (neue DB, neue Project-Ref)

## 2.5 Branding aus Vorlage-Website übernehmen (optional)

Wenn ein neues Projekt auf Basis einer bestehenden Website gebrandet werden
soll, im Chat folgenden Prompt nutzen:

> Übernimm das Branding von https://beispiel.de für `src/config/brand.ts`
> und `index.html`. Logo bitte herunterladen und in `src/assets/` ablegen.

Lovable nutzt dann den Firecrawl-Connector (Standard-Web-Tool) und füllt
automatisch:

- `brand.name`, `brand.shortName` (aus Title / OG / Logo-Alt)
- `brand.siteTitle`, `brand.siteDescription` (aus Title + Meta-Description)
- `brand.contactEmail` (aus Impressum/Kontakt-Seite, falls vorhanden)
- `brand.logoSrc` (Logo-Datei wird heruntergeladen)
- `brand.logoAlt`
- Light-/Dark-Token-Vorschlag in `src/index.css` aus Firecrawl-`branding`
  (colors, fonts) — als Vorschlag, bitte kurz prüfen
- `index.html`: `<title>`, Meta-Description, OG- und Twitter-Tags, `lang`

**Manuell nachpflegen:**

- `brand.productionUrl` (finale Ziel-Domain)
- `brand.externalLinks` (CTAs — projektabhängig)
- `/favicon.png` ersetzen
- Edge-Function-Secrets aus Schritt 5

**Voraussetzung:** Firecrawl-Connector ist in **Connectors** verbunden.

## 2.6 Subscriptions aktivieren (optional)

→ **Vollständige Doku**: [docs/SUBSCRIPTIONS.md](./docs/SUBSCRIPTIONS.md)

Das generische Fundament (DB-Schema, `entitlements.ts`-Helper, `access_level`
an Posts/Kategorien) liegt bereits in A und ist im Remix automatisch da —
aber **schlafend** hinter `brand.features.subscriptions = false`.

Nur durchführen, wenn das neue Projekt eine Paywall braucht:

- [ ] `brand.features.subscriptions = true` setzen
- [ ] `brand.payments.provider` setzen (`'stripe'` ist Default, `'paddle'` möglich)
- [ ] Stripe im Remix aktivieren — im Chat: _„Enable Stripe payments"_ (löst
      `enable_stripe_payments` aus; nutzt Lovable's built-in Stripe, kein
      eigener Account nötig)
- [ ] Edge Functions per Chat anlegen lassen: _„Add Stripe subscription edge
      functions (create-checkout, customer-portal, stripe-webhook)"_ — bewusst
      **nicht** in A vorhanden, damit A keine Payment-Konfiguration mitschleppt
- [ ] Plans in `subscription_plans` anlegen (Admin-UI oder Seed)
- [ ] Paywall- und Pricing-Komponenten generieren lassen oder per `@erster-remix`
      Cross-Project übernehmen
- [ ] `default_access_level` an relevanten Kategorien auf `subscriber`/`premium` setzen
- [ ] Test: Logout → premium-Artikel zeigt Paywall

**Wichtig:** Aktiviere Stripe **niemals in Projekt A** — A bleibt
subscription-frei (Flag aus), damit Test-/Live-Accounts sauber pro Remix bleiben.

## 3. Branding austauschen

> Wenn Schritt 2.5 genutzt wurde, hier nur noch die Werte gegenprüfen und Lücken füllen.

### `src/config/brand.ts`

- [ ] `shortName` (Header / Auth-Screens)
- [ ] `name` (Legal, RSS, längere Texte)
- [ ] `siteTitle`
- [ ] `siteDescription`
- [ ] `productionUrl` (Social-Share-Links!)
- [ ] `contactEmail`
- [ ] `externalLinks` (Genesis Bond, Marketplace, …) — entfernen oder umbenennen
- [ ] `logoAlt`

### Logo

- [ ] Neue Logo-Datei in `src/assets/` ablegen
- [ ] `logoSrc`-Import in `brand.ts` umstellen
- [ ] Test in Light- und Dark-Mode (Logo wird ggf. invertiert, h-14)

## 4. `index.html` anpassen

- [ ] `<title>`
- [ ] `<meta name="description">`
- [ ] `<meta name="author">`
- [ ] OG-Tags: `og:title`, `og:description`, `og:image`, `og:url`
- [ ] Twitter-Tags: `twitter:title`, `twitter:description`, `twitter:image`
- [ ] `<link rel="alternate" type="application/rss+xml">` → neue Supabase-Project-Ref
- [ ] `/favicon.png` ersetzen
- [ ] `lang`-Attribut prüfen

## 5. Edge-Function-ENV-Vars setzen

Lovable Cloud → **Connectors → Lovable Cloud → Secrets**:

- [ ] `SITE_URL` (z. B. `https://projekt-b.com`)
- [ ] `BRAND_NAME`
- [ ] `BRAND_DESCRIPTION`
- [ ] `BRAND_LANGUAGE` (`de-DE`, `en-US`, …)
- [ ] `VITE_IMAGE_BASE_URL` (falls Bilder extern gehostet werden)
- [ ] `LOVABLE_API_KEY` ist automatisch verfügbar — nur falls Self-Hosting:
  - [ ] `OPENAI_API_KEY`
  - [ ] `AI_BASE_URL`
- [ ] Nur wenn Schritt 2.6 (Subscriptions) genutzt wird:
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `STRIPE_PUBLISHABLE_KEY` (darf alternativ direkt in `brand.ts` / `.env`)

## 6. Projektspezifischen Content entfernen

### Dateien löschen / leeren

- [ ] `src/data/news.ts` — Demo-/Seed-Content löschen
- [ ] `src/pages/admin/AdminDocumentation.tsx` — AVIS-spezifisch
- [ ] `src/pages/admin/AdminProject.tsx`
- [ ] `src/pages/admin/AdminWorkSummary.tsx`
- [ ] `src/pages/admin/AdminEstimate.tsx`
- [ ] Zugehörige Routen aus `src/App.tsx` entfernen
- [ ] Navigation in `AdminLayout.tsx` aufräumen (Links auf entfernte Seiten)

### Datenbank

- [ ] Posts, Kategorien, Bilder im Storage sind beim Remix leer → neu anlegen oder importieren
- [ ] Changelog-Einträge zurücksetzen (falls vorhanden)

## 7. Auth-Setup

- [ ] Ersten Admin-User über Sign-Up anlegen
- [ ] In der DB die `admin`-Rolle in `user_roles` für diesen User setzen
- [ ] Ggf. Google-OAuth-Provider in Lovable Cloud konfigurieren
- [ ] Custom E-Mail-Domain für Invite-/Reset-Mails einrichten (sonst kommen Mails von Supabase-Default)

## 8. Smoke-Tests

- [ ] `/` Home lädt mit neuem Branding & Logo
- [ ] `/news` Listing funktioniert, leerer State sauber
- [ ] `/admin/login` Login-Flow
- [ ] `/admin` Admin-Layout zeigt neue `shortName`
- [ ] `/rss` Feed enthält korrekten `BRAND_NAME` und `SITE_URL`
- [ ] Light- und Dark-Mode
- [ ] DE/EN-Sprachumschaltung
- [ ] Social-Share auf einem Artikel → Links zeigen auf `productionUrl`
- [ ] Impressum / Datenschutz zeigen neue Kontaktdaten
- [ ] Footer-CTAs (externalLinks) zeigen korrekt oder sind ausgeblendet

## 9. Custom Domain

- [ ] In Lovable: **Project → Settings → Domains → Connect Domain**
- [ ] DNS-Records setzen (siehe Lovable-Anleitung)
- [ ] Nach Verbindung: `productionUrl` in `brand.ts` und `SITE_URL`-Secret final auf neue Domain setzen
- [ ] `index.html`-OG-URL ebenfalls aktualisieren

## 10. Sync-Workflow nach Setup

Master-Pattern für laufende Pflege:

- **Generische Features (CMS, Auth, AI, RSS, i18n, Layout …)** → immer zuerst in **Projekt A** bauen
- **Portierung nach B/C**: per `@Projekt-A` in der Chat-Eingabe → Lovable kann Dateien cross-project lesen und übernehmen
- **Projektspezifisches** (Branding, Content, eigene Seiten) → direkt im Zielprojekt

**Empfohlene Reihenfolge bei neuen Projekten:**

1. A → B remixen, B durchtesten (deckt Lücken in `brand.ts` auf)
2. Erkenntnisse aus B in A zurückfließen lassen
3. Erst danach A → C remixen

## Zeile 14: „DB-Migrationen sauber angewendet"

Bedeutet: Bevor du A remixt, sollte der Datenbank-Stand in A konsistent sein:

Alle Dateien in supabase/migrations/ wurden tatsächlich auf die A-Datenbank angewendet (keine „pending" Migration, die nur als Datei rumliegt)
Die letzte Migration lief ohne Fehler durch
src/integrations/supabase/types.ts passt zum aktuellen Schema (wird automatisch generiert)
Keine manuellen Schema-Änderungen in der DB, die nicht als Migration committed sind (sonst fehlen sie beim Remix)
Warum wichtig: Beim Remix wird für B eine frische Lovable-Cloud-Instanz angelegt und alle Migrationen aus supabase/migrations/ werden der Reihe nach neu ausgeführt. Wenn in A eine Migration fehlerhaft oder nur halb angewendet ist, bricht das Setup von B ab oder B startet mit einem anderen Schema als A.

Schnellcheck: Im Lovable-Chat kurz „run supabase linter" — wenn keine Errors kommen und die App in A normal läuft, ist die Bedingung erfüllt.
