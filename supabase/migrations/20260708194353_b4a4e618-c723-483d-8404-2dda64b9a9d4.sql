ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS source_engine_post_id uuid,
  ADD COLUMN IF NOT EXISTS source_engine_pushed_at timestamptz;

CREATE INDEX IF NOT EXISTS posts_source_engine_post_id_idx
  ON public.posts (source_engine_post_id);

INSERT INTO public.categories (name, slug, color, icon, description)
VALUES (
  'Interview',
  'interview',
  '#2A809B',
  'MessageSquare',
  'Interviews mit Speakern und Experten'
)
ON CONFLICT (slug) DO NOTHING;