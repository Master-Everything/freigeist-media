## Plan: Update Changelog with Changes After v2.0.5

Only two actual code/repo changes happened after v2.0.5 (May 28). Everything else since then has been Q&A (social media sharing, Substack, Narrareach) with no file edits.

### New entries to add at the top of `src/pages/admin/AdminChangelog.tsx`

**Friday, May 29, 2026**

- **v2.0.7 — Dark Mode as Default**
  - *Changed*: `defaultTheme` in `src/App.tsx` switched from `"light"` to `"dark"`. First-time visitors without a saved preference now see dark mode; `enableSystem` still honours an explicit OS-level light/dark setting, and any manual toggle is persisted in `localStorage`.

- **v2.0.6 — PDF Magazine Plan Saved**
  - *Added*: Saved the 4-layer PDF Magazine plan to `.lovable/plan.md` for later implementation. Covers (1) `magazine_issues` + `magazine_issue_posts` data model and `/admin/magazine` UI, (2) `generate-magazine-pdf` edge function (Browserless/Playwright vs `@react-pdf/renderer`), (3) activation of the dormant subscription system with Stripe + `<Paywall>` / `<PricingTable>` / `useSubscription`, and (4) `dispatch-magazine-issue` for monthly delivery to subscribers. Plan still has 4 open decisions (PDF engine, pricing model, cadence, languages).

### File touched

- `src/pages/admin/AdminChangelog.tsx` — insert a new `Day` object for May 29, 2026 at the top of the `days` array, containing both entries above. No other files change.
