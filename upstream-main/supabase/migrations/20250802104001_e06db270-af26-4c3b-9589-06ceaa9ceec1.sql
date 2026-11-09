-- First check current enum values and fix them
SELECT unnest(enum_range(NULL::app_role));

-- Add missing enum values if needed
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'customer';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'lead_provider';

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

-- Ensure all other profiles are set to customer by default
UPDATE public.profiles 
SET role = 'customer'
WHERE user_id NOT IN (
  SELECT u.id 
  FROM auth.users u 
  WHERE u.email = 'benbetesh@gmail.com'
);

-- Add default customer roles for all other users
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'customer'::app_role
FROM public.profiles p
WHERE p.user_id NOT IN (
  SELECT ur.user_id FROM public.user_roles ur
);