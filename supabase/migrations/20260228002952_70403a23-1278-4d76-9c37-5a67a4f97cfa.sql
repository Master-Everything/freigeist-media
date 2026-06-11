
-- Add soft-delete column
ALTER TABLE public.posts ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Update public read policy to exclude soft-deleted rows
DROP POLICY IF EXISTS "Public read published posts" ON public.posts;
CREATE POLICY "Public read published posts"
  ON public.posts
  FOR SELECT
  USING (status = 'published' AND deleted_at IS NULL);
