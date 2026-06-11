REVOKE SELECT (provider_price_id) ON public.subscription_plans FROM anon;
REVOKE SELECT (provider_price_id) ON public.subscription_plans FROM authenticated;
-- Allow admins/editorial managers via explicit grants is unnecessary because
-- has_role policies run as the table owner via RLS; column privileges still apply
-- to direct queries. Keep provider_price_id readable server-side only (service_role).