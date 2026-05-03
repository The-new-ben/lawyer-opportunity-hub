ALTER TABLE public.cases ADD COLUMN summary TEXT;
ALTER TABLE public.cases ADD COLUMN reviewed BOOLEAN NOT NULL DEFAULT false;

