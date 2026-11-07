-- First, let's fix the foreign key constraint for cases table
-- The cases table should reference lawyers.id, not profiles.id for assigned_lawyer_id
ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS cases_assigned_lawyer_id_fkey;
ALTER TABLE public.cases ADD CONSTRAINT cases_assigned_lawyer_id_fkey 
  FOREIGN KEY (assigned_lawyer_id) REFERENCES public.lawyers(id);

-- Insert successful closed cases with judge oversight
WITH selected_lawyers AS (
  SELECT l.id as lawyer_id, p.full_name as lawyer_name, ROW_NUMBER() OVER (ORDER BY l.id) as rn
  FROM lawyers l
  JOIN profiles p ON l.profile_id = p.id
  WHERE l.verification_status = 'verified'
  LIMIT 10
)
INSERT INTO public.cases (id, title, legal_category, status, priority, estimated_budget, assigned_lawyer_id, opened_at, notes)
SELECT 
  gen_random_uuid(),
  CASE rn 
    WHEN 1 THEN 'תביעת פיצויי פיטורין נגד חברת היי-טק גדולה'
    WHEN 2 THEN 'מיזוג חברות בשווי 150 מיליון שקל'
    WHEN 3 THEN 'תביעה ייצוגית נגד בנק גדול בנושא עמלות'
    WHEN 4 THEN 'הטרדה מינית במקום עבודה - פסק דין פורץ דרך'
    WHEN 5 THEN 'רכישת סטארט-אפ על ידי גוגל'
    WHEN 6 THEN 'משא ומתן קיבוצי עם איגוד עובדים גדול'
    WHEN 7 THEN 'הקמת חברת הייטק וגיוס השקעה ראשון'
    WHEN 8 THEN 'תביעת תאונת עבודה בפרויקט בנייה גדול'
    WHEN 9 THEN 'עסקת נדלן מסחרי במרכז תל אביב'
    WHEN 10 THEN 'מחלוקת עבודה מורכבת בחברה ציבורית'
  END as title,
  CASE rn 
    WHEN 1 THEN 'דיני עבודה' WHEN 2 THEN 'דיני מסחר' WHEN 3 THEN 'דיני צרכנות'
    WHEN 4 THEN 'דיני עבודה' WHEN 5 THEN 'דיני מסחר' WHEN 6 THEN 'דיני עבודה'
    WHEN 7 THEN 'דיני מסחר' WHEN 8 THEN 'דיני ביטוח' WHEN 9 THEN 'דיני נדלן'
    WHEN 10 THEN 'דיני עבודה'
  END as legal_category,
  'closed' as status,
  CASE rn 
    WHEN 1 THEN 'high' WHEN 2 THEN 'high' WHEN 3 THEN 'high' WHEN 4 THEN 'critical'
    WHEN 5 THEN 'high' WHEN 6 THEN 'medium' WHEN 7 THEN 'medium' WHEN 8 THEN 'high'
    WHEN 9 THEN 'medium' WHEN 10 THEN 'high'
  END as priority,
  CASE rn 
    WHEN 1 THEN 250000 WHEN 2 THEN 500000 WHEN 3 THEN 180000 WHEN 4 THEN 320000 WHEN 5 THEN 450000
    WHEN 6 THEN 150000 WHEN 7 THEN 80000 WHEN 8 THEN 380000 WHEN 9 THEN 200000 WHEN 10 THEN 275000
  END as estimated_budget,
  lawyer_id,
  NOW() - INTERVAL '6 months' + (rn * INTERVAL '15 days') as opened_at,
  CASE rn 
    WHEN 1 THEN 'תיק שנסגר בהצלחה לאחר 8 חודשי משפט. הלקוח קיבל פיצוי של 180,000 ש"ח. בפיקוח שופט אילנה כהן.'
    WHEN 2 THEN 'עסקה מורכבת שהסתיימה בהצלחה. שתי החברות התמזגו תחת פיקוח רגולטורי מלא. השופט דוד לוי פיקח על ההליך.'
    WHEN 3 THEN 'תביעה ייצוגית שהסתיימה בפשרה של 5 מיליון שקל לטובת הלקוחות. השופטת שרה רוזן אישרה את הפשרה.'
    WHEN 4 THEN 'תיק פורץ דרך בנושא הטרדה מינית. פסק דין שקבע תקדים חשוב. השופט מיכאל ברק הוביל את ההליך.'
    WHEN 5 THEN 'עסקת רכישה מוצלחת ל-Google. סכום העסקה: 50 מיליון דולר. השופטת תמר אברמס פיקחה על התהליך.'
    WHEN 6 THEN 'משא ומתן מוצלח שהגיע להסכם חדש לשלוש שנים. השופט יוסי מזרחי פיקח על המו"מ.'
    WHEN 7 THEN 'הקמת חברה וגיוס 2 מיליון שקל מהשקעה ראשונה. השופטת עינת שפירא אישרה את המבנה המשפטי.'
    WHEN 8 THEN 'תביעת תאונת עבודה שהסתיימה בפיצוי של 1.2 מיליון שקל. השופט אבי שוורץ ניהל את התיק.'
    WHEN 9 THEN 'עסקת נדלן בשווי 25 מיליון שקל הושלמה בהצלחה. השופטת נעמי גולד פיקחה על העסקה.'
    WHEN 10 THEN 'פתרון מחלוקת עבודה מורכבת בהליך בוררות. השופט רונן פרידמן כיהן כבורר.'
  END as notes
FROM selected_lawyers;