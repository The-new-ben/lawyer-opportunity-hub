-- Continue with Step 1: Fix missing components for the user roles system
-- Create user_roles table for enhanced role management  
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
CREATE POLICY "Admins can manage all user roles" ON public.user_roles
  FOR ALL
  USING (get_current_user_role() = 'admin');

-- Create automatic lawyer assignment function
CREATE OR REPLACE FUNCTION public.auto_assign_lawyer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Create trigger for automatic lawyer assignment
DROP TRIGGER IF EXISTS trg_auto_assign_lawyer ON public.leads;
CREATE TRIGGER trg_auto_assign_lawyer
  BEFORE INSERT ON public.leads
  FOR EACH ROW 
  EXECUTE FUNCTION auto_assign_lawyer();

-- Add notification triggers  
CREATE OR REPLACE FUNCTION public.notify_lead_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

DROP TRIGGER IF EXISTS trg_notify_lead_assignment ON public.leads;
CREATE TRIGGER trg_notify_lead_assignment
  AFTER INSERT OR UPDATE OF assigned_lawyer_id ON public.leads
  FOR EACH ROW 
  WHEN (NEW.assigned_lawyer_id IS NOT NULL)
  EXECUTE FUNCTION notify_lead_assignment();