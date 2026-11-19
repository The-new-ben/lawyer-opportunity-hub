-- Create sample data for authentication testing
-- Insert sample lawyers (profiles first)
INSERT INTO public.profiles (user_id, full_name, role) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'עו"ד דני כהן', 'lawyer'),
  ('22222222-2222-2222-2222-222222222222', 'עו"ד שרה לוי', 'lawyer'),
  ('33333333-3333-3333-3333-333333333333', 'עו"ד מיכאל רוזן', 'lawyer')
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample lawyers
INSERT INTO public.lawyers (id, profile_id, license_number, years_experience, hourly_rate, rating, bio, verification_status, is_active) VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', (SELECT id FROM profiles WHERE user_id = '11111111-1111-1111-1111-111111111111'), 'LIC001', 10, 500, 4.8, 'עו"ד מנוסה בדיני משפחה ואישות', 'verified', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', (SELECT id FROM profiles WHERE user_id = '22222222-2222-2222-2222-222222222222'), 'LIC002', 8, 450, 4.6, 'עו"ד מתמחה בדיני עבודה וביטוח לאומי', 'verified', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', (SELECT id FROM profiles WHERE user_id = '33333333-3333-3333-3333-333333333333'), 'LIC003', 15, 600, 4.9, 'עו"ד בכיר בדיני נזיקין ותעבורה', 'verified', true)
ON CONFLICT (id) DO NOTHING;

-- Insert lawyer specializations
INSERT INTO public.lawyer_specializations (lawyer_id, specialization, experience_years, success_rate) VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'דיני משפחה', 10, 95.5),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'דיני אישות', 8, 92.0),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'דיני עבודה', 8, 89.5),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ביטוח לאומי', 6, 91.0),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'דיני נזיקין', 15, 96.5),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'דיני תעבורה', 12, 94.0)
ON CONFLICT (id) DO NOTHING;

-- Insert sample leads for testing
INSERT INTO public.leads (id, customer_name, customer_phone, customer_email, legal_category, case_description, estimated_budget) VALUES 
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'יוסי אברהם', '0501234567', 'yossi@example.com', 'דיני משפחה', 'בקשה לגירושין בהסכמה', 15000),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'רחל דוד', '0509876543', 'rachel@example.com', 'דיני עבודה', 'פיטורים לא חוקיים', 20000),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'משה יוסף', '0507654321', 'moshe@example.com', 'דיני נזיקין', 'תאונת דרכים עם נזק חמור', 50000)
ON CONFLICT (id) DO NOTHING;