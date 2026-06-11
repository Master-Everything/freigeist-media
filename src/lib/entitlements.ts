/**
 * Entitlement helpers — pure TS, no network calls.
 *
 * This module powers the dormant subscription system. When
 * `brand.features.subscriptions` is false, `canAccess()` always returns true,
 * so every gated check is a no-op until a remix flips the flag.
 */

import { brand } from "@/config/brand";

export type AccessLevel = "public" | "subscriber" | "premium";

export const ACCESS_LEVEL_RANK: Record<AccessLevel, number> = {
  public: 0,
  subscriber: 1,
  premium: 2,
};

export type AccessLevelSource = "post" | "category" | "default";

export interface ResolvedAccess {
  level: AccessLevel;
  source: AccessLevelSource;
}

interface PostLike {
  access_level?: AccessLevel | null;
}

interface CategoryLike {
  default_access_level?: AccessLevel | null;
}

/**
 * Determine the effective access level for a post.
 * Post-level value wins; otherwise inherit from category; otherwise public.
 */
export function resolveAccessLevel(
  post: PostLike | null | undefined,
  category: CategoryLike | null | undefined,
): ResolvedAccess {
  if (post?.access_level) {
    return { level: post.access_level, source: "post" };
  }
  if (category?.default_access_level && category.default_access_level !== "public") {
    return { level: category.default_access_level, source: "category" };
  }
  return { level: "public", source: "default" };
}

/**
 * Whether a user with the given tier can access content requiring `required`.
 * When subscriptions are disabled globally, access is always granted.
 */
export function canAccess(
  required: AccessLevel,
  userTier: AccessLevel | null,
): boolean {
  if (!brand.features.subscriptions) return true;
  if (required === "public") return true;
  if (!userTier) return false;
  return ACCESS_LEVEL_RANK[userTier] >= ACCESS_LEVEL_RANK[required];
}
