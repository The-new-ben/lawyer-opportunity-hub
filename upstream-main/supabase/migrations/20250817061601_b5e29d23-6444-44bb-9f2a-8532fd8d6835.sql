-- Just add ratings and specializations for now without the problematic leads
-- Add ratings for existing closed cases
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

-- Add lawyer tiers for the professionals
INSERT INTO public.lawyer_tiers (lawyer_id, tier, tier_score, financial_bonus_multiplier, early_access_hours, platform_fee_reduction)
SELECT 
  l.id,
  CASE 
    WHEN l.rating >= 4.8 THEN 'platinum'
    WHEN l.rating >= 4.5 THEN 'gold'
    WHEN l.rating >= 4.0 THEN 'silver'
    ELSE 'bronze'
  END as tier,
  CASE 
    WHEN l.rating >= 4.8 THEN 95 + FLOOR(RANDOM() * 5)
    WHEN l.rating >= 4.5 THEN 85 + FLOOR(RANDOM() * 10)
    WHEN l.rating >= 4.0 THEN 70 + FLOOR(RANDOM() * 15)
    ELSE 50 + FLOOR(RANDOM() * 20)
  END as tier_score,
  CASE 
    WHEN l.rating >= 4.8 THEN 1.5
    WHEN l.rating >= 4.5 THEN 1.3
    WHEN l.rating >= 4.0 THEN 1.2
    ELSE 1.0
  END as financial_bonus_multiplier,
  CASE 
    WHEN l.rating >= 4.8 THEN 24
    WHEN l.rating >= 4.5 THEN 12
    WHEN l.rating >= 4.0 THEN 6
    ELSE 0
  END as early_access_hours,
  CASE 
    WHEN l.rating >= 4.8 THEN 0.15
    WHEN l.rating >= 4.5 THEN 0.10
    WHEN l.rating >= 4.0 THEN 0.05
    ELSE 0.0
  END as platform_fee_reduction
FROM lawyers l
WHERE l.verification_status = 'verified'
AND l.id NOT IN (SELECT lawyer_id FROM lawyer_tiers);