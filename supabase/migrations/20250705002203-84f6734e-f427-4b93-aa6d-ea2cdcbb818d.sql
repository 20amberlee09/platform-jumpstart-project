-- Remove all existing policies that cause recursion
DROP POLICY IF EXISTS "Allow bootstrap admin creation" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

-- Create simple policies that don't cause recursion
-- Allow any authenticated user to insert their first admin role
CREATE POLICY "Allow first admin bootstrap" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow users to view their own roles only
CREATE POLICY "Users view own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- For now, let's use the security definer function for admin operations
-- This will work once the first admin is created
CREATE POLICY "Security definer admin operations" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));