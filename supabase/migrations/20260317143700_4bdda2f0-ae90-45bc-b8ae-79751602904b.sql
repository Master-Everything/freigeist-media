
CREATE TABLE public.article_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  check_type text NOT NULL CHECK (check_type IN ('journalism', 'press-release', 'company-news')),
  result text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_article_checks_post_type ON public.article_checks (post_id, check_type, created_at DESC);

ALTER TABLE public.article_checks ENABLE ROW LEVEL SECURITY;

-- All authenticated editors/managers/admins can read checks
CREATE POLICY "Authenticated users can read article checks"
  ON public.article_checks FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'editorial_manager') OR
    has_role(auth.uid(), 'editor')
  );

-- Authenticated users with roles can insert checks
CREATE POLICY "Authenticated users can insert article checks"
  ON public.article_checks FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND (
      has_role(auth.uid(), 'admin') OR
      has_role(auth.uid(), 'editorial_manager') OR
      has_role(auth.uid(), 'editor')
    )
  );
