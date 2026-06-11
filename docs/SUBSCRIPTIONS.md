# Subscriptions / Paywall — Komplettdoku

> Master-Projekt (A) enthält das **schlafende Fundament**. Aktivierung erfolgt
> ausschließlich pro Remix (B, C, …) durch einen Flag-Switch + Stripe-Setup.

---

## 1. TL;DR

- Schema, Helper und Admin-UI-Hooks für ein Subscription-/Paywall-System
  liegen in Projekt A bereits in der DB und im Code.
- Solange `brand.features.subscriptions === false` (Default), ist alles ein
  No-Op: keine UI-Änderung, keine Edge Functions, keine Payment-Konfiguration.
- Ein Remix aktiviert die Funktion in 8 Schritten (siehe §5).

---

## 2. Tech Stack

### Frontend
- **React 18 + TypeScript + Vite + Tailwind** (Projekt-Standard)
- **Feature-Flag**: `brand.features.subscriptions: boolean` in `src/config/brand.ts`
- **Provider-Switch**: `brand.payments.provider: 'stripe' | 'paddle' | 'none'`
- **Entitlement-Helper**: `src/lib/entitlements.ts`
  - `resolveAccessLevel(post, category)` — Vererbungslogik
  - `canAccess(required, userTier)` — Gate-Check (immer `true`, wenn Flag aus)
- **Admin-UI-Touch**: `AdminPostForm` zeigt nur bei aktivem Flag einen
  `access_level`-Select + Resolved-Badge.

### Backend (Lovable Cloud / Supabase Postgres)
- **Enum** `access_level` mit Werten `public | subscriber | premium`
- **Erweiterte Tabellen**:
  - `posts.access_level access_level NULL` — leer = von Kategorie erben
  - `categories.default_access_level access_level NOT NULL DEFAULT 'public'`
- **Neue Tabellen** (RLS aktiv):
  - `subscription_plans` — Plan-Katalog pro Projekt
  - `subscriptions` — eine Zeile pro aktiver/historischer User-Subscription
  - `entitlements` — generisches Berechtigungs-Cache (Subscription, manual, role)
- **RLS-Posture** siehe §3.

