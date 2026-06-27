-- Insert experienced lawyers with specializations
INSERT INTO public.profiles (id, user_id, full_name, phone, role, avatar_url) VALUES
(gen_random_uuid(), gen_random_uuid(), 'עו"ד רחל כהן', '+972-50-1234567', 'lawyer', 'https://randomuser.me/api/portraits/women/44.jpg'),
(gen_random_uuid(), gen_random_uuid(), 'עו"ד דוד לוי', '+972-50-2345678', 'lawyer', 'https://randomuser.me/api/portraits/men/32.jpg'),
(gen_random_uuid(), gen_random_uuid(), 'עו"ד שרה רוזן', '+972-50-3456789', 'lawyer', 'https://randomuser.me/api/portraits/women/67.jpg'),
(gen_random_uuid(), gen_random_uuid(), 'עו"ד מיכאל ברק', '+972-50-4567890', 'lawyer', 'https://randomuser.me/api/portraits/men/45.jpg'),
(gen_random_uuid(), gen_random_uuid(), 'עו"ד תמר אברמס', '+972-50-5678901', 'lawyer', 'https://randomuser.me/api/portraits/women/33.jpg'),
(gen_random_uuid(), gen_random_uuid(), 'עו"ד יוסי מזרחי', '+972-50-6789012', 'lawyer', 'https://randomuser.me/api/portraits/men/52.jpg'),
(gen_random_uuid(), gen_random_uuid(), 'עו"ד עינת שפירא', '+972-50-7890123', 'lawyer', 'https://randomuser.me/api/portraits/women/28.jpg'),
(gen_random_uuid(), gen_random_uuid(), 'עו"ד אבי שוורץ', '+972-50-8901234', 'lawyer', 'https://randomuser.me/api/portraits/men/39.jpg'),
(gen_random_uuid(), gen_random_uuid(), 'עו"ד נעמי גולד', '+972-50-9012345', 'lawyer', 'https://randomuser.me/api/portraits/women/55.jpg'),
(gen_random_uuid(), gen_random_uuid(), 'עו"ד רונן פרידמן', '+972-50-0123456', 'lawyer', 'https://randomuser.me/api/portraits/men/41.jpg');

