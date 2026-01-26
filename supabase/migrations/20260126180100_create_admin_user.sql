-- Create admin user with correct password hash
-- Email: admin@gmail.com  
-- Password: q23jGZx
-- Bcrypt hash: $2b$10$kDN9LiL4R2nQE6/Hfetb..HYaQiQmn3cjygfwZ3/GQ5l1Mda3HMQy

DELETE FROM public.user_roles 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'admin@gmail.com');

DELETE FROM auth.users WHERE email = 'admin@gmail.com';

-- Create the admin user
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
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@gmail.com',
    '$2b$10$kDN9LiL4R2nQE6/Hfetb..HYaQiQmn3cjygfwZ3/GQ5l1Mda3HMQy',
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    now(),
    now(),
    '',
    '',
    '',
    ''
);

-- Assign admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'admin@gmail.com';
