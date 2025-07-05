-- Drop existing problematic policies on user_roles
DROP POLICY IF EXISTS "Admins can manage user roles or bootstrap first admin" ON public.user_roles;
DROP POLICY IF EXISTS "Allow user role management" ON public.user_roles;
DROP POLICY IF EXISTS "Temporary bootstrap policy" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- Create a proper security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'::app_role
  )
$$;

-- Create simplified, non-recursive policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all user roles"
ON public.user_roles
FOR ALL
USING (public.is_admin_user(auth.uid()))
WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Bootstrap first admin user"
ON public.user_roles
FOR INSERT
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'::app_role
  )
);