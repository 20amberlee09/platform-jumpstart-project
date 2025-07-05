-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Simple policy: Allow first admin creation by allowing inserts when no admin exists
CREATE POLICY "Allow bootstrap admin creation" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  NOT EXISTS(SELECT 1 FROM public.user_roles WHERE role = 'admin')
  OR 
  EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Allow users to see their own roles
CREATE POLICY "Users can view own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

-- Allow admins to see all roles (separate policy to avoid recursion)
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Allow admins to manage roles
CREATE POLICY "Admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));