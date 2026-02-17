/*
  # Make research documents bucket public
  
  1. Changes
    - Update `research_documents` bucket to be public
    - Add public SELECT policy for viewing documents
    - Keep existing authenticated policies for upload/update/delete
  
  2. Security
    - Anyone can view documents (public access for iframe viewing)
    - Only authenticated users can upload/update/delete their own documents
    - Admins can view all documents
*/

-- Update bucket to be public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'research_documents';

-- Add public read access policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can view research documents'
  ) THEN
    CREATE POLICY "Public can view research documents"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'research_documents');
  END IF;
END $$;