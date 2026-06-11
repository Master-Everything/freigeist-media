ALTER TABLE public.article_checks 
  DROP CONSTRAINT article_checks_check_type_check;

ALTER TABLE public.article_checks 
  ADD CONSTRAINT article_checks_check_type_check 
  CHECK (check_type = ANY (ARRAY[
    'journalism', 'press-release', 'company-news',
    'research-web', 'brainstorm-headlines', 'find-sources', 'generate-outline'
  ]));