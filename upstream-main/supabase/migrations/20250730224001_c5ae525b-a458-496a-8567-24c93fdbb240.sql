-- Fix security policies to require authentication
ALTER POLICY "Admins and lead providers can manage incoming messages" 
ON public.incoming_messages TO authenticated;

ALTER POLICY "Meeting participants can view meetings" 
ON public.meetings TO authenticated;

ALTER POLICY "Lawyers and admins can manage meetings" 
ON public.meetings TO authenticated;

ALTER POLICY "Rating participants can view ratings" 
ON public.ratings TO authenticated;

ALTER POLICY "Clients can create ratings" 
ON public.ratings TO authenticated;

-- Fix search path for security definer function
CREATE OR REPLACE FUNCTION public.process_incoming_lead(
  p_from_number TEXT,
  p_content TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_lead_id UUID;
  v_message_id UUID;
BEGIN
  -- Insert incoming message
  INSERT INTO public.incoming_messages (from_number, content, processed)
  VALUES (p_from_number, p_content, false)
  RETURNING id INTO v_message_id;
  
  -- Create lead if content is substantial (more than 10 characters)
  IF LENGTH(p_content) > 10 THEN
    INSERT INTO public.leads (
      customer_phone, 
      customer_name, 
      case_description, 
      legal_category,
      source,
      status
    )
    VALUES (
      p_from_number,
      'WhatsApp User', 
      p_content, 
      'general',
      'whatsapp',
      'new'
    )
    RETURNING id INTO v_lead_id;
    
    -- Link message to lead
    UPDATE public.incoming_messages 
    SET lead_id = v_lead_id, processed = true
    WHERE id = v_message_id;
  END IF;
  
  RETURN v_lead_id;
END;
$$;