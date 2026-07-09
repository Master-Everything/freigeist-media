Update `supabase/functions/ingest-interview/index.ts` to the new version:

- Add `video_url` to the Zod schema (optional URL, nullable).
- Remove featured-image detection logic (`featuredImageUrl` variable and the `role === "featured"` branch).
- Set `image_url: null` unconditionally in the payload.
- Add `video_url: body.video_url ?? null` to the payload.

No schema/DB changes needed — `posts.video_url` and `posts.image_url` already exist. No config or secret changes.