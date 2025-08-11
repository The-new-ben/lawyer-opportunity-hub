-- Fix RLS policies so the user can view data
-- Update policies to be more open to authenticated users

-- Fix leads policy - allow authenticated users to view leads
DROP POLICY IF EXISTS "Lawyers can view assigned leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can manage all leads" ON public.leads;

CREATE POLICY "Authenticated users can view leads" ON public.leads
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage leads" ON public.leads
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Fix cases policy - allow authenticated users to view cases
DROP POLICY IF EXISTS "Lawyers can view assigned cases" ON public.cases;
DROP POLICY IF EXISTS "Lawyers can create cases" ON public.cases;
DROP POLICY IF EXISTS "Lawyers can update assigned cases" ON public.cases;

CREATE POLICY "Authenticated users can view cases" ON public.cases
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage cases" ON public.cases
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Fix events policy - allow authenticated users to view events
DROP POLICY IF EXISTS "Users can view their events" ON public.events;
DROP POLICY IF EXISTS "Lawyers can manage events" ON public.events;

CREATE POLICY "Authenticated users can view events" ON public.events
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage events" ON public.events
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);