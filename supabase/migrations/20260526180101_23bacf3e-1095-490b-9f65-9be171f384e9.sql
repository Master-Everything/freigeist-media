
-- Restrict sensitive payment columns from public Data API access.
-- subscription_plans.provider_price_id: Stripe price IDs must not leak to clients.
REVOKE SELECT ON public.subscription_plans FROM anon, authenticated;
GRANT SELECT (id, name, slug, description, price_cents, currency, tier, interval, is_active, sort_order, created_at, updated_at) ON public.subscription_plans TO anon, authenticated;

-- subscriptions: hide raw payment provider identifiers and metadata from end users.
REVOKE SELECT ON public.subscriptions FROM anon, authenticated;
GRANT SELECT (id, user_id, plan_id, provider, tier, status, current_period_end, cancel_at, canceled_at, created_at, updated_at) ON public.subscriptions TO authenticated;
