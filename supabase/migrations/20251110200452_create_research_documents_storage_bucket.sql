/*
  # Create Research Documents Storage Bucket

  1. Storage
    - Create `research_documents` bucket for storing institutional approval documents
    - Set bucket to private (not public)

  2. Security
    - Users can upload their own documents
    - Users can view/download their own documents
    - Admins can view all documents for verification
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('research_documents', 'research_documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own research documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'research_documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own research documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'research_documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own research documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'research_documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own research documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'research_documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can view all research documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'research_documents'
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );
