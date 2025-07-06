-- Truth Hurts Platform - Complete Database Schema Enhancement
-- This must be executed BEFORE any code implementation

-- Add all required columns to existing profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS minister_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS minister_name TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS minister_certificate_url TEXT,
ADD COLUMN IF NOT EXISTS barcode_certificate_url TEXT,
ADD COLUMN IF NOT EXISTS google_drive_url TEXT,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

-- Create document tracking table
CREATE TABLE IF NOT EXISTS document_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    document_type TEXT,
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Create blockchain verification table
CREATE TABLE IF NOT EXISTS blockchain_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES document_files(id) ON DELETE CASCADE,
    transaction_hash TEXT NOT NULL,
    blockchain_network TEXT DEFAULT 'xrp_ledger',
    verification_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_minister_verified ON profiles(minister_verified);
CREATE INDEX IF NOT EXISTS idx_document_files_user_id ON document_files(user_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_verifications_user_id ON blockchain_verifications(user_id);

-- Enable Row Level Security
ALTER TABLE document_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own documents" ON document_files
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own verifications" ON blockchain_verifications
    FOR ALL USING (auth.uid() = user_id);