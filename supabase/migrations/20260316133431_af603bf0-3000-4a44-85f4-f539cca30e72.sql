CREATE POLICY "Editorial managers can upload post images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'post-images' AND public.has_role(auth.uid(), 'editorial_manager'));

CREATE POLICY "Editorial managers can update post images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'post-images' AND public.has_role(auth.uid(), 'editorial_manager'));

CREATE POLICY "Editorial managers can delete post images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'post-images' AND public.has_role(auth.uid(), 'editorial_manager'));