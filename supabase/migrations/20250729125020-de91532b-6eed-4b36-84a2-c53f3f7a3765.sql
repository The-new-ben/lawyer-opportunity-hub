-- Update existing profiles table with additional fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer',
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add check constraint for role
DO $$
BEGIN
    -- Try to add the constraint, ignore if it already exists
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('admin', 'lead_provider', 'lawyer', 'customer'));
EXCEPTION 
    WHEN duplicate_object THEN 
        NULL; -- Constraint already exists, do nothing
END
$$;

-- Lawyer specializations and details
CREATE TABLE IF NOT EXISTS public.lawyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  license_number TEXT UNIQUE,
  specializations TEXT[] NOT NULL DEFAULT '{}',
  years_experience INTEGER,
  law_firm TEXT,
  hourly_rate DECIMAL(10,2),
  bio TEXT,
  location TEXT,
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
  rating DECIMAL(3,2) DEFAULT 0,
  total_cases INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced leads system
CREATE TABLE IF NOT EXISTS public.lead_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Insert default legal categories
INSERT INTO public.lead_categories (name, description) VALUES
('Civil', 'Civil legal cases'),
('Criminal', 'Criminal legal cases'),
('Family', 'Family law and divorce'),
('Labor', 'Labor law'),
('Real Estate', 'Real estate law'),
('Commercial', 'Commercial and business law'),
('Administrative', 'Administrative law'),
('Inheritance', 'Inheritance and wills'),
('Insurance', 'Insurance claims'),
('Enforcement', 'Enforcement and collections')
ON CONFLICT (name) DO NOTHING;

-- Drop existing leads table if exists to recreate with new structure
DROP TABLE IF EXISTS public.leads CASCADE;

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_phone TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  case_description TEXT NOT NULL,
  legal_category TEXT NOT NULL,
  urgency_level TEXT DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'urgent')),
  estimated_budget DECIMAL(12,2),
  preferred_location TEXT,
  case_details JSONB DEFAULT '{}',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'assigned', 'contacted', 'quoted', 'converted', 'closed', 'cancelled')),
  source TEXT DEFAULT 'website' CHECK (source IN ('website', 'whatsapp', 'phone', 'referral', 'social')),
  assigned_lawyer_id UUID REFERENCES public.lawyers(id),
  visibility_level TEXT DEFAULT 'restricted' CHECK (visibility_level IN ('public', 'restricted', 'private')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Lead assignments and bidding system
CREATE TABLE IF NOT EXISTS public.lead_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  lawyer_id UUID REFERENCES public.lawyers(id) ON DELETE CASCADE NOT NULL,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('direct', 'bid', 'invitation')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  response_deadline TIMESTAMP WITH TIME ZONE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(lead_id, lawyer_id)
);

-- Drop and recreate quotes table
DROP TABLE IF EXISTS public.quotes CASCADE;
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  lawyer_id UUID REFERENCES public.lawyers(id) ON DELETE CASCADE NOT NULL,
  quote_amount DECIMAL(12,2) NOT NULL,
  service_description TEXT NOT NULL,
  estimated_duration_days INTEGER,
  payment_terms TEXT,
  terms_and_conditions TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Deposits and payment tracking
CREATE TABLE IF NOT EXISTS public.deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  lawyer_id UUID REFERENCES public.lawyers(id) ON DELETE CASCADE NOT NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  deposit_type TEXT NOT NULL CHECK (deposit_type IN ('lead_access', 'case_deposit', 'consultation')),
  payment_method TEXT DEFAULT 'bit' CHECK (payment_method IN ('bit', 'paypal', 'credit_card', 'bank_transfer')),
  transaction_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Lead access control (after deposit)
CREATE TABLE IF NOT EXISTS public.lead_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  lawyer_id UUID REFERENCES public.lawyers(id) ON DELETE CASCADE NOT NULL,
  deposit_id UUID REFERENCES public.deposits(id) ON DELETE CASCADE NOT NULL,
  access_level TEXT NOT NULL CHECK (access_level IN ('basic', 'full', 'premium')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(lead_id, lawyer_id)
);

-- Enable RLS on all tables
ALTER TABLE public.lawyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_access ENABLE ROW LEVEL SECURITY;

-- Create security definer function to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for lawyers
CREATE POLICY "Lawyers can manage their own profile" ON public.lawyers
  FOR ALL USING (
    profile_id IN (
      SELECT id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view verified lawyers" ON public.lawyers
  FOR SELECT USING (verification_status = 'verified' AND is_active = true);

-- RLS Policies for leads with visibility control
CREATE POLICY "Lead providers and admins can manage leads" ON public.leads
  FOR ALL USING (public.get_current_user_role() IN ('admin', 'lead_provider'));

CREATE POLICY "Customers can view their own leads" ON public.leads
  FOR SELECT USING (customer_phone = (auth.uid())::text);

CREATE POLICY "Lawyers can view public leads" ON public.leads
  FOR SELECT USING (
    visibility_level = 'public' 
    AND public.get_current_user_role() = 'lawyer'
  );

CREATE POLICY "Lawyers can view leads they have access to" ON public.leads
  FOR SELECT USING (
    id IN (
      SELECT la.lead_id FROM public.lead_access la
      JOIN public.lawyers l ON la.lawyer_id = l.id
      JOIN public.profiles p ON l.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Lead assignments policies
CREATE POLICY "Lead assignments management" ON public.lead_assignments
  FOR ALL USING (
    lawyer_id IN (
      SELECT l.id FROM public.lawyers l
      JOIN public.profiles p ON l.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
    OR
    public.get_current_user_role() IN ('admin', 'lead_provider')
  );

-- Quotes policies
CREATE POLICY "Quotes management" ON public.quotes
  FOR ALL USING (
    lawyer_id IN (
      SELECT l.id FROM public.lawyers l
      JOIN public.profiles p ON l.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
    OR
    lead_id IN (
      SELECT id FROM public.leads 
      WHERE customer_phone = (auth.uid())::text
    )
    OR
    public.get_current_user_role() IN ('admin', 'lead_provider')
  );

-- Deposits policies
CREATE POLICY "Deposits management" ON public.deposits
  FOR ALL USING (
    lawyer_id IN (
      SELECT l.id FROM public.lawyers l
      JOIN public.profiles p ON l.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
    OR
    lead_id IN (
      SELECT id FROM public.leads 
      WHERE customer_phone = (auth.uid())::text
    )
    OR
    public.get_current_user_role() IN ('admin', 'lead_provider')
  );

-- Lead access policies
CREATE POLICY "Lead access management" ON public.lead_access
  FOR ALL USING (
    lawyer_id IN (
      SELECT l.id FROM public.lawyers l
      JOIN public.profiles p ON l.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
    OR
    public.get_current_user_role() IN ('admin', 'lead_provider')
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lawyers_profile_id ON public.lawyers(profile_id);
CREATE INDEX IF NOT EXISTS idx_lawyers_specializations ON public.lawyers USING GIN(specializations);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_legal_category ON public.leads(legal_category);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_lawyer ON public.leads(assigned_lawyer_id);
CREATE INDEX IF NOT EXISTS idx_leads_visibility ON public.leads(visibility_level);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON public.deposits(status);
CREATE INDEX IF NOT EXISTS idx_lead_access_expires ON public.lead_access(expires_at);

-- Create triggers for updated_at columns
CREATE TRIGGER update_lawyers_updated_at BEFORE UPDATE ON public.lawyers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deposits_updated_at BEFORE UPDATE ON public.deposits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();