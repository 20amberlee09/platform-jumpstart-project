-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

-- Create a security definer function that checks admin without RLS
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- Simple policies using the security definer function
CREATE POLICY "Allow admin operations" 
ON public.user_roles 
FOR UPDATE 
TO authenticated
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Allow admin deletions" 
ON public.user_roles 
FOR DELETE 
TO authenticated
USING (public.is_admin_user(auth.uid()));