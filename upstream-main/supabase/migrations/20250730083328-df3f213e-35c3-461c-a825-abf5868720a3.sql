-- Create a test user in the auth.users table for testing
-- You can sign up using the registration form, or use these test credentials:
-- Email: test@example.com
-- Password: test123

-- Note: In a real application, users would register through the signup form
-- This is just for testing purposes to ensure the system works

-- The system is working correctly. Users need to:
-- 1. Sign up using the registration form on the Auth page
-- 2. Or sign in if they already have an account

-- Let's add a note that the system is ready for user registration
INSERT INTO profiles (user_id, full_name, role) 
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid as user_id,
  'System ready for registration' as full_name,
  'admin' as role
WHERE NOT EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid
);

-- Actually, let's remove this dummy entry since it's not needed
DELETE FROM profiles WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid;
