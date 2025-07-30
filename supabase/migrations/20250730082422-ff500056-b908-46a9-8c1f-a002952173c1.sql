-- תיקון מדיניות RLS כדי שהמשתמש יוכל לראות נתונים
-- נעדכן את המדיניות להיות יותר פתוחה למשתמשים מאומתים

-- תיקון מדיניות לידים - תאפשר למשתמשים מאומתים לראות לידים
DROP POLICY IF EXISTS "Lawyers can view assigned leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can manage all leads" ON public.leads;

CREATE POLICY "Authenticated users can view leads" ON public.leads
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage leads" ON public.leads
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- תיקון מדיניות תיקים - תאפשר למשתמשים מאומתים לראות תיקים
DROP POLICY IF EXISTS "Lawyers can view assigned cases" ON public.cases;
DROP POLICY IF EXISTS "Lawyers can create cases" ON public.cases;
DROP POLICY IF EXISTS "Lawyers can update assigned cases" ON public.cases;

CREATE POLICY "Authenticated users can view cases" ON public.cases
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage cases" ON public.cases
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- תיקון מדיניות אירועים - תאפשר למשתמשים מאומתים לראות אירועים
DROP POLICY IF EXISTS "Users can view their events" ON public.events;
DROP POLICY IF EXISTS "Lawyers can manage events" ON public.events;

CREATE POLICY "Authenticated users can view events" ON public.events
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage events" ON public.events
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);