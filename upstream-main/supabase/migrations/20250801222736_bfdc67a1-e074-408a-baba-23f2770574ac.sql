-- Security Fixes Migration
-- Phase 1: Critical Security Issues

-- 1. Secure the profiles table - remove ability for users to update their own role
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create a more secure policy that prevents role escalation
CREATE POLICY "Users can update their own profile (no role changes)" 
ON public.profiles 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() AND 
  -- Prevent role changes by ensuring role stays the same
  role = (SELECT role FROM public.profiles WHERE user_id = auth.uid())
);

-- 2. Create admin-only policy for role changes
CREATE POLICY "Admins can update any profile role" 
ON public.profiles 
FOR UPDATE 
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- 3. Secure user_roles table - make it admin-only for modifications
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;

CREATE POLICY "Admins can manage all user roles" 
ON public.user_roles 
FOR ALL 
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- 4. Fix overly permissive policies on cases table
DROP POLICY IF EXISTS "Authenticated users can manage cases" ON public.cases;
DROP POLICY IF EXISTS "Authenticated users can view cases" ON public.cases;

-- Create proper role-based policies for cases
CREATE POLICY "Lawyers can manage assigned cases" 
ON public.cases 
FOR ALL 
USING (
  assigned_lawyer_id IN (
    SELECT l.id FROM lawyers l 
    JOIN profiles p ON l.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  ) OR 
  get_current_user_role() = 'admin'
)
WITH CHECK (
  assigned_lawyer_id IN (
    SELECT l.id FROM lawyers l 
    JOIN profiles p ON l.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  ) OR 
  get_current_user_role() = 'admin'
);

CREATE POLICY "Clients can view their own cases" 
ON public.cases 
FOR SELECT 
USING (
  client_id IN (
    SELECT profiles.id FROM profiles 
    WHERE profiles.user_id = auth.uid()
  ) OR
  assigned_lawyer_id IN (
    SELECT l.id FROM lawyers l 
    JOIN profiles p ON l.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  ) OR 
  get_current_user_role() = 'admin'
);

-- 5. Fix overly permissive policies on events table
DROP POLICY IF EXISTS "Authenticated users can manage events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can view events" ON public.events;

-- Create proper role-based policies for events
CREATE POLICY "Lawyers can manage their own events" 
ON public.events 
FOR ALL 
USING (
  lawyer_id IN (
    SELECT l.id FROM lawyers l 
    JOIN profiles p ON l.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  ) OR 
  get_current_user_role() = 'admin'
)
WITH CHECK (
  lawyer_id IN (
    SELECT l.id FROM lawyers l 
    JOIN profiles p ON l.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  ) OR 
  get_current_user_role() = 'admin'
);

CREATE POLICY "Clients can view their own events" 
ON public.events 
FOR SELECT 
USING (
  client_id IN (
    SELECT profiles.id FROM profiles 
    WHERE profiles.user_id = auth.uid()
  ) OR
  lawyer_id IN (
    SELECT l.id FROM lawyers l 
    JOIN profiles p ON l.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  ) OR 
  get_current_user_role() = 'admin'
);

-- 6. Fix overly permissive policies on leads table
DROP POLICY IF EXISTS "Authenticated users can manage leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;

-- Create proper role-based policies for leads
CREATE POLICY "Lawyers and admins can manage leads" 
ON public.leads 
FOR ALL 
USING (
  get_current_user_role() IN ('admin', 'lawyer', 'lead_provider')
)
WITH CHECK (
  get_current_user_role() IN ('admin', 'lawyer', 'lead_provider')
);

CREATE POLICY "Customers can view their own leads" 
ON public.leads 
FOR SELECT 
USING (
  customer_phone = (auth.uid())::text OR
  get_current_user_role() IN ('admin', 'lawyer', 'lead_provider')
);

-- 7. Secure database functions with proper search_path
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role FROM public.user_roles WHERE user_id = user_uuid LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role::text FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$function$;

-- 8. Create audit logging for sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (get_current_user_role() = 'admin');

-- 9. Create function to log role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log role changes to audit table
  INSERT INTO public.audit_logs (
    user_id, 
    action, 
    table_name, 
    record_id, 
    old_values, 
    new_values
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    to_jsonb(OLD),
    to_jsonb(NEW)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create triggers for role change auditing
DROP TRIGGER IF EXISTS audit_user_roles_changes ON public.user_roles;
CREATE TRIGGER audit_user_roles_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_role_change();

DROP TRIGGER IF EXISTS audit_profile_role_changes ON public.profiles;
CREATE TRIGGER audit_profile_role_changes
  AFTER UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_role_change();