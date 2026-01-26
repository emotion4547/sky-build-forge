-- Add admin user for skbural56
-- Email: admin@gmail.com
-- Password: q23jGZx

-- First, ensure pgcrypto extension exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert admin user into auth.users
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    last_sign_in_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'admin@gmail.com',
    crypt('q23jGZx', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now(),
    now(),
    '',
    '',
    '',
    ''
) ON CONFLICT(email) DO NOTHING;

-- Add admin role to the newly created user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'admin@gmail.com'
ON CONFLICT DO NOTHING;
