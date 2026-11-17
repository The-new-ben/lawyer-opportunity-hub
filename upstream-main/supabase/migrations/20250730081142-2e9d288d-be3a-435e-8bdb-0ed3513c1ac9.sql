-- Create user roles and permissions tables for RBAC
CREATE TYPE public.app_role AS ENUM ('admin', 'lawyer', 'client', 'supplier');
CREATE TYPE public.app_permission AS ENUM ('leads.read', 'leads.create', 'leads.assign', 'cases.read', 'cases.create', 'cases.update', 'payments.manage', 'users.manage');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Role permissions table  
CREATE TABLE public.role_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role app_role NOT NULL,
  permission app_permission NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, permission)
);

-- Cases table
CREATE TABLE public.cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  client_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_lawyer_id UUID REFERENCES public.profiles(id),
  notes TEXT,
  estimated_budget NUMERIC,
  legal_category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Events table for calendar
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  client_id UUID REFERENCES public.profiles(id),
  case_id UUID REFERENCES public.cases(id),
  lawyer_id UUID REFERENCES public.profiles(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS app_role
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT role FROM public.user_roles WHERE user_id = user_uuid LIMIT 1;
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all user roles" ON public.user_roles
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for cases  
CREATE POLICY "Lawyers can view assigned cases" ON public.cases
  FOR SELECT USING (
    assigned_lawyer_id = auth.uid() OR 
    get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Lawyers can create cases" ON public.cases
  FOR INSERT WITH CHECK (get_user_role(auth.uid()) IN ('lawyer', 'admin'));

CREATE POLICY "Lawyers can update assigned cases" ON public.cases
  FOR UPDATE USING (
    assigned_lawyer_id = auth.uid() OR 
    get_user_role(auth.uid()) = 'admin'
  );

-- RLS Policies for events
CREATE POLICY "Users can view their events" ON public.events
  FOR SELECT USING (
    lawyer_id = auth.uid() OR
    client_id = auth.uid() OR
    get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Lawyers can manage events" ON public.events
  FOR ALL USING (
    lawyer_id = auth.uid() OR 
    get_user_role(auth.uid()) = 'admin'
  );

-- Trigger for updated_at
CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default role permissions
INSERT INTO public.role_permissions (role, permission) VALUES
  ('admin', 'leads.read'),
  ('admin', 'leads.create'),
  ('admin', 'leads.assign'),
  ('admin', 'cases.read'),
  ('admin', 'cases.create'),
  ('admin', 'cases.update'),
  ('admin', 'payments.manage'),
  ('admin', 'users.manage'),
  ('lawyer', 'leads.read'),
  ('lawyer', 'cases.read'),
  ('lawyer', 'cases.create'),
  ('lawyer', 'cases.update'),
  ('client', 'cases.read');