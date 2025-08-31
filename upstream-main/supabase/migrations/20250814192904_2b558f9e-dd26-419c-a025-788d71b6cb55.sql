-- Create case_drafts table for autosave functionality
CREATE TABLE IF NOT EXISTS public.case_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.case_drafts ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now since this is demo data)
CREATE POLICY "Allow all operations on case_drafts" 
ON public.case_drafts 
FOR ALL 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_case_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_case_drafts_updated_at
  BEFORE UPDATE ON public.case_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_case_drafts_updated_at();