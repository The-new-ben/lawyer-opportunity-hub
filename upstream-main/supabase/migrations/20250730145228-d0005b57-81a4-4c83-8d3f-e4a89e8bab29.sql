-- Insert sample profiles
INSERT INTO public.profiles (id, user_id, full_name, phone, company_name, role, whatsapp_number) VALUES
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'עו"ד דן כהן', '0501234567', 'משרד עורכי דין כהן ושות', 'lawyer', '972501234567'),
  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'עו"ד שרה לוי', '0509876543', 'משרד לוי ושות', 'lawyer', '972509876543'),
  ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'יוסי ישראלי', '0507654321', 'חברת ישראלי בע"מ', 'customer', '972507654321'),
  ('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'מיכל אברהם', '0503456789', 'אברהם ושות', 'customer', '972503456789'),
  ('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'עו"ד רון מזרחי', '0502345678', 'משרד מזרחי', 'lawyer', '972502345678')
ON CONFLICT (id) DO NOTHING;

-- Insert sample lawyers
INSERT INTO public.lawyers (id, profile_id, specializations, years_experience, hourly_rate, rating, bio, law_firm, location, license_number, verification_status, is_active, availability_status, total_cases) VALUES
  ('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', ARRAY['דיני משפחה', 'דיני עבודה'], 15, 500, 4.8, 'עורך דין מנוסה המתמחה בדיני משפחה ועבודה', 'משרד עורכי דין כהן ושות', 'תל אביב', '12345', 'verified', true, 'available', 45),
  ('bbbb2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', ARRAY['דיני חוזים', 'דיני נזקין'], 12, 450, 4.6, 'מומחית בדיני חוזים ונזקין', 'משרד לוי ושות', 'חיפה', '67890', 'verified', true, 'available', 38),
  ('cccc3333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', ARRAY['דיני חברות', 'דיני מקרקעין'], 8, 400, 4.4, 'עורך דין צעיר ומבטיח', 'משרד מזרחי', 'ירושלים', '54321', 'verified', true, 'available', 22)
ON CONFLICT (id) DO NOTHING;

-- Insert sample leads
INSERT INTO public.leads (id, customer_name, customer_phone, customer_email, legal_category, case_description, urgency_level, estimated_budget, preferred_location, source, status, assigned_lawyer_id) VALUES
  ('lead1111-1111-1111-1111-111111111111', 'אמיר כהן', '0501111111', 'amir@example.com', 'דיני משפחה', 'תיק גירושין מורכב עם ילדים קטינים', 'high', 15000, 'תל אביב', 'website', 'assigned', 'aaaa1111-1111-1111-1111-111111111111'),
  ('lead2222-2222-2222-2222-222222222222', 'רחל דוד', '0502222222', 'rachel@example.com', 'דיני עבודה', 'פיטורים לא חוקיים מהעבודה', 'medium', 8000, 'חיפה', 'referral', 'new', NULL),
  ('lead3333-3333-3333-3333-333333333333', 'משה לוי', '0503333333', 'moshe@example.com', 'דיני נזקין', 'תאונת דרכים עם נזקים כבדים', 'high', 25000, 'תל אביב', 'google', 'converted', 'bbbb2222-2222-2222-2222-222222222222'),
  ('lead4444-4444-4444-4444-444444444444', 'נועה רוזן', '0504444444', 'noa@example.com', 'דיני חוזים', 'הפרת חוזה עסקי', 'low', 5000, 'ירושלים', 'website', 'new', NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert sample cases
INSERT INTO public.cases (id, title, client_id, legal_category, status, priority, estimated_budget, assigned_lawyer_id, notes, opened_at) VALUES
  ('case1111-1111-1111-1111-111111111111', 'תיק גירושין - אמיר כהן', '33333333-3333-3333-3333-333333333333', 'דיני משפחה', 'open', 'high', 15000, 'aaaa1111-1111-1111-1111-111111111111', 'תיק מורכב עם ילדים', '2024-01-15 10:00:00+00'),
  ('case2222-2222-2222-2222-222222222222', 'תאונת דרכים - משה לוי', '44444444-4444-4444-4444-444444444444', 'דיני נזקין', 'open', 'high', 25000, 'bbbb2222-2222-2222-2222-222222222222', 'נזקים כבדים ונכות', '2024-01-20 14:30:00+00'),
  ('case3333-3333-3333-3333-333333333333', 'הפרת חוזה - חברת ABC', '33333333-3333-3333-3333-333333333333', 'דיני חוזים', 'closed', 'medium', 12000, 'cccc3333-3333-3333-3333-333333333333', 'הושג פשר', '2023-12-01 09:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- Insert sample events
INSERT INTO public.events (id, title, start_time, end_time, client_id, case_id, lawyer_id, description) VALUES
  ('event111-1111-1111-1111-111111111111', 'פגישה עם לקוח - אמיר כהן', '2024-02-01 10:00:00+00', '2024-02-01 11:30:00+00', '33333333-3333-3333-3333-333333333333', 'case1111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', 'פגישת התייעצות ראשונה'),
  ('event222-2222-2222-2222-222222222222', 'דיון בבית משפט', '2024-02-05 09:00:00+00', '2024-02-05 12:00:00+00', '44444444-4444-4444-4444-444444444444', 'case2222-2222-2222-2222-222222222222', 'bbbb2222-2222-2222-2222-222222222222', 'דיון בתביעת נזקין'),
  ('event333-3333-3333-3333-333333333333', 'פגישת צוות', '2024-02-03 16:00:00+00', '2024-02-03 17:00:00+00', NULL, NULL, 'aaaa1111-1111-1111-1111-111111111111', 'סקירת תיקים שוטפים')
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

-- Insert sample quotes
INSERT INTO public.quotes (id, lead_id, lawyer_id, quote_amount, service_description, payment_terms, estimated_duration_days, status, valid_until) VALUES
  ('quote111-1111-1111-1111-111111111111', 'lead1111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', 15000, 'טיפול מלא בתיק גירושין כולל ייצוג בבית המשפט', '50% מקדמה, יתרה בתשלומים', 90, 'accepted', '2024-02-15 23:59:59+00'),
  ('quote222-2222-2222-2222-222222222222', 'lead3333-3333-3333-3333-333333333333', 'bbbb2222-2222-2222-2222-222222222222', 25000, 'ייצוג בתביעת נזקין מתאונת דרכים', 'תשלום בהצלחה - 25%', 120, 'accepted', '2024-02-20 23:59:59+00')
ON CONFLICT (id) DO NOTHING;

-- Insert sample deposits
INSERT INTO public.deposits (id, lead_id, lawyer_id, quote_id, amount, deposit_type, status, payment_method, paid_at) VALUES
  ('deposit11-1111-1111-1111-111111111111', 'lead1111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', 'quote111-1111-1111-1111-111111111111', 7500, 'advance', 'paid', 'bit', '2024-01-16 12:00:00+00'),
  ('deposit22-2222-2222-2222-222222222222', 'lead3333-3333-3333-3333-333333333333', 'bbbb2222-2222-2222-2222-222222222222', 'quote222-2222-2222-2222-222222222222', 5000, 'consultation', 'paid', 'credit_card', '2024-01-21 15:30:00+00')
ON CONFLICT (id) DO NOTHING;