-- Insert lawyers data for each profile
WITH profile_lawyers AS (
  SELECT p.id as profile_id, p.full_name, ROW_NUMBER() OVER (ORDER BY p.full_name) as rn
  FROM profiles p 
  WHERE p.role = 'lawyer' AND p.full_name LIKE 'עו"ד%'
)
INSERT INTO public.lawyers (profile_id, years_experience, hourly_rate, rating, total_cases, specializations, law_firm, bio, location, verification_status)
SELECT 
  profile_id,
  CASE rn 
    WHEN 1 THEN 15 WHEN 2 THEN 22 WHEN 3 THEN 18 WHEN 4 THEN 25 WHEN 5 THEN 12
    WHEN 6 THEN 20 WHEN 7 THEN 8 WHEN 8 THEN 30 WHEN 9 THEN 14 WHEN 10 THEN 19
  END as years_experience,
  CASE rn 
    WHEN 1 THEN 850 WHEN 2 THEN 1200 WHEN 3 THEN 950 WHEN 4 THEN 1500 WHEN 5 THEN 750
    WHEN 6 THEN 1100 WHEN 7 THEN 650 WHEN 8 THEN 1800 WHEN 9 THEN 800 WHEN 10 THEN 1000
  END as hourly_rate,
  CASE rn 
    WHEN 1 THEN 4.8 WHEN 2 THEN 4.9 WHEN 3 THEN 4.7 WHEN 4 THEN 4.9 WHEN 5 THEN 4.6
    WHEN 6 THEN 4.8 WHEN 7 THEN 4.5 WHEN 8 THEN 5.0 WHEN 9 THEN 4.7 WHEN 10 THEN 4.8
  END as rating,
  CASE rn 
    WHEN 1 THEN 145 WHEN 2 THEN 280 WHEN 3 THEN 167 WHEN 4 THEN 320 WHEN 5 THEN 89
    WHEN 6 THEN 201 WHEN 7 THEN 45 WHEN 8 THEN 450 WHEN 9 THEN 112 WHEN 10 THEN 189
  END as total_cases,
  CASE rn 
    WHEN 1 THEN ARRAY['דיני עבודה', 'יחסי עובד-מעביד']
    WHEN 2 THEN ARRAY['דיני מסחר', 'חוזים מסחריים', 'הקמת חברות']
    WHEN 3 THEN ARRAY['דיני עבודה', 'פיצויי פיטורין', 'הטרדה מינית']
    WHEN 4 THEN ARRAY['דיני מסחר', 'מיזוגים ורכישות', 'השקעות']
    WHEN 5 THEN ARRAY['דיני צרכנות', 'תביעות ייצוגיות']
    WHEN 6 THEN ARRAY['דיני עבודה', 'איגודי עובדים', 'שכר']
    WHEN 7 THEN ARRAY['דיני מסחר', 'סטארט-אפים', 'קניין רוחני']
    WHEN 8 THEN ARRAY['דיני עבודה', 'דיני ביטוח', 'תאונות עבודה']
    WHEN 9 THEN ARRAY['דיני מסחר', 'נדלן מסחרי', 'פרויקטים']
    WHEN 10 THEN ARRAY['דיני עבודה', 'ייעוץ לחברות', 'מחלוקות עבודה']
  END as specializations,
  CASE rn 
    WHEN 1 THEN 'כהן ושות׳' WHEN 2 THEN 'לוי, ברק ושות׳' WHEN 3 THEN 'רוזן ושות׳'
    WHEN 4 THEN 'ברק ושות׳' WHEN 5 THEN 'אברמס ושות׳' WHEN 6 THEN 'מזרחי ושות׳'
    WHEN 7 THEN 'שפירא ושות׳' WHEN 8 THEN 'שוורץ ושות׳' WHEN 9 THEN 'גולד ושות׳'
    WHEN 10 THEN 'פרידמן ושות׳'
  END as law_firm,
  CASE rn 
    WHEN 1 THEN 'מתמחה בדיני עבודה ויחסי עובד-מעביד. ניסיון עשיר בפיצויי פיטורין ותביעות נגד מעבידים.'
    WHEN 2 THEN 'עורך דין בכיר בתחום המסחרי. מוביל עסקאות מורכבות ומקים חברות לקוחות גדולים.'
    WHEN 3 THEN 'מומחית בדיני עבודה ובמיוחד בתחום ההטרדה המינית והאפליה במקום העבודה.'
    WHEN 4 THEN 'עורך דין מוביל בתחום המיזוגים והרכישות. ייצג חברות הייטק בעסקאות של מיליארדי שקלים.'
    WHEN 5 THEN 'מתמחה בדיני צרכנות ותביעות ייצוגיות. מובילה תיקים חשובים למען הצרכנים.'
    WHEN 6 THEN 'מומחה בדיני עבודה ויחסים עם איגודי עובדים. ייצג מעבידים גדולים במשא ומתן קיבוצי.'
    WHEN 7 THEN 'מתמחה בסטארט-אפים וקניין רוחני. ליווה עשרות חברות הייטק מהקמה ועד יציאה לבורסה.'
    WHEN 8 THEN 'עורך דין בכיר בתחום הביטוח ותאונות העבודה. ניסיון של 30 שנה בתחום.'
    WHEN 9 THEN 'מתמחה בנדלן מסחרי ופרויקטים גדולים. ליווה פרויקטי תשתית מיליארדיים.'
    WHEN 10 THEN 'ייעוץ משפטי לחברות בתחום דיני העבודה. מומחה במחלוקות עבודה מורכבות.'
  END as bio,
  CASE rn 
    WHEN 1 THEN 'תל אביב' WHEN 2 THEN 'תל אביב' WHEN 3 THEN 'חיפה' WHEN 4 THEN 'תל אביב'
    WHEN 5 THEN 'ירושלים' WHEN 6 THEN 'תל אביב' WHEN 7 THEN 'תל אביב' WHEN 8 THEN 'חיפה'
    WHEN 9 THEN 'ירושלים' WHEN 10 THEN 'תל אביב'
  END as location,
  'verified' as verification_status
FROM profile_lawyers;