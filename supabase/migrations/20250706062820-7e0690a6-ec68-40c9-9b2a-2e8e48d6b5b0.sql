-- Create verification logs table for audit trail
CREATE TABLE IF NOT EXISTS verification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  verified_status BOOLEAN,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  admin_id UUID
);

-- Enable RLS on verification logs
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;

-- Admin-only access to verification logs
CREATE POLICY "Admins can view all verification logs" ON verification_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to get minister status with profile data
CREATE OR REPLACE FUNCTION get_minister_status(user_uuid UUID)
RETURNS TABLE (
  is_minister BOOLEAN,
  minister_name TEXT,
  verification_status TEXT,
  certificate_url TEXT
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT 
    COALESCE(minister_verified, false),
    COALESCE(minister_name, first_name),
    COALESCE(verification_status, 'pending'),
    minister_certificate_url
  FROM profiles 
  WHERE user_id = user_uuid;
$$;

-- Function to update minister verification status
CREATE OR REPLACE FUNCTION update_minister_verification(
  user_uuid UUID,
  verified BOOLEAN,
  admin_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE profiles 
  SET 
    minister_verified = verified,
    verification_status = CASE 
      WHEN verified THEN 'verified'
      ELSE 'rejected'
    END,
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  -- Log the verification action
  INSERT INTO verification_logs (
    user_id,
    action,
    verified_status,
    admin_notes,
    admin_id,
    created_at
  ) VALUES (
    user_uuid,
    'minister_verification',
    verified,
    admin_notes,
    auth.uid(),
    NOW()
  );
  
  RETURN FOUND;
END;
$$;

-- Function to get comprehensive admin analytics
CREATE OR REPLACE FUNCTION get_admin_analytics()
RETURNS JSON LANGUAGE sql SECURITY DEFINER AS $$
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'verified_ministers', (SELECT COUNT(*) FROM profiles WHERE minister_verified = true),
    'pending_verifications', (
      SELECT COUNT(*) FROM profiles 
      WHERE minister_certificate_url IS NOT NULL 
      AND minister_verified = false
    ),
    'total_documents', (SELECT COUNT(*) FROM document_files),
    'total_revenue', (
      SELECT COALESCE(SUM(amount), 0) FROM orders WHERE status = 'completed'
    ),
    'documents_by_type', (
      SELECT json_object_agg(document_type, count)
      FROM (
        SELECT document_type, COUNT(*) as count
        FROM document_files
        GROUP BY document_type
      ) as doc_counts
    ),
    'monthly_registrations', (
      SELECT json_object_agg(month, count)
      FROM (
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as count
        FROM profiles
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY month
        ORDER BY month
      ) as monthly_data
    )
  );
$$;

-- Function to get minister verification queue
CREATE OR REPLACE FUNCTION get_minister_verification_queue()
RETURNS TABLE (
  profile_id UUID,
  full_name TEXT,
  minister_name TEXT,
  certificate_url TEXT,
  submitted_at TIMESTAMPTZ,
  verification_status TEXT
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT 
    p.id,
    p.full_name,
    p.minister_name,
    p.minister_certificate_url,
    p.created_at,
    p.verification_status
  FROM profiles p
  WHERE p.minister_certificate_url IS NOT NULL
  ORDER BY p.created_at DESC;
$$;

-- Enhanced RLS for document_files based on minister status
DROP POLICY IF EXISTS "Users can manage their own documents" ON document_files;
CREATE POLICY "Enhanced document access" ON document_files
  FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_minister_lookup 
  ON profiles(minister_verified, verification_status) 
  WHERE minister_certificate_url IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_document_files_user_type 
  ON document_files(user_id, document_type, upload_date);

CREATE INDEX IF NOT EXISTS idx_orders_status_amount 
  ON orders(status, amount) 
  WHERE status = 'completed';

-- Add partial indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_pending_ministers 
  ON profiles(id, created_at) 
  WHERE minister_certificate_url IS NOT NULL 
  AND minister_verified = false;

-- Optimize user progress queries
CREATE INDEX IF NOT EXISTS idx_user_progress_course_user 
  ON user_progress(course_id, user_id, current_step);

-- Add check constraints for data integrity (safe way to add if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_verification_status' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT check_verification_status 
    CHECK (verification_status IN ('pending', 'verified', 'rejected'));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_document_type' 
    AND table_name = 'document_files'
  ) THEN
    ALTER TABLE document_files 
    ADD CONSTRAINT check_document_type 
    CHECK (document_type IN (
      'minister_certificate', 
      'barcode_certificate', 
      'generated_document', 
      'trust_document',
      'general'
    ));
  END IF;
END $$;

-- Apply trigger to profiles table for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();