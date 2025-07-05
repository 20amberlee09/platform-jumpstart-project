-- Re-enable RLS now that admin is set up
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Add back the simple policies
CREATE POLICY "Users can view own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Allow user role management" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());