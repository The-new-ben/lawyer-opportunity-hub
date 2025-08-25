-- Fix critical security issues

-- 1. Add missing policy for role_permissions table
CREATE POLICY "Admins can view and manage role permissions" 
ON public.role_permissions 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- 2. Fix function search paths for security
CREATE OR REPLACE FUNCTION public.auto_assign_lawyer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_lawyer_id UUID;
BEGIN
  -- Find best matching lawyer
  SELECT l.id INTO v_lawyer_id
  FROM lawyers l
  JOIN profiles p ON l.profile_id = p.id
  WHERE l.is_active = true 
    AND l.verification_status = 'verified'
    AND l.availability_status = 'available'
  ORDER BY calculate_matching_score(l.id, NEW.legal_category, NEW.estimated_budget) DESC,
           l.rating DESC,
           l.total_cases ASC
  LIMIT 1;
  
  -- Update lead with assigned lawyer
  IF v_lawyer_id IS NOT NULL THEN
    NEW.assigned_lawyer_id := v_lawyer_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_lead_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- This will be used by edge functions to send notifications
  PERFORM pg_notify('lead_assigned', json_build_object(
    'lead_id', NEW.id,
    'lawyer_id', NEW.assigned_lawyer_id,
    'customer_name', NEW.customer_name,
    'customer_phone', NEW.customer_phone,
    'legal_category', NEW.legal_category
  )::text);
  
  RETURN NEW;
END;
$function$;

-- 3. Fix anonymous access policies by ensuring they require authentication
-- Update policies to be more restrictive where needed

-- Update lawyer specializations to require authentication
DROP POLICY IF EXISTS "Authenticated users can view specializations" ON public.lawyer_specializations;
CREATE POLICY "Authenticated users can view specializations" 
ON public.lawyer_specializations 
FOR SELECT 
TO authenticated
USING (true);

-- Update lawyers policy to require authentication
DROP POLICY IF EXISTS "Authenticated users can view verified lawyers" ON public.lawyers;
CREATE POLICY "Authenticated users can view verified lawyers" 
ON public.lawyers 
FOR SELECT 
TO authenticated
USING ((verification_status = 'verified') AND (is_active = true));

-- Update suppliers policy to require authentication
DROP POLICY IF EXISTS "Authenticated users can view active suppliers" ON public.suppliers;
CREATE POLICY "Authenticated users can view active suppliers" 
ON public.suppliers 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Update lawyer tiers policy to require authentication
DROP POLICY IF EXISTS "Authenticated users can view lawyer tiers for marketplace" ON public.lawyer_tiers;
CREATE POLICY "Authenticated users can view lawyer tiers for marketplace" 
ON public.lawyer_tiers 
FOR SELECT 
TO authenticated
USING (true);

-- Update lead categories policy to require authentication
DROP POLICY IF EXISTS "Authenticated users can view lead categories" ON public.lead_categories;
CREATE POLICY "Authenticated users can view lead categories" 
ON public.lead_categories 
FOR SELECT 
TO authenticated
USING (is_active = true);