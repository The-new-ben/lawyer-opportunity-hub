-- Add sample data to the system
-- Add sample data so the user can see the system working

-- Add a role for the current user
INSERT INTO public.user_roles (user_id, role) 
VALUES ('d315c1e1-cf8b-44fc-8d8a-b13216d1c96d', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Add sample leads
INSERT INTO public.leads (customer_name, customer_phone, customer_email, case_description, legal_category, urgency_level, status, estimated_budget) VALUES
('Yosef Cohen', '052-1234567', 'yosef@example.com', 'Serious car accident, needs legal representation', 'Civil', 'high', 'new', 50000),
('Sarah Levy', '053-9876543', 'sarah@example.com', 'Work issues - unlawful termination', 'Labor', 'medium', 'new', 25000),
('David Avraham', '054-5555555', 'david@example.com', 'Divorce and division of property', 'Family', 'low', 'converted', 15000),
('Miriam Rosen', '050-1111111', 'miriam@example.com', 'Apartment purchase - contract review', 'Real Estate', 'medium', 'new', 8000);

-- Add sample cases
INSERT INTO public.cases (title, client_id, status, priority, legal_category, notes, estimated_budget, assigned_lawyer_id) VALUES
('Tort claim - car accident', (SELECT id FROM profiles WHERE user_id = 'd315c1e1-cf8b-44fc-8d8a-b13216d1c96d'), 'open', 'high', 'Civil', 'Urgent case - hearing next week', 50000, (SELECT id FROM profiles WHERE user_id = 'd315c1e1-cf8b-44fc-8d8a-b13216d1c96d')),
('Legal consultation - company formation', (SELECT id FROM profiles WHERE user_id = 'd315c1e1-cf8b-44fc-8d8a-b13216d1c96d'), 'open', 'medium', 'Commercial', 'Preparing foundational documents', 15000, (SELECT id FROM profiles WHERE user_id = 'd315c1e1-cf8b-44fc-8d8a-b13216d1c96d')),
('Divorce - division of property', (SELECT id FROM profiles WHERE user_id = 'd315c1e1-cf8b-44fc-8d8a-b13216d1c96d'), 'closed', 'low', 'Family', 'Case ended with agreement', 25000, (SELECT id FROM profiles WHERE user_id = 'd315c1e1-cf8b-44fc-8d8a-b13216d1c96d'));

-- Add sample events (upcoming week)
INSERT INTO public.events (title, start_time, end_time, description, lawyer_id) VALUES
('Meeting with Yosef Cohen', NOW() + INTERVAL '1 day' + INTERVAL '10 hours', NOW() + INTERVAL '1 day' + INTERVAL '11 hours', 'Initial consultation meeting', (SELECT id FROM profiles WHERE user_id = 'd315c1e1-cf8b-44fc-8d8a-b13216d1c96d')),
('Court hearing', NOW() + INTERVAL '2 days' + INTERVAL '14 hours', NOW() + INTERVAL '2 days' + INTERVAL '16 hours', 'Tel Aviv Magistrate Court', (SELECT id FROM profiles WHERE user_id = 'd315c1e1-cf8b-44fc-8d8a-b13216d1c96d')),
('Document preparation', NOW() + INTERVAL '3 days' + INTERVAL '9 hours', NOW() + INTERVAL '3 days' + INTERVAL '12 hours', 'Internal work on Avraham case', (SELECT id FROM profiles WHERE user_id = 'd315c1e1-cf8b-44fc-8d8a-b13216d1c96d')),
('Zoom meeting with Sarah Levy', NOW() + INTERVAL '4 days' + INTERVAL '16 hours', NOW() + INTERVAL '4 days' + INTERVAL '17 hours', 'Virtual meeting', (SELECT id FROM profiles WHERE user_id = 'd315c1e1-cf8b-44fc-8d8a-b13216d1c96d'));