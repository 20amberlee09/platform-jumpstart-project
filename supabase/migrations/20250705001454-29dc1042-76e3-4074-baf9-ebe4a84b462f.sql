-- Fix the bootstrap problem for first admin user
-- Drop the existing policy that's too restrictive
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;

-- Create a new policy that allows:
-- 1. Admins to manage all roles (existing functionality)
-- 2. Anyone to insert admin role IF no admin exists yet (bootstrap case)
CREATE POLICY "Admins can manage user roles or bootstrap first admin" 
ON public.user_roles 
FOR ALL 
USING (
  -- Allow admins to do everything
  public.has_role(auth.uid(), 'admin') 
  OR 
  -- Allow first admin creation when no admins exist
  (NOT EXISTS(SELECT 1 FROM public.user_roles WHERE role = 'admin'))
) 
WITH CHECK (
  -- Same logic for inserts/updates
  public.has_role(auth.uid(), 'admin') 
  OR 
  (NOT EXISTS(SELECT 1 FROM public.user_roles WHERE role = 'admin'))
);