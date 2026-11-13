-- Fix security policies to require authentication
-- Update all existing policies to explicitly check for authenticated users

-- Update profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

-- Update leads policies
DROP POLICY IF EXISTS "Lawyers can view leads they have access to" ON public.leads;
DROP POLICY IF EXISTS "Lawyers can view public leads" ON public.leads;
DROP POLICY IF EXISTS "Lead providers and admins can manage leads" ON public.leads;

CREATE POLICY "Lawyers can view assigned leads" ON public.leads
  FOR SELECT TO authenticated
  USING (
    assigned_lawyer_id = auth.uid() OR 
    get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can manage all leads" ON public.leads
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

-- Update cases policies to be more restrictive
DROP POLICY IF EXISTS "Lawyers can view assigned cases" ON public.cases;
DROP POLICY IF EXISTS "Lawyers can create cases" ON public.cases;
DROP POLICY IF EXISTS "Lawyers can update assigned cases" ON public.cases;

CREATE POLICY "Lawyers can view assigned cases" ON public.cases
  FOR SELECT TO authenticated
  USING (
    assigned_lawyer_id = auth.uid() OR 
    get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Lawyers can create cases" ON public.cases
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('lawyer', 'admin'));

CREATE POLICY "Lawyers can update assigned cases" ON public.cases
  FOR UPDATE TO authenticated
  USING (
    assigned_lawyer_id = auth.uid() OR 
    get_user_role(auth.uid()) = 'admin'
  );

-- Update events policies
DROP POLICY IF EXISTS "Users can view their events" ON public.events;
DROP POLICY IF EXISTS "Lawyers can manage events" ON public.events;

CREATE POLICY "Users can view their events" ON public.events
  FOR SELECT TO authenticated
  USING (
    lawyer_id = auth.uid() OR
    client_id = auth.uid() OR
    get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Lawyers can manage events" ON public.events
  FOR ALL TO authenticated
  USING (
    lawyer_id = auth.uid() OR 
    get_user_role(auth.uid()) = 'admin'
  );

-- Update user_roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all user roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

-- Fix function search path issues
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS app_role
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = user_uuid LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;