### Payments
- **Default: Stripe** (Lovable's built-in, kein eigener Stripe-Account nötig)
- **Alternativ: Paddle** als Merchant of Record
- **Edge Functions** (`create-checkout`, `customer-portal`, `stripe-webhook`):
  **nicht in A**, werden pro Remix generiert.

### Schema-Übersicht

```text
access_level enum: public | subscriber | premium

posts
  ├─ access_level (nullable)         ──┐
                                       ├─ resolveAccessLevel()
categories                             │
  └─ default_access_level (not null) ──┘

subscription_plans   1 ─── n   subscriptions   n ─── 1   auth.users
                                                          │
                                                          └── n   entitlements
```

---

## 3. Funktionsweise

### 3.1 Vererbungsregel

Effektives Access-Level eines Posts:

| Post `access_level` | Category `default_access_level` | Effektiv      | Quelle      |
|---------------------|----------------------------------|---------------|-------------|
| `premium`           | egal                             | `premium`     | `post`      |
| `subscriber`        | egal                             | `subscriber`  | `post`      |
| `public`            | egal                             | `public`      | `post`      |
| _(null)_            | `subscriber`                     | `subscriber`  | `category`  |
| _(null)_            | `premium`                        | `premium`     | `category`  |
| _(null)_            | `public`                         | `public`      | `default`   |

Implementiert in `resolveAccessLevel(post, category)`. Post-Wert gewinnt immer.

### 3.2 Gate-Check

```ts
canAccess('premium', userTier)
// userTier = null         → false
// userTier = 'subscriber' → false
// userTier = 'premium'    → true
// Bei brand.features.subscriptions === false: IMMER true (No-Op)
```

### 3.3 Lebenszyklus einer Subscription

```text
1. User klickt CTA              → POST /functions/v1/create-checkout
2. Edge Function                → Stripe Checkout-Session
3. User zahlt bei Stripe        → Stripe sendet Webhook
4. /functions/v1/stripe-webhook → upsert public.subscriptions { status, tier, … }
5. App lädt subscriptions       → useSubscription() liefert tier
6. <Paywall> / canAccess()      → Content wird freigegeben
7. Cancel/Past-Due              → Webhook updated status; canAccess fällt zurück
```

### 3.4 RLS-Posture

| Tabelle               | Public          | User (eigene)            | Admin     | Editorial Manager |
|-----------------------|-----------------|--------------------------|-----------|-------------------|
| `subscription_plans`  | SELECT (active) | —                        | ALL       | SELECT            |
| `subscriptions`       | —               | SELECT                   | ALL       | —                 |
| `entitlements`        | —               | SELECT                   | ALL       | —                 |
| `posts.access_level`  | SELECT*         | SELECT*                  | ALL       | ALL               |
| `categories.default_access_level` | SELECT | SELECT             | ALL       | SELECT            |

\* Bestehende `posts`-RLS bleibt unverändert (`status='published' AND deleted_at IS NULL`).
Gating passiert **client-/edge-seitig** über `canAccess()` — nicht in der DB.
Schreibzugriffe auf `subscriptions`/`entitlements` laufen ausschließlich über
die Service-Role im Webhook.

### 3.5 Bewusst NICHT in Projekt A

| Komponente                                  | Warum nicht in A                          |
|---------------------------------------------|-------------------------------------------|
| Edge Functions (`create-checkout`, …)       | Projekt-spezifische Stripe-Konfiguration  |
| Stripe-Aktivierung                          | Erzeugt Test-/Live-Account, projekt-bezogen |
| `<Paywall>` / `<PricingTable>` Komponenten  | Brand-/Copy-spezifisch, im Remix gebaut   |
| Seed-Daten für `subscription_plans`         | Preise sind pro Produkt unterschiedlich   |
| Server-Side-RLS-Gating                      | Aktueller Design-Entscheid: Client/Edge   |
| `tags`-Vererbung                            | Tags-Tabelle existiert noch nicht         |

---

## 4. Architektur-Diagramm

```text
┌──────────────┐      ┌────────────────────────┐      ┌─────────────────┐
│   User       │      │   App (React + Vite)   │      │  Lovable Cloud  │
│  (Browser)   │      │                        │      │                 │
│              │      │  brand.features.       │      │  ┌───────────┐  │
│              │      │    subscriptions       │      │  │  posts    │  │
│   click ─────┼──────▶  <Paywall>             │      │  │  +access  │  │
│   CTA        │      │  useSubscription()     │◀─────┼──┤  _level   │  │
│              │      │  canAccess()           │      │  └───────────┘  │
│              │      │           │            │      │  ┌───────────┐  │
│              │      │           ▼            │      │  │subscript. │  │
│              │      │  create-checkout ──────┼──┐   │  │  plans    │  │
│              │      │  (edge function)       │  │   │  └───────────┘  │
│              │◀─────┼─ redirect to Stripe ◀──┼──┘   │  ┌───────────┐  │
│              │      │                        │      │  │subscript. │  │
│   pay ───────┼──────┼────────────────────────┼──────┼──┤    s      │  │
│              │      │                        │      │  └───────────┘  │
│              │      │  stripe-webhook ◀──────┼──────┼─── webhook ◀──┐ │
│              │      │  (edge function)       │      │               │ │
│              │      │           │            │      │               │ │
│              │      │           └────────────┼──────▶ upsert sub.   │ │
└──────────────┘      └────────────────────────┘      └───────────────┼─┘
                                                                      │
                                                            ┌─────────┴─────┐
                                                            │   Stripe      │
                                                            │  (or Paddle)  │
                                                            └───────────────┘
```

---

## 5. Aktivierungsanleitung (im Remix)

### 5.1 Voraussetzungen

- [ ] Lovable **Pro-Plan** oder höher
- [ ] Lovable Cloud im Remix aktiv (ist nach Remix automatisch der Fall)
- [ ] Remix von Projekt A bereits erstellt (siehe `REMIX_CHECKLIST.md` Step 2)
- [ ] Branding ist gesetzt (Step 3)

### 5.2 Flag + Provider umlegen

`src/config/brand.ts`:

```ts
features: {
  subscriptions: true,        // ← war: false
},
payments: {
  provider: 'stripe',         // oder 'paddle'
},
```

- [ ] Flag auf `true`
- [ ] Provider gesetzt

### 5.3 Stripe aktivieren

Im Chat im **Remix-Projekt**:

> Enable Stripe payments

Das löst `enable_stripe_payments` aus und legt automatisch ein
Test-Environment + die nötigen Secrets (`STRIPE_SECRET_KEY`, etc.) an.

- [ ] Stripe Test-Mode bestätigt
- [ ] Bei späterem Go-Live: Account claim + Live-Mode aktivieren

> ⚠️ **Niemals in Projekt A** aktivieren — A bleibt subscription-frei.

### 5.4 Edge Functions generieren

Im Chat:

> Add Stripe subscription edge functions for this project:
> `create-checkout`, `customer-portal`, `stripe-webhook`. Webhook should
> upsert into `public.subscriptions` using the service role and map Stripe
> price IDs to rows in `public.subscription_plans` (via `provider_price_id`).
> Set status from Stripe subscription state. Use `STRIPE_WEBHOOK_SECRET` for
> signature verification.

- [ ] `create-checkout` deployed (verify_jwt = true)
- [ ] `customer-portal` deployed (verify_jwt = true)
- [ ] `stripe-webhook` deployed (**verify_jwt = false**, Stripe ruft unauth.)
- [ ] Webhook-URL in Stripe Dashboard hinterlegt
- [ ] `STRIPE_WEBHOOK_SECRET` als Cloud-Secret gesetzt

### 5.5 Plans anlegen

Zwei Wege:

**A) Per SQL-Seed (Migration im Remix-Chat):**

