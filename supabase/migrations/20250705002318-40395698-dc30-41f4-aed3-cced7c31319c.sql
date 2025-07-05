-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow first admin bootstrap" ON public.user_roles;
DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow admin operations" ON public.user_roles;
DROP POLICY IF EXISTS "Allow admin deletions" ON public.user_roles;

-- Temporarily allow authenticated users to manage their own roles for bootstrap
CREATE POLICY "Temporary bootstrap policy" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());