-- Create meetings table to track scheduled interactions
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id),
  lead_id UUID REFERENCES public.leads(id),
  lawyer_id UUID REFERENCES public.profiles(id) NOT NULL,
  client_id UUID REFERENCES public.profiles(id),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  meeting_type TEXT CHECK (meeting_type IN ('in_person','video','phone')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled','no_show')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their meetings" ON public.meetings
  FOR SELECT USING (
    lawyer_id = auth.uid() OR
    client_id = auth.uid() OR
    get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Lawyers can manage meetings" ON public.meetings
  FOR ALL USING (
    lawyer_id = auth.uid() OR
    get_user_role(auth.uid()) = 'admin'
  );

CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
