-- Create incoming_messages table for WhatsApp intake
CREATE TABLE public.incoming_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_number TEXT NOT NULL,
  content TEXT NOT NULL,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed BOOLEAN NOT NULL DEFAULT false,
  lead_id UUID REFERENCES public.leads(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meetings table for appointment management
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id),
  lead_id UUID REFERENCES public.leads(id),
  lawyer_id UUID NOT NULL,
  client_id UUID,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  meeting_type TEXT NOT NULL DEFAULT 'in_person', -- 'in_person', 'video', 'phone'
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'no_show'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ratings table for feedback system
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) NOT NULL,
  client_id UUID,
  lawyer_id UUID NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(case_id, client_id) -- Prevent duplicate ratings
);

-- Enable RLS on all new tables
ALTER TABLE public.incoming_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for incoming_messages
CREATE POLICY "Admins and lead providers can manage incoming messages" 
ON public.incoming_messages FOR ALL
USING (get_current_user_role() = ANY(ARRAY['admin'::text, 'lead_provider'::text]));

-- RLS Policies for meetings
CREATE POLICY "Meeting participants can view meetings" 
ON public.meetings FOR SELECT
USING (
  lawyer_id IN (
    SELECT l.id FROM lawyers l 
    JOIN profiles p ON l.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  ) OR 
  client_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  ) OR
  get_current_user_role() = 'admin'::text
);

CREATE POLICY "Lawyers and admins can manage meetings" 
ON public.meetings FOR ALL
USING (
  lawyer_id IN (
    SELECT l.id FROM lawyers l 
    JOIN profiles p ON l.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  ) OR
  get_current_user_role() = 'admin'::text
);

-- RLS Policies for ratings
CREATE POLICY "Rating participants can view ratings" 
ON public.ratings FOR SELECT
USING (
  lawyer_id IN (
    SELECT l.id FROM lawyers l 
    JOIN profiles p ON l.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  ) OR 
  client_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  ) OR
  get_current_user_role() = 'admin'::text
);

CREATE POLICY "Clients can create ratings" 
ON public.ratings FOR INSERT
WITH CHECK (
  client_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to process incoming WhatsApp leads
CREATE OR REPLACE FUNCTION public.process_incoming_lead(
  p_from_number TEXT,
  p_content TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
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