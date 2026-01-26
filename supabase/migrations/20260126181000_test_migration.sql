-- Test migration - create a debug table
CREATE TABLE IF NOT EXISTS public.migration_test (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    message text,
    created_at timestamp with time zone DEFAULT now()
);

INSERT INTO public.migration_test (message) VALUES ('Migration test executed at: ' || now()::text);

-- Also test user creation
SELECT 'Current users:' as debug;
SELECT email, created_at FROM auth.users WHERE email = 'admin@gmail.com';
