-- Create app_role enum and user_roles table
CREATE TYPE IF NOT EXISTS public.app_role AS ENUM ('admin', 'lawyer', 'client', 'supplier');

CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL,
    created_at timestamptz DEFAULT now()
);
