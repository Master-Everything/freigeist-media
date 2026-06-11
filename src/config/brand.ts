/**
 * Central brand configuration — single source of truth for project-specific values.
 *
 * When remixing this project, update the values below to rebrand the entire app.
 * Logo: replace the file referenced by `logoSrc` (or change the import path).
 *
 * Edge functions (e.g. supabase/functions/rss) read their own values from env vars
 * such as SITE_URL / BRAND_NAME / BRAND_DESCRIPTION — set those on the new project.
 */

import logoSrc from "@/assets/ciras-logo.png";

export type PaymentProvider = "stripe" | "paddle" | "none";

export interface BrandFeatures {
  /** Master switch for the subscription/paywall system. Off in master, on per remix. */
  subscriptions: boolean;
}

export interface BrandPayments {
  provider: PaymentProvider;
}

export const brand = {
  /** All-caps lockup used in headers, admin chrome, auth screens */
  shortName: "CIRAS MAGAZINE & TV",
  /** Mixed-case brand name used in body copy, legal pages, RSS */
  name: "CIRAS Magazine & TV",
  /** Browser tab + social title (also set statically in index.html) */
  siteTitle: "CIRAS — MAGAZINE & TV for Interdisciplinary Research and Applied Science",
  /** One-line site tagline (footer, RSS description) */
  siteDescription: "CIRAS MAGAZINE & TV for Interdisciplinary Research and Applied Science — covering global cooperation, sustainable development, and scientific advancement.",
  /** Canonical production URL — used for absolute share links */
  productionUrl: "https://magazine.ciras.org",
  /** Public press / contact email shown on legal pages */
  contactEmail: "magazine@ciras.org",
  /** Logo image (h-7 in footer, h-14 in header). Replace the file or import. */
  logoSrc,
  /** Logo alt text */
  logoAlt: "CIRAS",
  /** External CTAs rendered in the header */
  externalLinks: {
    genesisBond: { label: "CIRAS IIGO", url: "https://www.ciras.org/" },
    marketplace: { label: "CIRAS INSTITUTE ", url: "https://www.ciras.org/institute/" },
  },
  /** Feature flags — kept off in the master project, enabled per remix */
  features: {
    subscriptions: false,
  } as BrandFeatures,
  /** Payment provider configuration — only used when features.subscriptions is true */
  payments: {
    provider: "stripe",
  } as BrandPayments,
} as const;