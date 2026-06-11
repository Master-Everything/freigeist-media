-- 1. Add created_by column
ALTER TABLE public.posts ADD COLUMN created_by uuid;

-- 2. Drop old editor UPDATE policy
DROP POLICY IF EXISTS "Editors can update posts" ON public.posts;

-- 3. Create new editor UPDATE policy with ownership check
CREATE POLICY "Editors can update own posts"
ON public.posts FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'editor'::app_role) AND created_by = auth.uid())
WITH CHECK (has_role(auth.uid(), 'editor'::app_role) AND created_by = auth.uid());