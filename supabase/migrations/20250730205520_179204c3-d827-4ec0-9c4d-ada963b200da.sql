-- First check what roles are allowed, then add sample data with correct roles
INSERT INTO public.profiles (user_id, full_name, role) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Attorney Danny Cohen', 'customer'),
  ('22222222-2222-2222-2222-222222222222', 'Attorney Sarah Levy', 'customer'),
  ('33333333-3333-3333-3333-333333333333', 'Attorney Michael Rosen', 'customer')
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample lawyers
INSERT INTO public.lawyers (id, profile_id, license_number, years_experience, hourly_rate, rating, bio, verification_status, is_active) VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', (SELECT id FROM profiles WHERE user_id = '11111111-1111-1111-1111-111111111111'), 'LIC001', 10, 500, 4.8, 'Experienced attorney in family and personal status law', 'verified', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', (SELECT id FROM profiles WHERE user_id = '22222222-2222-2222-2222-222222222222'), 'LIC002', 8, 450, 4.6, 'Attorney specializing in labor law and national insurance', 'verified', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', (SELECT id FROM profiles WHERE user_id = '33333333-3333-3333-3333-333333333333'), 'LIC003', 15, 600, 4.9, 'Senior attorney in tort and traffic law', 'verified', true)
ON CONFLICT (id) DO NOTHING;

-- Insert lawyer specializations
INSERT INTO public.lawyer_specializations (lawyer_id, specialization, experience_years, success_rate) VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Family Law', 10, 95.5),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Personal Status Law', 8, 92.0),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Labor Law', 8, 89.5),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'National Insurance', 6, 91.0),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Tort Law', 15, 96.5),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Traffic Law', 12, 94.0)
ON CONFLICT (id) DO NOTHING;

-- Insert sample leads for testing
INSERT INTO public.leads (id, customer_name, customer_phone, customer_email, legal_category, case_description, estimated_budget) VALUES 
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Yossi Avraham', '0501234567', 'yossi@example.com', 'Family Law', 'Request for consensual divorce', 15000),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Rachel David', '0509876543', 'rachel@example.com', 'Labor Law', 'Unlawful termination', 20000),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Moshe Yosef', '0507654321', 'moshe@example.com', 'Tort Law', 'Car accident with severe damage', 50000)
ON CONFLICT (id) DO NOTHING;