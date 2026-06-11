
-- Editors can read all posts (including drafts) for editing
CREATE POLICY "Editors can select all posts"
ON public.posts FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'editor'::app_role));

-- Editors can create posts
CREATE POLICY "Editors can insert posts"
ON public.posts FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'editor'::app_role));

-- Editors can update posts
CREATE POLICY "Editors can update posts"
ON public.posts FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'editor'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'editor'::app_role));

-- Editors can read categories
CREATE POLICY "Editors can read categories"
ON public.categories FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'editor'::app_role));
