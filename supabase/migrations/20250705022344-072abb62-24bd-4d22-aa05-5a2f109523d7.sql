-- Remove the dangerous bootstrap admin policy that allowed anyone to become admin
DROP POLICY IF EXISTS "Bootstrap first admin user" ON public.user_roles;