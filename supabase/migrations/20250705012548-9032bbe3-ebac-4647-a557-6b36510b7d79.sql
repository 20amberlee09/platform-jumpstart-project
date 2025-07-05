-- Re-enable RLS on user_roles table to fix security issues
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;