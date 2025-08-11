-- Add sample data for testing

-- Insert sample leads
INSERT INTO public.leads (customer_name, customer_email, customer_phone, legal_category, case_description, status, urgency_level, estimated_budget) VALUES
('David Cohen', 'david@example.com', '050-1234567', 'Family Law', 'Divorce and division of property', 'new', 'high', 15000),
('Sarah Levy', 'sarah@example.com', '052-9876543', 'Labor Law', 'Unlawful termination', 'pending', 'medium', 8000),
('Yossi Avraham', 'yossi@example.com', '054-5555555', 'Tort Law', 'Car accident', 'contacted', 'high', 25000),
('Miri David', 'miri@example.com', '053-1111111', 'Real Estate Law', 'Apartment purchase', 'new', 'low', 5000);

-- Insert sample lawyers  
INSERT INTO public.lawyers (profile_id, specializations, license_number, years_experience, hourly_rate, bio, location, law_firm) VALUES
((SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1), ARRAY['Family Law', 'Labor Law'], '12345', 10, 800, 'Experienced lawyer in family and labor law', 'Tel Aviv', 'Cohen & Partners Law Firm');

-- Insert sample quotes
INSERT INTO public.quotes (lead_id, lawyer_id, quote_amount, service_description, estimated_duration_days, status) VALUES
((SELECT id FROM leads WHERE customer_name = 'David Cohen' LIMIT 1), (SELECT id FROM lawyers LIMIT 1), 15000, 'Representation in divorce proceedings', 90, 'pending');

-- Insert sample lawyer scores and tiers
INSERT INTO public.lawyer_scores (lawyer_id, monthly_score, acceptance_rate, sla_hit_rate, nps_average, pro_bono_hours) VALUES
((SELECT id FROM lawyers LIMIT 1), 85, 75.5, 95.2, 8.5, 15);

INSERT INTO public.lawyer_tiers (lawyer_id, tier, tier_score, financial_bonus_multiplier) VALUES
((SELECT id FROM lawyers LIMIT 1), 'gold', 85.0, 1.05);