-- ============================================================
-- LUMIÈRE E-COMMERCE PLATFORM — SEED ADMIN CREDENTIALS SQL
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ============================================================

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  admin_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- 1. Insert admin user into auth.users if not already registered
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@lumiere.com') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role,
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@lumiere.com',
      crypt('Lumiere@2026', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Lumière Admin"}',
      'authenticated',
      'authenticated',
      NOW(),
      NOW()
    );
  END IF;

  -- 2. Insert/Update admin profile in public.profiles with role = 'admin'
  INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (
    admin_user_id,
    'admin@lumiere.com',
    'Lumière Admin',
    'admin',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    full_name = 'Lumière Admin',
    updated_at = NOW();

END $$;
