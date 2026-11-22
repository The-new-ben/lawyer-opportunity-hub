-- Add sample data with correct status values

-- Insert sample leads with valid status values
INSERT INTO public.leads (customer_name, customer_email, customer_phone, legal_category, case_description, status, urgency_level, estimated_budget) VALUES
('דוד כהן', 'david@example.com', '050-1234567', 'דיני משפחה', 'גירושין וחלוקת רכוש', 'new', 'high', 15000),
('שרה לוי', 'sarah@example.com', '052-9876543', 'דיני עבודה', 'פיטורים לא חוקיים', 'new', 'medium', 8000),
('יוסי אברהם', 'yossi@example.com', '054-5555555', 'דיני נזיקין', 'תאונת דרכים', 'assigned', 'high', 25000),
('מירי דוד', 'miri@example.com', '053-1111111', 'דיני מקרקעין', 'רכישת דירה', 'new', 'low', 5000);