-- Add ratings for existing closed cases first
WITH case_ratings AS (
  SELECT c.id as case_id, c.assigned_lawyer_id, ROW_NUMBER() OVER (ORDER BY c.id) as rn
  FROM cases c
  WHERE c.status = 'closed' AND c.assigned_lawyer_id IS NOT NULL
)
INSERT INTO public.ratings (case_id, lawyer_id, score, comment)
SELECT 
  case_id,
  assigned_lawyer_id,
  CASE (rn % 5)
    WHEN 0 THEN 5 WHEN 1 THEN 5 WHEN 2 THEN 4 WHEN 3 THEN 5 WHEN 4 THEN 4
  END as score,
  CASE (rn % 5)
    WHEN 0 THEN 'עורך דין מצוין! טיפל בתיק בצורה מקצועית ביותר. התוצאה היתה מעבר לציפיות.'
    WHEN 1 THEN 'מומחיות יוצאת דופן. ליווי מקצועי לאורך כל התהליך.'
    WHEN 2 THEN 'ניהל את התיק ברמה הגבוהה ביותר. מסור ומקצועי.'
    WHEN 3 THEN 'עורך דין שמבין את העניין ולוחם על הצדק. המלצה בחום!'
    WHEN 4 THEN 'הוביל את התהליך בצורה מושלמת. תוצאה מעל הציפיות.'
  END as comment
FROM case_ratings
WHERE NOT EXISTS (
  SELECT 1 FROM ratings r WHERE r.case_id = case_ratings.case_id
);

-- Create additional professional leads with proper constraint values
INSERT INTO public.leads (customer_name, customer_phone, customer_email, case_description, legal_category, urgency_level, estimated_budget, status, source)
VALUES
('חברת אמזון ישראל', '+972-3-1234567', 'legal@amazon.co.il', 'הקמת מרכז פיתוח בישראל והתאמה לדיני עבודה מקומיים', 'דיני מסחר', 'high', 800000, 'new', 'website'),
('סמסונג אלקטרוניקס', '+972-3-2345678', 'legal@samsung.co.il', 'מיזוג עם חברה ישראלית וניהול רכישת פטנטים', 'דיני מסחר', 'high', 1200000, 'new', 'referral'),
('מיקרוסופט ישראל', '+972-3-3456789', 'legal@microsoft.co.il', 'ייסוד חברת בת בישראל ופתיחת מרכז מחקר ופיתוח', 'דיני מסחר', 'high', 950000, 'assigned', 'phone'),
('איגוד עובדי הבנקים', '+972-3-4567890', 'info@bankworkers.org.il', 'ניהול משא ומתן קיבוצי עם כל הבנקים הגדולים בישראל', 'דיני עבודה', 'high', 450000, 'new', 'email'),
('ארגון צרכנים ישראל', '+972-3-5678901', 'legal@consumers.org.il', 'הגשת תביעה ייצוגית נגד חברות הסלולר על חיובים מוגזמים', 'דיני צרכנות', 'high', 320000, 'assigned', 'whatsapp'),
('חברת פייסבוק ישראל', '+972-3-6789012', 'legal@facebook.co.il', 'הקמת מרכז נתונים בישראל ועמידה בדרישות פרטיות', 'דיני מסחר', 'medium', 750000, 'new', 'website'),
('נטפליקס ישראל', '+972-3-7890123', 'legal@netflix.co.il', 'הפקת תוכן מקומי וזכויות יוצרים', 'דיני מסחר', 'medium', 600000, 'new', 'referral'),
('חברת טסלה ישראל', '+972-3-8901234', 'legal@tesla.co.il', 'פתיחת רשת תחנות טעינה וייבוא רכבים חשמליים', 'דיני מסחר', 'low', 850000, 'assigned', 'phone');

-- Add more specializations for existing lawyers
INSERT INTO public.lawyer_specializations (lawyer_id, specialization, experience_years, success_rate)
SELECT 
  l.id,
  'ייצוג בבית המשפט העליון',
  FLOOR(RANDOM() * 10) + 5,
  85 + FLOOR(RANDOM() * 15)
FROM lawyers l
WHERE l.verification_status = 'verified'
LIMIT 5;

INSERT INTO public.lawyer_specializations (lawyer_id, specialization, experience_years, success_rate)
SELECT 
  l.id,
  'ייעוץ משפטי לחברות רב-לאומיות',
  FLOOR(RANDOM() * 15) + 3,
  80 + FLOOR(RANDOM() * 20)
FROM lawyers l
WHERE l.verification_status = 'verified'
AND l.id NOT IN (
  SELECT ls.lawyer_id FROM lawyer_specializations ls 
  WHERE ls.specialization = 'ייצוג בבית המשפט העליון'
)
LIMIT 5;