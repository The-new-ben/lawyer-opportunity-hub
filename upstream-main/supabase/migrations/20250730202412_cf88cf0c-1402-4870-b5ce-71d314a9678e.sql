-- Fix security issues by updating RLS policies to require authentication

-- Update commissions policies to require authentication
DROP POLICY IF EXISTS "System manages commissions" ON public.commissions;
CREATE POLICY "Admins can manage commissions" 
ON public.commissions 
FOR ALL 
TO authenticated
USING (get_current_user_role() = 'admin');

-- Update digital_contracts policies to require authentication  
DROP POLICY IF EXISTS "Contract parties can manage contracts" ON public.digital_contracts;
CREATE POLICY "Contract parties can manage contracts" 
ON public.digital_contracts 
FOR ALL 
TO authenticated
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
  ) OR
  get_current_user_role() = 'admin'
);

-- Update lawyer_specializations policies
DROP POLICY IF EXISTS "Lawyers can manage their specializations" ON public.lawyer_specializations;
DROP POLICY IF EXISTS "Authenticated users can view specializations" ON public.lawyer_specializations;

CREATE POLICY "Lawyers can manage their specializations" 
ON public.lawyer_specializations 
FOR ALL 
TO authenticated
USING (lawyer_id IN (
  SELECT l.id FROM lawyers l 
  JOIN profiles p ON l.profile_id = p.id 
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Authenticated users can view specializations" 
ON public.lawyer_specializations 
FOR SELECT 
TO authenticated
USING (true);