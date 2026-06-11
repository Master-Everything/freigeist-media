CREATE POLICY "Editors can read all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Editorial managers can read all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'editorial_manager'::app_role));