DROP POLICY IF EXISTS "Public read published posts" ON public.posts;

CREATE POLICY "Public read published public posts"
ON public.posts
FOR SELECT
TO anon, authenticated
USING (
  status = 'published'
  AND deleted_at IS NULL
  AND (access_level IS NULL OR access_level = 'public'::public.access_level)
);

CREATE POLICY "Subscribers read entitled published posts"
ON public.posts
FOR SELECT
TO authenticated
USING (
  status = 'published'
  AND deleted_at IS NULL
  AND access_level IS NOT NULL
  AND access_level <> 'public'::public.access_level
  AND (
    EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.user_id = auth.uid()
        AND s.status IN ('active', 'trialing', 'past_due')
        AND (
          s.tier = posts.access_level
          OR (posts.access_level = 'subscriber'::public.access_level AND s.tier = 'premium'::public.access_level)
        )
    )
    OR EXISTS (
      SELECT 1 FROM public.entitlements e
      WHERE e.user_id = auth.uid()
        AND e.feature = posts.access_level::text
        AND (e.expires_at IS NULL OR e.expires_at > now())
    )
  )
);