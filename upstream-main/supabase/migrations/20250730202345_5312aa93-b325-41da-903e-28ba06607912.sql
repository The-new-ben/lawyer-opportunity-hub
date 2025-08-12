-- Create matching engine tables and functionality

-- Table for storing lawyer specializations and capabilities
CREATE TABLE public.lawyer_specializations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lawyer_id UUID NOT NULL,
  specialization TEXT NOT NULL,
  experience_years INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lawyer_specializations ENABLE ROW LEVEL SECURITY;

-- Create policies for lawyer specializations
CREATE POLICY "Lawyers can manage their specializations" 
ON public.lawyer_specializations 
FOR ALL 
USING (lawyer_id IN (
  SELECT l.id FROM lawyers l 
  JOIN profiles p ON l.profile_id = p.id 
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Authenticated users can view specializations" 
ON public.lawyer_specializations 
FOR SELECT 
USING (true);

-- Table for digital contracts
CREATE TABLE public.digital_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL,
  contract_content TEXT NOT NULL,
  lawyer_signature TEXT,
  client_signature TEXT,
  lawyer_signed_at TIMESTAMP WITH TIME ZONE,
  client_signed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.digital_contracts ENABLE ROW LEVEL SECURITY;

-- Create policies for digital contracts
CREATE POLICY "Contract parties can manage contracts" 
ON public.digital_contracts 
FOR ALL 
USING (
  quote_id IN (
    SELECT q.id FROM quotes q 
    JOIN lawyers l ON q.lawyer_id = l.id 
    JOIN profiles p ON l.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  ) OR 
  quote_id IN (
    SELECT q.id FROM quotes q 
    JOIN leads ld ON q.lead_id = ld.id 
    WHERE ld.customer_phone = auth.uid()::text
  )
);

-- Table for commission tracking
CREATE TABLE public.commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  commission_rate NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Create policies for commissions
CREATE POLICY "System manages commissions" 
ON public.commissions 
FOR ALL 
USING (true);

-- Function to calculate lawyer matching score
CREATE OR REPLACE FUNCTION public.calculate_matching_score(
  p_lawyer_id UUID,
  p_legal_category TEXT,
  p_estimated_budget NUMERIC DEFAULT 0
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Function to get matched lawyers for a lead
CREATE OR REPLACE FUNCTION public.get_matched_lawyers(
  p_lead_id UUID,
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
  lawyer_id UUID,
  lawyer_name TEXT,
  specializations TEXT[],
  rating NUMERIC,
  hourly_rate NUMERIC,
  matching_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    p.full_name,
    ARRAY_AGG(DISTINCT ls.specialization) as specializations,
    l.rating,
    l.hourly_rate,
    calculate_matching_score(l.id, ld.legal_category, ld.estimated_budget) as matching_score
  FROM lawyers l
  JOIN profiles p ON l.profile_id = p.id
  LEFT JOIN lawyer_specializations ls ON l.id = ls.lawyer_id
  CROSS JOIN leads ld
  WHERE ld.id = p_lead_id
    AND l.is_active = true
    AND l.verification_status = 'verified'
  GROUP BY l.id, p.full_name, l.rating, l.hourly_rate, ld.legal_category, ld.estimated_budget
  ORDER BY matching_score DESC, l.rating DESC
  LIMIT p_limit;
END;
$$;

-- Add updated_at trigger for digital_contracts
CREATE TRIGGER update_digital_contracts_updated_at
  BEFORE UPDATE ON public.digital_contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();