-- Step 1: Ensure pgcrypto is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 2: Reset password for admin@gmail.com using UPDATE instead of DELETE+INSERT
-- This will use bcrypt hashing
UPDATE auth.users
SET 
  encrypted_password = crypt('q23jGZx', gen_salt('bf', 10)),
  updated_at = now(),
  last_sign_in_at = now(),
  email_confirmed_at = now()
WHERE email = 'admin@gmail.com';

-- If user doesn't exist, create it
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at
) 
SELECT
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@gmail.com',
    crypt('q23jGZx', gen_salt('bf', 10)),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@gmail.com');

-- Step 3: Ensure admin role exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'admin@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