```sql
INSERT INTO public.subscription_plans
  (slug, name, description, tier, price_cents, currency, interval, provider_price_id, sort_order)
VALUES
  ('basic-monthly',   'Basic',   'Read all subscriber articles', 'subscriber', 900,  'EUR', 'month', 'price_xxx', 10),
  ('premium-monthly', 'Premium', 'Everything, incl. premium',    'premium',    1900, 'EUR', 'month', 'price_yyy', 20),
  ('premium-yearly',  'Premium Annual', '2 months free',         'premium',    19000,'EUR', 'year',  'price_zzz', 30);
```

**B) Admin-UI** (sobald eine Plans-Verwaltungsseite gebaut wurde — nicht Teil
von A).

- [ ] Mindestens ein aktiver Plan pro Tier existiert
- [ ] `provider_price_id` matched eine Stripe Price-ID

### 5.6 Paywall- und Pricing-UI bauen

Im Chat:

> Build a `<Paywall requiredLevel="subscriber">` wrapper and a
> `<PricingTable />` component. Use `useSubscription()` to read the
> current user's tier from `public.subscriptions` (status active|trialing).
> Paywall renders children if `canAccess(requiredLevel, tier)` is true,
> otherwise shows upgrade CTA → `create-checkout`. Pricing table reads
> active rows from `subscription_plans` sorted by `sort_order`.

Alternativ aus einem vorherigen Remix übernehmen:

> Copy `<Paywall>`, `<PricingTable>` and `useSubscription` hook from
> @projekt-b into this project.

- [ ] `useSubscription` Hook
- [ ] `<Paywall>` Komponente in Artikel-Layout eingebaut
- [ ] Pricing-Page-Route (z. B. `/pricing`)
- [ ] „Manage Subscription"-Button im User-Menü → `customer-portal`

### 5.7 Content auf Tiers setzen

Im Admin:

- [ ] Relevante Kategorien (`default_access_level`) auf `subscriber`/`premium`
- [ ] Einzelne Posts überschreiben bei Bedarf via Access-Level-Select

(Standardfall: nur Kategorie setzen, Posts erben automatisch.)

### 5.8 Smoke-Tests

- [ ] **Logout** → premium-Artikel zeigt Paywall, public-Artikel offen
- [ ] **Checkout-Flow** im Stripe-Test-Mode (Karte `4242 4242 4242 4242`)
- [ ] Nach erfolgreicher Zahlung: `subscriptions`-Zeile existiert mit `status=active`
- [ ] **Webhook-Replay** im Stripe-Dashboard → DB-Zeile wird aktualisiert
- [ ] **Cancel** über Customer-Portal → `status=canceled`, Paywall greift wieder
- [ ] Admin sieht alle Subscriptions; normaler User nur seine eigene

