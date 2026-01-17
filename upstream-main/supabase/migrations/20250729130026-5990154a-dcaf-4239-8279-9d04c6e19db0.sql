-- Enable RLS on lead_categories table
ALTER TABLE public.lead_categories ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for lead_categories - only authenticated users can view
CREATE POLICY "Authenticated users can view lead categories" ON public.lead_categories
  FOR SELECT TO authenticated USING (true);

-- Add RLS policy for lead_categories - only admins can manage
CREATE POLICY "Admins can manage lead categories" ON public.lead_categories
  FOR ALL TO authenticated USING (
    get_current_user_role() = 'admin'
  )
  WITH CHECK (
    get_current_user_role() = 'admin'
  );

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

-- For now, remove the broken customer phone policy until proper customer auth is implemented
-- This will be replaced with proper customer authentication later

-- Ensure all other policies require authentication
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.lawyers FORCE ROW LEVEL SECURITY;
ALTER TABLE public.leads FORCE ROW LEVEL SECURITY;
ALTER TABLE public.lead_assignments FORCE ROW LEVEL SECURITY;
ALTER TABLE public.quotes FORCE ROW LEVEL SECURITY;
ALTER TABLE public.deposits FORCE ROW LEVEL SECURITY;
ALTER TABLE public.lead_access FORCE ROW LEVEL SECURITY;
ALTER TABLE public.lead_categories FORCE ROW LEVEL SECURITY;