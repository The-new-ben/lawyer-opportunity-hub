CREATE TABLE public.evidence_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  case_id UUID REFERENCES public.cases(id),
  document_url TEXT,
  description TEXT,
  evidence_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX evidence_versions_text_idx ON public.evidence_versions USING GIN (to_tsvector('english', evidence_text));
