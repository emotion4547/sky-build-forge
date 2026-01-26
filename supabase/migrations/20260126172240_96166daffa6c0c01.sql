-- Fix admin user - ensure proper password hashing
-- This uses Supabase's built-in auth functions

-- Step 1: Delete existing admin@gmail.com user if exists (to start fresh)
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'admin@gmail.com'
);

DELETE FROM auth.users WHERE email = 'admin@gmail.com';

-- Step 2: Create new admin user using Supabase auth functions
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
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    is_super_admin
)
VALUES (
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
    now(),
    now(),
    '',
    '',
    '',
    '',
    false
);

-- Step 3: Assign admin role to the user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'admin@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 4: Verify the user was created
SELECT email, id, email_confirmed_at FROM auth.users WHERE email = 'admin@gmail.com';
