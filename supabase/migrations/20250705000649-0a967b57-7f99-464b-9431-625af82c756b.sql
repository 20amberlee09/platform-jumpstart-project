-- Make sure your user gets admin access
-- Replace 'YOUR_USER_EMAIL' with your actual email
-- This will run after you sign up
DO $$ 
DECLARE 
  user_exists boolean;
BEGIN
  -- Check if any admin users exist
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO user_exists;
  
  -- If no admins exist, this will be handled by the AutoAdminSetup component
  -- This migration just ensures the structure is ready
  RAISE NOTICE 'Admin role system ready. First user will automatically become admin.';
END $$;