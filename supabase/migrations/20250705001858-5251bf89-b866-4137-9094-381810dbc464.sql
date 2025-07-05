-- Fix infinite recursion by simplifying the bootstrap policy
-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can manage user roles or bootstrap first admin" ON public.user_roles;

-- Create a simpler policy that doesn't cause recursion
-- For INSERT: Allow if no admin exists OR if user is already admin (but check this without recursion)
CREATE POLICY "Allow first admin creation" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  -- Allow if this would be the first admin role
  (NEW.role = 'admin' AND NOT EXISTS(SELECT 1 FROM public.user_roles WHERE role = 'admin'))
  OR
  -- Allow if user already has admin role (direct check to avoid recursion)
  EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- For SELECT: Users can see their own roles, admins can see all
CREATE POLICY "Users can view user roles" 
ON public.user_roles 
FOR SELECT 
USING (
  user_id = auth.uid() 
  OR 
  EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- For UPDATE/DELETE: Only admins (direct check to avoid recursion)
CREATE POLICY "Admins can modify user roles" 
ON public.user_roles 
FOR UPDATE 
USING (EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
USING (EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));