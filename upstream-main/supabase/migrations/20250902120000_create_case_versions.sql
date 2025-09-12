CREATE TABLE public.case_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id),
  version INTEGER NOT NULL,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(case_id, version)
);
ALTER TABLE public.case_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY case_versions_select ON public.case_versions
  FOR SELECT USING (
    get_user_role(auth.uid()) = 'admin' OR
    created_by = auth.uid() OR
    auth.uid() IN (
      SELECT assigned_lawyer_id FROM public.cases WHERE id = case_id
    ) OR auth.uid() IN (
      SELECT client_id FROM public.cases WHERE id = case_id
    )
  );
CREATE POLICY case_versions_insert ON public.case_versions
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) = 'admin' OR
    auth.uid() IN (
      SELECT assigned_lawyer_id FROM public.cases WHERE id = case_id
    ) OR auth.uid() IN (
      SELECT client_id FROM public.cases WHERE id = case_id
    )
  );
