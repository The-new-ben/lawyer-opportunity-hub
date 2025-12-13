-- Check what roles are allowed in profiles table
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND contype = 'c';