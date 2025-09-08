ALTER TABLE public.cases ADD COLUMN case_number TEXT UNIQUE;
ALTER TABLE public.cases ADD COLUMN invite_token TEXT;
