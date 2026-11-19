-- Fix security issues by adding proper authentication checks to RLS policies

-- Fix the lawyer_tiers policy to require authentication for viewing marketplace
DROP POLICY "Everyone can view lawyer tiers for marketplace" ON public.lawyer_tiers;
CREATE POLICY "Authenticated users can view lawyer tiers for marketplace" 
ON public.lawyer_tiers 
FOR SELECT 
TO authenticated
USING (true);

-- Fix the lawyers policy to require authentication
DROP POLICY "Everyone can view verified lawyers" ON public.lawyers;
CREATE POLICY "Authenticated users can view verified lawyers" 
ON public.lawyers 
FOR SELECT 
TO authenticated
USING ((verification_status = 'verified'::text) AND (is_active = true));

-- Fix the suppliers policy to require authentication
DROP POLICY "Everyone can view active suppliers" ON public.suppliers;
CREATE POLICY "Authenticated users can view active suppliers" 
ON public.suppliers 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Fix the lead_categories policy
DROP POLICY "Authenticated users can view lead categories" ON public.lead_categories;
CREATE POLICY "Authenticated users can view lead categories" 
ON public.lead_categories 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Fix function search paths
DROP FUNCTION IF EXISTS public.calculate_monthly_score;
CREATE OR REPLACE FUNCTION public.calculate_monthly_score(
  p_lawyer_id UUID,
  p_leads_accepted INTEGER DEFAULT 0,
  p_sla_met BOOLEAN DEFAULT true,
  p_nps_score DECIMAL DEFAULT 0,
  p_pro_bono_hours INTEGER DEFAULT 0,
  p_refunds INTEGER DEFAULT 0,
  p_sla_critical_miss BOOLEAN DEFAULT false
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- +25 for accepting a lead
  IF p_leads_accepted > 0 THEN
    score := score + 25;
  END IF;
  
  -- +25 for meeting SLA
  IF p_sla_met THEN
    score := score + 25;
  END IF;
  
  -- +20 for NPS >= 9
  IF p_nps_score >= 9 THEN
    score := score + 20;
  END IF;
  
  -- +10 for each 5 hours pro-bono
  score := score + (p_pro_bono_hours / 5) * 10;
  
  -- -15 for refunds
  score := score - (p_refunds * 15);
  
  -- -10 for critical SLA miss
  IF p_sla_critical_miss THEN
    score := score - 10;
  END IF;
  
  -- Ensure score is between 0 and 100
  score := GREATEST(0, LEAST(100, score));
  
  RETURN score;
END;
$$;