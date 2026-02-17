/*
  # Add document_url columns to research document tables
  
  1. Changes
    - Add `document_url` column to `safety_data_sheets` table
    - Add `document_url` column to `testing_reports` table
    - These columns will store the path to uploaded PDF files in Supabase storage
  
  2. Notes
    - `technical_data_sheets` already has a `document_url` column
    - All document_url fields are optional (nullable)
*/

-- Add document_url to safety_data_sheets if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'safety_data_sheets' AND column_name = 'document_url'
  ) THEN
    ALTER TABLE safety_data_sheets ADD COLUMN document_url text;
  END IF;
END $$;

-- Add document_url to testing_reports if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'testing_reports' AND column_name = 'document_url'
  ) THEN
    ALTER TABLE testing_reports ADD COLUMN document_url text;
  END IF;
END $$;