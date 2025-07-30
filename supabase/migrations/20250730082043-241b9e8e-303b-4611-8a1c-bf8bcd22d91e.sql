-- הוספת נתונים לדוגמה למערכת
-- נוסיף נתונים לדוגמה כדי שהמשתמש יוכל לראות את המערכת עובדת

-- נוסיף תפקיד למשתמש הנוכחי
INSERT INTO public.user_roles (user_id, role) 
VALUES ('d315c1e1-cf8b-44fc-8d8a-b13216d1c96d', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- נוסיף לידים לדוגמה
INSERT INTO public.leads (customer_name, customer_phone, customer_email, case_description, legal_category, urgency_level, status, estimated_budget) VALUES
('יוסף כהן', '052-1234567', 'yosef@example.com', 'תאונת דרכים קשה, זקוק לייצוג משפטי', 'אזרחי', 'high', 'new', 50000),
('שרה לוי', '053-9876543', 'sarah@example.com', 'בעיות עבודה - פיטורים לא חוקיים', 'עבודה', 'medium', 'new', 25000),
('דוד אברהם', '054-5555555', 'david@example.com', 'גירושין וחלוקת רכוש', 'משפחה', 'low', 'converted', 15000),
('מרים רוזן', '050-1111111', 'miriam@example.com', 'קניית דירה - בדיקת חוזה', 'נדלן', 'medium', 'new', 8000);

-- נוסיף תיקים לדוגמה
INSERT INTO public.cases (title, client_id, status, priority, legal_category, notes, estimated_budget, assigned_lawyer_id) VALUES
('תביעת נזיקין - תאונת דרכים', (SELECT id FROM profiles WHERE user_id = 'd315c1e1-cf8b-44fc-8d8a-b13216d1c96d'), 'open', 'high', 'אזרחי', 'תיק דחוף - דיון בשבוע הבא', 50000, (SELECT id FROM profiles WHERE user_id = 'd315c1e1-cf8b-44fc-8d8a-b13216d1c96d')),
('ייעוץ משפטי - הקמת חברה', (SELECT id FROM profiles WHERE user_id = 'd315c1e1-cf8b-44fc-8d8a-b13216d1c96d'), 'open', 'medium', 'מסחרי', 'הכנת מסמכי יסוד', 15000, (SELECT id FROM profiles WHERE user_id = 'd315c1e1-cf8b-44fc-8d8a-b13216d1c96d')),
('גירושין - חלוקת רכוש', (SELECT id FROM profiles WHERE user_id = 'd315c1e1-cf8b-44fc-8d8a-b13216d1c96d'), 'closed', 'low', 'משפחה', 'תיק הסתיים בהסכמה', 25000, (SELECT id FROM profiles WHERE user_id = 'd315c1e1-cf8b-44fc-8d8a-b13216d1c96d'));

-- נוסיף אירועים לדוגמה (השבוע הקרוב)
INSERT INTO public.events (title, start_time, end_time, description, lawyer_id) VALUES
('פגישה עם יוסף כהן', NOW() + INTERVAL '1 day' + INTERVAL '10 hours', NOW() + INTERVAL '1 day' + INTERVAL '11 hours', 'פגישת ייעוץ ראשונית', (SELECT id FROM profiles WHERE user_id = 'd315c1e1-cf8b-44fc-8d8a-b13216d1c96d')),
('דיון בבית משפט', NOW() + INTERVAL '2 days' + INTERVAL '14 hours', NOW() + INTERVAL '2 days' + INTERVAL '16 hours', 'בית משפט שלום תל אביב', (SELECT id FROM profiles WHERE user_id = 'd315c1e1-cf8b-44fc-8d8a-b13216d1c96d')),
('הכנת מסמכים', NOW() + INTERVAL '3 days' + INTERVAL '9 hours', NOW() + INTERVAL '3 days' + INTERVAL '12 hours', 'עבודה פנימית על תיק אברהם', (SELECT id FROM profiles WHERE user_id = 'd315c1e1-cf8b-44fc-8d8a-b13216d1c96d')),
('פגישת זום עם שרה לוי', NOW() + INTERVAL '4 days' + INTERVAL '16 hours', NOW() + INTERVAL '4 days' + INTERVAL '17 hours', 'פגישה וירטואלית', (SELECT id FROM profiles WHERE user_id = 'd315c1e1-cf8b-44fc-8d8a-b13216d1c96d'));