-- Restrict access to provider_price_id at column level
REVOKE SELECT (provider_price_id) ON public.subscription_plans FROM anon;
REVOKE SELECT (provider_price_id) ON public.subscription_plans FROM authenticated;

-- Re-grant SELECT on all other columns explicitly so existing queries still work
GRANT SELECT (
  id, slug, name, description, tier, price_cents, currency,
  interval, is_active, sort_order, created_at, updated_at
) ON public.subscription_plans TO anon, authenticated;