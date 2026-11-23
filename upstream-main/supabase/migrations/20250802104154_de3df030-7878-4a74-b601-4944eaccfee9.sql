-- Add missing user_roles for customers
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'customer'::app_role
FROM public.profiles p
WHERE p.user_id NOT IN (
  SELECT ur.user_id FROM public.user_roles ur
);

-- Verify the setup
SELECT 
  u.email,
  p.role as profile_role,
  ur.role as user_role
FROM auth.users u
JOIN public.profiles p ON u.id = p.user_id
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
ORDER BY u.email;