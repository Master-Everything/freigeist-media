DROP POLICY IF EXISTS "Public read post images" ON storage.objects;

CREATE POLICY "Admins can list post images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'post-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Editorial managers can list post images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'post-images' AND public.has_role(auth.uid(), 'editorial_manager'));

CREATE POLICY "Editors can list post images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'post-images' AND public.has_role(auth.uid(), 'editor'));