-- Fix email verification issues and add lawyer scoring system
-- First, let's add lawyer scores and tiers tables based on the spec

CREATE TABLE public.lawyer_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lawyer_id UUID NOT NULL REFERENCES public.lawyers(id) ON DELETE CASCADE,
  monthly_score INTEGER DEFAULT 0,
  acceptance_rate DECIMAL(5,2) DEFAULT 0,
  sla_hit_rate DECIMAL(5,2) DEFAULT 0,
  nps_average DECIMAL(3,1) DEFAULT 0,
  refund_ratio DECIMAL(5,2) DEFAULT 0,
  pro_bono_hours INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.lawyer_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lawyer_id UUID NOT NULL REFERENCES public.lawyers(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'bronze',
  tier_score DECIMAL(5,2) DEFAULT 0,
  financial_bonus_multiplier DECIMAL(3,2) DEFAULT 1.00,
  early_access_hours INTEGER DEFAULT 0,
  platform_fee_reduction DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_tier CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum'))
);

-- Enable RLS on new tables
ALTER TABLE public.lawyer_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyer_tiers ENABLE ROW LEVEL SECURITY;

-- RLS policies for lawyer scores
CREATE POLICY "Lawyers can view their own scores" 
ON public.lawyer_scores 
FOR SELECT 
USING (lawyer_id IN (
  SELECT l.id FROM lawyers l 
  JOIN profiles p ON l.profile_id = p.id 
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all scores" 
ON public.lawyer_scores 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- RLS policies for lawyer tiers
CREATE POLICY "Lawyers can view their own tier" 
ON public.lawyer_tiers 
FOR SELECT 
USING (lawyer_id IN (
  SELECT l.id FROM lawyers l 
  JOIN profiles p ON l.profile_id = p.id 
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Everyone can view lawyer tiers for marketplace" 
ON public.lawyer_tiers 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage all tiers" 
ON public.lawyer_tiers 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Add triggers for updated_at
CREATE TRIGGER update_lawyer_scores_updated_at
  BEFORE UPDATE ON public.lawyer_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lawyer_tiers_updated_at
  BEFORE UPDATE ON public.lawyer_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_lawyer_scores_lawyer_id ON public.lawyer_scores(lawyer_id);
CREATE INDEX idx_lawyer_tiers_lawyer_id ON public.lawyer_tiers(lawyer_id);
CREATE INDEX idx_lawyer_tiers_tier ON public.lawyer_tiers(tier);

-- Function to calculate monthly scores
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