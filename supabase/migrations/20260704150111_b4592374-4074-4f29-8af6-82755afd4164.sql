
CREATE TABLE public.interview_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  post_slug text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.interview_feedback TO anon, authenticated;
GRANT SELECT, DELETE ON public.interview_feedback TO authenticated;
GRANT ALL ON public.interview_feedback TO service_role;

ALTER TABLE public.interview_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
  ON public.interview_feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(btrim(name)) BETWEEN 1 AND 120
    AND length(btrim(email)) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(btrim(message)) BETWEEN 1 AND 4000
    AND length(btrim(post_slug)) BETWEEN 1 AND 255
  );

CREATE POLICY "Admins and editorial managers can view feedback"
  ON public.interview_feedback
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'editorial_manager')
  );

CREATE POLICY "Admins and editorial managers can delete feedback"
  ON public.interview_feedback
  FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'editorial_manager')
  );

CREATE INDEX interview_feedback_post_id_idx ON public.interview_feedback(post_id);
CREATE INDEX interview_feedback_created_at_idx ON public.interview_feedback(created_at DESC);
