-- Step 2: Complete the lead lifecycle and fix security issues
-- Add missing policies for role_permissions table
CREATE POLICY "Authenticated users can view role permissions" ON public.role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.auto_assign_lawyer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.notify_lead_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Complete lead to client conversion with proper case creation
CREATE OR REPLACE FUNCTION public.convert_lead_to_client_complete(p_lead_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_lead leads%ROWTYPE;
  v_client_id UUID;
  v_case_id UUID;
  v_result JSON;
BEGIN
  -- Get lead details
  SELECT * INTO v_lead FROM leads WHERE id = p_lead_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found';
  END IF;
  
  -- Check if already converted
  IF v_lead.status = 'converted' THEN
    RAISE EXCEPTION 'Lead already converted';
  END IF;
  
  -- Create or find client in profiles
  INSERT INTO profiles (user_id, full_name, phone, role, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_lead.customer_name,
    v_lead.customer_phone,
    'client',
    now(),
    now()
  )
  ON CONFLICT (phone) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    updated_at = now()
  RETURNING id INTO v_client_id;
  
  -- Create new case
  INSERT INTO cases (
    title,
    client_id,
    assigned_lawyer_id,
    legal_category,
    estimated_budget,
    priority,
    status,
    opened_at,
    created_at,
    updated_at
  ) VALUES (
    'Handling ' || v_lead.legal_category || ' for ' || v_lead.customer_name,
    v_client_id,
    v_lead.assigned_lawyer_id,
    v_lead.legal_category,
    v_lead.estimated_budget,
    v_lead.urgency_level,
    'open',
    now(),
    now(),
    now()
  ) RETURNING id INTO v_case_id;
  
  -- Update lead status
  UPDATE leads 
  SET status = 'converted', updated_at = now()
  WHERE id = p_lead_id;
  
  -- Prepare result
  v_result := json_build_object(
    'client_id', v_client_id,
    'case_id', v_case_id,
    'lead_id', p_lead_id,
    'success', true
  );
  
  RETURN v_result;
END;
$$;

-- Create meetings/events table for scheduling
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  lawyer_id UUID NOT NULL REFERENCES public.lawyers(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  meeting_type TEXT NOT NULL DEFAULT 'in_person',
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on meetings
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Create comprehensive meetings policies
CREATE POLICY "Meeting participants can view meetings" ON public.meetings
  FOR SELECT
  TO authenticated
  USING (
    lawyer_id IN (
      SELECT l.id FROM lawyers l
      JOIN profiles p ON l.profile_id = p.id
      WHERE p.user_id = auth.uid()
    ) OR
    client_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    ) OR
    get_current_user_role() = 'admin'
  );

CREATE POLICY "Lawyers and admins can manage meetings" ON public.meetings
  FOR ALL
  TO authenticated
  USING (
    lawyer_id IN (
      SELECT l.id FROM lawyers l
      JOIN profiles p ON l.profile_id = p.id
      WHERE p.user_id = auth.uid()
    ) OR
    get_current_user_role() = 'admin'
  );

-- Create deposits/payments tracking for lead process
CREATE TABLE IF NOT EXISTS public.lead_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES public.lawyers(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT DEFAULT 'credit_card',
  stripe_session_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on lead_deposits
ALTER TABLE public.lead_deposits ENABLE ROW LEVEL SECURITY;

-- Create policies for lead_deposits
CREATE POLICY "Lead deposit participants can view deposits" ON public.lead_deposits
  FOR SELECT
  TO authenticated
  USING (
    lawyer_id IN (
      SELECT l.id FROM lawyers l
      JOIN profiles p ON l.profile_id = p.id
      WHERE p.user_id = auth.uid()
    ) OR
    lead_id IN (
      SELECT id FROM leads WHERE customer_phone = auth.uid()::text
    ) OR
    get_current_user_role() = 'admin'
  );

CREATE POLICY "System can manage lead deposits" ON public.lead_deposits
  FOR ALL
  TO authenticated
  USING (true);