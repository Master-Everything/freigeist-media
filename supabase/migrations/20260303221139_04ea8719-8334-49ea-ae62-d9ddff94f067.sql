-- Migrate existing absolute image URLs to relative paths in the posts table.
-- Strips the Supabase storage base URL prefix, leaving "post-images/filename.ext"

-- 1. Update image_url column
UPDATE public.posts
SET image_url = regexp_replace(
  image_url,
  '^https?://[^/]+/storage/v1/object/public/',
  ''
)
WHERE image_url IS NOT NULL
  AND image_url ~ '^https?://[^/]+/storage/v1/object/public/post-images/';

-- 2. Update content column (replace all occurrences of absolute storage URLs in HTML)
UPDATE public.posts
SET content = regexp_replace(
  content,
  'https?://[^"'']+/storage/v1/object/public/(post-images/[^"''?\s)]+)',
  '\1',
  'g'
)
WHERE content IS NOT NULL
  AND content ~ 'storage/v1/object/public/post-images/';