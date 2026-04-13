-- Add sample data for testing

-- Insert sample leads
INSERT INTO public.leads (customer_name, customer_email, customer_phone, legal_category, case_description, status, urgency_level, estimated_budget) VALUES
('דוד כהן', 'david@example.com', '050-1234567', 'דיני משפחה', 'גירושין וחלוקת רכוש', 'new', 'high', 15000),
('שרה לוי', 'sarah@example.com', '052-9876543', 'דיני עבודה', 'פיטורים לא חוקיים', 'pending', 'medium', 8000),
('יוסי אברהם', 'yossi@example.com', '054-5555555', 'דיני נזיקין', 'תאונת דרכים', 'contacted', 'high', 25000),
('מירי דוד', 'miri@example.com', '053-1111111', 'דיני מקרקעין', 'רכישת דירה', 'new', 'low', 5000);

-- Insert sample lawyers  
INSERT INTO public.lawyers (profile_id, specializations, license_number, years_experience, hourly_rate, bio, location, law_firm) VALUES
((SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1), ARRAY['דיני משפחה', 'דיני עבודה'], '12345', 10, 800, 'עורך דין מנוסה בדיני משפחה ועבודה', 'תל אביב', 'משרד כהן ושות''');

-- Insert sample quotes
INSERT INTO public.quotes (lead_id, lawyer_id, quote_amount, service_description, estimated_duration_days, status) VALUES
((SELECT id FROM leads WHERE customer_name = 'דוד כהן' LIMIT 1), (SELECT id FROM lawyers LIMIT 1), 15000, 'ייצוג בהליכי גירושין', 90, 'pending');

-- Insert sample lawyer scores and tiers
INSERT INTO public.lawyer_scores (lawyer_id, monthly_score, acceptance_rate, sla_hit_rate, nps_average, pro_bono_hours) VALUES
((SELECT id FROM lawyers LIMIT 1), 85, 75.5, 95.2, 8.5, 15);

INSERT INTO public.lawyer_tiers (lawyer_id, tier, tier_score, financial_bonus_multiplier) VALUES
((SELECT id FROM lawyers LIMIT 1), 'gold', 85.0, 1.05);