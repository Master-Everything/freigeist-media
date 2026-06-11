
-- Add image_url column to posts
ALTER TABLE public.posts ADD COLUMN image_url text;

-- Create storage bucket for post images
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true);

-- Allow anyone to view post images
CREATE POLICY "Public read post images"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

-- Allow authenticated admins to upload post images
CREATE POLICY "Admins can upload post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-images' AND public.has_role(auth.uid(), 'admin'));

-- Allow authenticated admins to update post images
CREATE POLICY "Admins can update post images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'post-images' AND public.has_role(auth.uid(), 'admin'));

-- Allow authenticated admins to delete post images
CREATE POLICY "Admins can delete post images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'post-images' AND public.has_role(auth.uid(), 'admin'));
