-- Complete reset: delete old user and all related data
DELETE FROM public.user_roles 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'admin@gmail.com'
);

DELETE FROM auth.users 
WHERE email = 'admin@gmail.com';

-- Verify deletion
SELECT COUNT(*) as admin_users FROM auth.users WHERE email = 'admin@gmail.com';
