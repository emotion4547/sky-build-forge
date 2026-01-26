-- Delete old admin@gmail.com user and recreate with correct password
BEGIN;

-- Step 1: Remove old user and their roles
DELETE FROM public.user_roles 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'admin@gmail.com');

DELETE FROM auth.users 
WHERE email = 'admin@gmail.com';

-- Step 2: Create fresh admin user with properly hashed password
-- Password: q23jGZx
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
) VALUES (
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
);

-- Step 3: Assign admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'admin@gmail.com';

COMMIT;
