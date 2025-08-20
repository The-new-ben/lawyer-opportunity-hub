-- First check the current constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND contype = 'c';

-- Drop the problematic check constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Now reset all user roles and set only benbetesh@gmail.com as admin
DELETE FROM public.user_roles;

-- Insert admin role for benbetesh@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'admin'::app_role
FROM public.profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'benbetesh@gmail.com';

-- Update profile role to match (for consistency)
UPDATE public.profiles 
SET role = 'admin'
WHERE user_id IN (
  SELECT u.id 
  FROM auth.users u 
  WHERE u.email = 'benbetesh@gmail.com'
);

-- Set all other profiles to a valid default role
UPDATE public.profiles 
SET role = 'customer'
WHERE user_id NOT IN (
  SELECT u.id 
  FROM auth.users u 
  WHERE u.email = 'benbetesh@gmail.com'
);

-- Check what user roles need to be added
SELECT p.user_id, p.role, ur.role as user_role_role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id;