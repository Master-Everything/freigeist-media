-- Allow editorial managers to select all posts
CREATE POLICY "Editorial managers can select all posts"
ON public.posts FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'editorial_manager'));

-- Allow editorial managers to update all posts
CREATE POLICY "Editorial managers can update all posts"
ON public.posts FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'editorial_manager'))
WITH CHECK (has_role(auth.uid(), 'editorial_manager'));

-- Allow editorial managers to insert posts
CREATE POLICY "Editorial managers can insert posts"
ON public.posts FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'editorial_manager'));

-- Allow editorial managers to read categories
CREATE POLICY "Editorial managers can read categories"
ON public.categories FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'editorial_manager'));