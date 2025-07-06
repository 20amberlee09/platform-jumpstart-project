-- Policy: Users can upload their own documents
CREATE POLICY "Users can upload their own documents" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view their own documents
CREATE POLICY "Users can view their own documents" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own documents
CREATE POLICY "Users can update their own documents" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own documents
CREATE POLICY "Users can delete their own documents" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Admins can manage all documents
CREATE POLICY "Admins can manage all documents" 
ON storage.objects 
FOR ALL 
TO authenticated
USING (
  bucket_id = 'documents' 
  AND has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'documents' 
  AND has_role(auth.uid(), 'admin'::app_role)
);