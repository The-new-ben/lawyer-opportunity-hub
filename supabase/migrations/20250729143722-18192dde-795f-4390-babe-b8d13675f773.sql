-- Add sample data with correct status values

-- Insert sample leads with valid status values
INSERT INTO public.leads (customer_name, customer_email, customer_phone, legal_category, case_description, status, urgency_level, estimated_budget) VALUES
('David Cohen', 'david@example.com', '050-1234567', 'Family Law', 'Divorce and division of property', 'new', 'high', 15000),
('Sarah Levy', 'sarah@example.com', '052-9876543', 'Labor Law', 'Unlawful termination', 'new', 'medium', 8000),
('Yossi Avraham', 'yossi@example.com', '054-5555555', 'Tort Law', 'Car accident', 'assigned', 'high', 25000),
('Miri David', 'miri@example.com', '053-1111111', 'Real Estate Law', 'Apartment purchase', 'new', 'low', 5000);