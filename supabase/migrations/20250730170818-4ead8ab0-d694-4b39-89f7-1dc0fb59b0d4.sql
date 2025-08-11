-- Insert sample profiles with correct roles
INSERT INTO public.profiles (id, user_id, full_name, phone, company_name, role, whatsapp_number) VALUES
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Attorney Dan Cohen', '0501234567', 'Cohen & Partners Law Firm', 'supplier', '972501234567'),
  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Attorney Sarah Levy', '0509876543', 'Levy & Partners', 'supplier', '972509876543'),
  ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Yossi Israeli', '0507654321', 'Israeli Ltd.', 'customer', '972507654321'),
  ('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Michal Avraham', '0503456789', 'Avraham & Partners', 'customer', '972503456789'),
  ('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'Attorney Ron Mizrahi', '0502345678', 'Mizrahi Firm', 'supplier', '972502345678'),
  ('66666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', 'System Administrator', '0501111222', 'System Company', 'admin', '972501111222')
ON CONFLICT (id) DO NOTHING;

-- Insert sample lawyers (suppliers in this context)
INSERT INTO public.lawyers (id, profile_id, specializations, years_experience, hourly_rate, rating, bio, law_firm, location, license_number, verification_status, is_active, availability_status, total_cases) VALUES
  ('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', ARRAY['Family Law', 'Labor Law'], 15, 500, 4.8, 'Experienced lawyer specializing in family and labor law', 'Cohen & Partners Law Firm', 'Tel Aviv', '12345', 'verified', true, 'available', 45),
  ('bbbb2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', ARRAY['Contract Law', 'Tort Law'], 12, 450, 4.6, 'Expert in contract and tort law', 'Levy & Partners', 'Haifa', '67890', 'verified', true, 'available', 38),
  ('cccc3333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', ARRAY['Corporate Law', 'Real Estate Law'], 8, 400, 4.4, 'Promising young lawyer', 'Mizrahi Firm', 'Jerusalem', '54321', 'verified', true, 'available', 22)
ON CONFLICT (id) DO NOTHING;

-- Insert sample leads
INSERT INTO public.leads (id, customer_name, customer_phone, customer_email, legal_category, case_description, urgency_level, estimated_budget, preferred_location, source, status, assigned_lawyer_id) VALUES
  ('lead1111-1111-1111-1111-111111111111', 'Amir Cohen', '0501111111', 'amir@example.com', 'Family Law', 'Complex divorce case with minor children', 'high', 15000, 'Tel Aviv', 'website', 'assigned', 'aaaa1111-1111-1111-1111-111111111111'),
  ('lead2222-2222-2222-2222-222222222222', 'Rachel David', '0502222222', 'rachel@example.com', 'Labor Law', 'Unlawful termination from work', 'medium', 8000, 'Haifa', 'referral', 'new', NULL),
  ('lead3333-3333-3333-3333-333333333333', 'Moshe Levy', '0503333333', 'moshe@example.com', 'Tort Law', 'Car accident with heavy damages', 'high', 25000, 'Tel Aviv', 'google', 'converted', 'bbbb2222-2222-2222-2222-222222222222'),
  ('lead4444-4444-4444-4444-444444444444', 'Noa Rosen', '0504444444', 'noa@example.com', 'Contract Law', 'Business contract breach', 'low', 5000, 'Jerusalem', 'website', 'new', NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert sample cases
INSERT INTO public.cases (id, title, client_id, legal_category, status, priority, estimated_budget, assigned_lawyer_id, notes, opened_at) VALUES
  ('case1111-1111-1111-1111-111111111111', 'Divorce Case - Amir Cohen', '33333333-3333-3333-3333-333333333333', 'Family Law', 'open', 'high', 15000, 'aaaa1111-1111-1111-1111-111111111111', 'Complex case with children', '2024-01-15 10:00:00+00'),
  ('case2222-2222-2222-2222-222222222222', 'Car Accident - Moshe Levy', '44444444-4444-4444-4444-444444444444', 'Tort Law', 'open', 'high', 25000, 'bbbb2222-2222-2222-2222-222222222222', 'Severe damages and disability', '2024-01-20 14:30:00+00'),
  ('case3333-3333-3333-3333-333333333333', 'Contract Breach - ABC Company', '33333333-3333-3333-3333-333333333333', 'Contract Law', 'closed', 'medium', 12000, 'cccc3333-3333-3333-3333-333333333333', 'Settlement reached', '2023-12-01 09:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- Insert sample events
INSERT INTO public.events (id, title, start_time, end_time, client_id, case_id, lawyer_id, description) VALUES
  ('event111-1111-1111-1111-111111111111', 'Meeting with Client - Amir Cohen', '2024-02-01 10:00:00+00', '2024-02-01 11:30:00+00', '33333333-3333-3333-3333-333333333333', 'case1111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', 'Initial consultation meeting'),
  ('event222-2222-2222-2222-222222222222', 'Court hearing', '2024-02-05 09:00:00+00', '2024-02-05 12:00:00+00', '44444444-4444-4444-4444-444444444444', 'case2222-2222-2222-2222-222222222222', 'bbbb2222-2222-2222-2222-222222222222', 'Tort lawsuit hearing'),
  ('event333-3333-3333-3333-333333333333', 'Team meeting', '2024-02-03 16:00:00+00', '2024-02-03 17:00:00+00', NULL, NULL, 'aaaa1111-1111-1111-1111-111111111111', 'Review of ongoing cases')
ON CONFLICT (id) DO NOTHING;

-- Insert sample lawyer scores
INSERT INTO public.lawyer_scores (id, lawyer_id, monthly_score, acceptance_rate, sla_hit_rate, nps_average, refund_ratio, pro_bono_hours) VALUES
  ('score111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', 85, 0.92, 0.88, 8.5, 0.02, 15),
  ('score222-2222-2222-2222-222222222222', 'bbbb2222-2222-2222-2222-222222222222', 78, 0.85, 0.82, 8.1, 0.03, 12),
  ('score333-3333-3333-3333-333333333333', 'cccc3333-3333-3333-3333-333333333333', 65, 0.78, 0.75, 7.8, 0.05, 8)
ON CONFLICT (id) DO NOTHING;

-- Insert sample lawyer tiers
INSERT INTO public.lawyer_tiers (id, lawyer_id, tier, tier_score, platform_fee_reduction, early_access_hours, financial_bonus_multiplier) VALUES
  ('tier1111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', 'gold', 85, 0.15, 24, 1.25),
  ('tier2222-2222-2222-2222-222222222222', 'bbbb2222-2222-2222-2222-222222222222', 'silver', 78, 0.10, 12, 1.15),
  ('tier3333-3333-3333-3333-333333333333', 'cccc3333-3333-3333-3333-333333333333', 'bronze', 65, 0.05, 0, 1.00)
ON CONFLICT (id) DO NOTHING;