-- Fix database function security by setting proper search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Update profiles table to prevent role self-assignment
-- Remove the ability for users to update their own role
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile (except role)" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id 
    AND (
      role = (SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1)
      OR get_current_user_role() = 'admin'
    )
  );

-- Add admin-only role assignment policy
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE TO authenticated USING (
    get_current_user_role() = 'admin'
  );

-- Fix customer access control - update leads RLS policies
DROP POLICY IF EXISTS "Customers can view their own leads" ON public.leads;

-- Ensure all tables have FORCE RLS enabled (prevents bypassing RLS)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.lawyers FORCE ROW LEVEL SECURITY;
ALTER TABLE public.leads FORCE ROW LEVEL SECURITY;
ALTER TABLE public.lead_assignments FORCE ROW LEVEL SECURITY;
ALTER TABLE public.quotes FORCE ROW LEVEL SECURITY;
ALTER TABLE public.deposits FORCE ROW LEVEL SECURITY;
ALTER TABLE public.lead_access FORCE ROW LEVEL SECURITY;
ALTER TABLE public.lead_categories FORCE ROW LEVEL SECURITY;