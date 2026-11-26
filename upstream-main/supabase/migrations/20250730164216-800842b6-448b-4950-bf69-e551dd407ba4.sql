-- Check constraint details for profiles table
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_schema = 'public' 
AND constraint_name LIKE '%profiles%';