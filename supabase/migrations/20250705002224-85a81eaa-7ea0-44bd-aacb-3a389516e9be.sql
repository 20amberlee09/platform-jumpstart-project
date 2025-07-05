-- Remove the policy that still causes recursion
DROP POLICY IF EXISTS "Security definer admin operations" ON public.user_roles;

-- Create separate policies for UPDATE and DELETE that check the table directly
CREATE POLICY "Admins can update roles" 
ON public.user_roles 
FOR UPDATE 
TO authenticated
USING (EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

CREATE POLICY "Admins can delete roles" 
ON public.user_roles 
FOR DELETE 
TO authenticated
USING (EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));