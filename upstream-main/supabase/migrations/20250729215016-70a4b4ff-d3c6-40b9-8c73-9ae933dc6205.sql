-- Fix infinite recursion in profiles policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile (except role)" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Create corrected policies without recursion
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid() AND (role = OLD.role OR auth.uid() IN (
  SELECT user_id FROM public.profiles WHERE role = 'admin'
)));

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT auth.uid() FROM auth.users 
    WHERE auth.uid() IN (
      SELECT user_id FROM public.profiles WHERE role = 'admin'
    )
  )
);

CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT auth.uid() FROM auth.users 
    WHERE auth.uid() IN (
      SELECT user_id FROM public.profiles WHERE role = 'admin'
    )
  )
);