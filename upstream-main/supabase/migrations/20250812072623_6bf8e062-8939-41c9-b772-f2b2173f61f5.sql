-- Expand roles and add notification preferences + sync triggers
BEGIN;

-- Safely add new roles to enum app_role if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'customer'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'customer';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'client'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'client';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'supplier'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'supplier';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'judge'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'judge';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'witness'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'witness';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'audience'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'audience';
  END IF;
END $$;

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email boolean NOT NULL DEFAULT true,
  whatsapp boolean NOT NULL DEFAULT true,
  in_app boolean NOT NULL DEFAULT true,
  digest_frequency text NOT NULL DEFAULT 'daily',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(profile_id)
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notification_preferences' AND policyname = 'Users can view their own notification preferences'
  ) THEN
    CREATE POLICY "Users can view their own notification preferences"
    ON public.notification_preferences
    FOR SELECT
    TO authenticated
    USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notification_preferences' AND policyname = 'Users can insert their own notification preferences'
  ) THEN
    CREATE POLICY "Users can insert their own notification preferences"
    ON public.notification_preferences
    FOR INSERT
    TO authenticated
    WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notification_preferences' AND policyname = 'Users can update their own notification preferences'
  ) THEN
    CREATE POLICY "Users can update their own notification preferences"
    ON public.notification_preferences
    FOR UPDATE
    TO authenticated
    USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
    WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notification_preferences' AND policyname = 'Admins can view all notification preferences'
  ) THEN
    CREATE POLICY "Admins can view all notification preferences"
    ON public.notification_preferences
    FOR SELECT
    TO authenticated
    USING (public.get_current_user_role() = 'admin');
  END IF;
END $$;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_update_notification_prefs_updated_at ON public.notification_preferences;
CREATE TRIGGER trg_update_notification_prefs_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create sync function to ensure user_roles includes profiles.role
CREATE OR REPLACE FUNCTION public.sync_user_roles_from_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.role IS NOT NULL THEN
    BEGIN
      INSERT INTO public.user_roles (user_id, role)
      SELECT NEW.user_id, NEW.role::app_role
      WHERE NOT EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = NEW.user_id AND ur.role = NEW.role::app_role
      );
    EXCEPTION WHEN others THEN
      -- Avoid blocking profile writes if cast fails or constraint issues
      NULL;
    END;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach triggers on profiles
DROP TRIGGER IF EXISTS trg_sync_user_roles_on_profiles_ins ON public.profiles;
DROP TRIGGER IF EXISTS trg_sync_user_roles_on_profiles_upd ON public.profiles;

CREATE TRIGGER trg_sync_user_roles_on_profiles_ins
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_roles_from_profile();

CREATE TRIGGER trg_sync_user_roles_on_profiles_upd
AFTER UPDATE OF role ON public.profiles
FOR EACH ROW
WHEN (OLD.role IS DISTINCT FROM NEW.role)
EXECUTE FUNCTION public.sync_user_roles_from_profile();

COMMIT;