---

## 6. Component-API-Skizze (für Schritt 5.6)

```ts
// src/hooks/useSubscription.ts
function useSubscription(): {
  tier: AccessLevel | null;          // null = nicht eingeloggt oder kein Abo
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

// src/components/Paywall.tsx
<Paywall requiredLevel="subscriber" preview={teaserNode}>
  {fullContent}
</Paywall>

// src/components/PricingTable.tsx
<PricingTable
  plans={plans}                      // aus subscription_plans
  currentTier={tier}
  onCheckout={(planId) => …}         // → create-checkout
/>
```

---

## 7. Provider wechseln (Stripe → Paddle)

1. `brand.payments.provider = 'paddle'`
2. Im Chat: `Enable Paddle payments` (löst `enable_paddle_payments` aus — vorher
   Eligibility-Check über `recommend_payment_provider`)
3. Webhook-Edge-Function neu generieren lassen (Paddle hat andere Event-Namen
   und Signaturen). DB-Schema bleibt 1:1 — `provider`-Spalte trägt jetzt `'paddle'`.
4. `provider_price_id` mit Paddle Price-IDs neu befüllen.
5. Frontend (`<PricingTable>`, `<Paywall>`, `useSubscription`) bleibt unverändert.

---

## 8. Troubleshooting

| Symptom                                    | Ursache / Fix                                                                 |
|--------------------------------------------|--------------------------------------------------------------------------------|
| Webhook 401                                | `STRIPE_WEBHOOK_SECRET` fehlt oder Function hat `verify_jwt = true`           |
| `subscriptions`-Zeile entsteht nicht       | Webhook nicht in Stripe Dashboard eingetragen; Service-Role-Key fehlt          |
| User sieht eigene Subscription nicht       | RLS-Policy „Users read own subscriptions" — prüfen ob `auth.uid()=user_id`     |
| Paywall greift bei Admin nicht             | Admin-RBAC umgeht `canAccess` nicht automatisch — eigenen Bypass-Check addieren|
| `canAccess` liefert immer `true`           | Flag `brand.features.subscriptions` steht auf `false` — Erwartet im Master    |
| `access_level` Spalte taucht nicht in Form auf | Flag steht auf `false`, Select wird bewusst nicht gerendert              |
| Stripe-Webhook ist erfolgreich, Tier bleibt `null` | `provider_price_id` matched keinen Plan; `tier` wird aus Plan denormalisiert |

---

## 9. Out of Scope

- **Tags-Vererbung** — bis eine `tags`-Tabelle existiert, wird die Logik nicht
  mitgeführt.
- **Server-Side-RLS-Gating** — aktuell Client/Edge-only. Wenn benötigt:
  Security-Definer-Funktion `can_read_post(post_id)` und Anpassung der
  `posts`-Public-Read-Policy.
- **Free Trials, Coupons, Proration** — Stripe kann das, ist aber im Schema
  nicht modelliert (lebt in `metadata jsonb`).
- **Team-/Org-Subscriptions** — `subscriptions.user_id` ist 1:1 User.
- **Usage-Based-Billing** — nicht vorgesehen.

---

## 10. Glossar

- **Tier**: Stufe (`subscriber`, `premium`) — denormalisiert in
  `subscriptions.tier`, damit Gate-Checks ohne Join laufen.
- **Entitlement**: Feature-spezifische Berechtigung (z. B. `ai_research`),
  unabhängig von Tier. Kann manuell, per Rolle oder via Subscription vergeben werden.
- **MoR (Merchant of Record)**: Verkäufer aus Käufersicht. Paddle ist immer MoR;
  Stripe kann pro Checkout MoR sein (managed_payments).
- **Status** (`subscriptions.status`):
  - `active` — laufend, voller Zugriff
  - `trialing` — Probezeit, voller Zugriff
  - `past_due` — Zahlung fehlgeschlagen, meist noch Zugriff (Stripe-konfigurierbar)
  - `canceled` — beendet, kein Zugriff
  - `incomplete` — Checkout angefangen, nie abgeschlossen
- **Provider**: `stripe` | `paddle` | `manual` (letzteres für komp-Subscriptions)
