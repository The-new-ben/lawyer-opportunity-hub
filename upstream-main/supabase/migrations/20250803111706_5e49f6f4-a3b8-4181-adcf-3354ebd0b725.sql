-- Step 1: Create comprehensive user roles system
-- Add app_role enum if not exists
CREATE TYPE app_role AS ENUM ('admin', 'lawyer', 'client', 'supplier', 'customer');

-- Update profiles table to use proper role structure
ALTER TABLE public.profiles 
  ALTER COLUMN role TYPE app_role USING role::app_role;

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
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all user roles" ON public.user_roles
  FOR ALL
  USING (get_current_user_role() = 'admin');

-- Create a proper lawyer specializations table structure
DROP TABLE IF EXISTS public.lawyer_specializations CASCADE;
CREATE TABLE public.lawyer_specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID NOT NULL REFERENCES public.lawyers(id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  experience_years INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on lawyer_specializations
ALTER TABLE public.lawyer_specializations ENABLE ROW LEVEL SECURITY;

-- Create policies for lawyer_specializations
CREATE POLICY "Authenticated users can view specializations" ON public.lawyer_specializations
  FOR SELECT
  USING (true);

CREATE POLICY "Lawyers can manage their specializations" ON public.lawyer_specializations
  FOR ALL
  USING (lawyer_id IN (
    SELECT l.id FROM lawyers l
    JOIN profiles p ON l.profile_id = p.id
    WHERE p.user_id = auth.uid()
  ));

-- Create improved matching algorithm function
CREATE OR REPLACE FUNCTION public.calculate_matching_score(
  p_lawyer_id UUID, 
  p_legal_category TEXT, 
  p_estimated_budget NUMERIC DEFAULT 0
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  score INTEGER := 0;
  specialization_match BOOLEAN := false;
  lawyer_rating NUMERIC := 0;
  lawyer_experience INTEGER := 0;
BEGIN
  -- Check if lawyer has matching specialization
  SELECT EXISTS(
    SELECT 1 FROM lawyer_specializations ls 
    WHERE ls.lawyer_id = p_lawyer_id 
    AND ls.specialization ILIKE '%' || p_legal_category || '%'
  ) INTO specialization_match;
  
  -- Get lawyer rating and experience
  SELECT COALESCE(l.rating, 0), COALESCE(l.years_experience, 0)
  INTO lawyer_rating, lawyer_experience
  FROM lawyers l
  WHERE l.id = p_lawyer_id;
  
  -- Calculate base score
  score := 50;
  
  -- Specialization match bonus
  IF specialization_match THEN
    score := score + 30;
  END IF;
  
  -- Rating bonus (0-5 stars = 0-20 points)
  score := score + (lawyer_rating * 4)::INTEGER;
  
  -- Experience bonus (capped at 20 points)
  score := score + LEAST(lawyer_experience, 20);
  
  -- Ensure score is between 0 and 100
  score := GREATEST(0, LEAST(100, score));
  
  RETURN score;
END;
$$;

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

CREATE TRIGGER trg_notify_lead_assignment
  AFTER INSERT OR UPDATE OF assigned_lawyer_id ON public.leads
  FOR EACH ROW 
  WHEN (NEW.assigned_lawyer_id IS NOT NULL)
  EXECUTE FUNCTION notify_lead_assignment();