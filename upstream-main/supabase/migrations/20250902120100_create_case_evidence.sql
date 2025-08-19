CREATE TABLE public.case_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id),
  user_id UUID REFERENCES auth.users(id),
  file_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.case_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY case_evidence_select ON public.case_evidence
  FOR SELECT USING (
    get_user_role(auth.uid()) = 'admin' OR
    user_id = auth.uid() OR
    auth.uid() IN (
      SELECT assigned_lawyer_id FROM public.cases WHERE id = case_id
    ) OR auth.uid() IN (
      SELECT client_id FROM public.cases WHERE id = case_id
    )
  );
CREATE POLICY case_evidence_insert ON public.case_evidence
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) = 'admin' OR
    auth.uid() IN (
      SELECT assigned_lawyer_id FROM public.cases WHERE id = case_id
    ) OR auth.uid() IN (
      SELECT client_id FROM public.cases WHERE id = case_id
    )
  );
