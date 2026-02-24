-- Enable row level security on core tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Leads policies
CREATE POLICY "Manage own leads" ON public.leads
  FOR ALL USING (
    get_current_user_role() = 'admin'
    OR assigned_lawyer_id IN (
      SELECT l.id FROM public.lawyers l
      JOIN public.profiles p ON l.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    get_current_user_role() = 'admin'
    OR assigned_lawyer_id IN (
      SELECT l.id FROM public.lawyers l
      JOIN public.profiles p ON l.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Cases policies
CREATE POLICY "Manage own cases" ON public.cases
  FOR ALL USING (
    get_current_user_role() = 'admin'
    OR assigned_lawyer_id = (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    OR client_id = (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    get_current_user_role() = 'admin'
    OR assigned_lawyer_id = (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    OR client_id = (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Payments policies
CREATE POLICY "Manage own payments" ON public.payments
  FOR ALL USING (
    get_current_user_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.contracts c
      JOIN public.profiles p ON c.lawyer_id = p.id
      WHERE c.id = payments.contract_id AND p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.contracts c
      JOIN public.profiles p ON c.client_id = p.id
      WHERE c.id = payments.contract_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    get_current_user_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.contracts c
      JOIN public.profiles p ON c.lawyer_id = p.id
      WHERE c.id = payments.contract_id AND p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.contracts c
      JOIN public.profiles p ON c.client_id = p.id
      WHERE c.id = payments.contract_id AND p.user_id = auth.uid()
    )
  );

-- Meetings policies
CREATE POLICY "Manage own meetings" ON public.meetings
  FOR ALL USING (
    get_current_user_role() = 'admin'
    OR lawyer_id IN (
      SELECT l.id FROM public.lawyers l
      JOIN public.profiles p ON l.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
    OR client_id = (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    get_current_user_role() = 'admin'
    OR lawyer_id IN (
      SELECT l.id FROM public.lawyers l
      JOIN public.profiles p ON l.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
    OR client_id = (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );
