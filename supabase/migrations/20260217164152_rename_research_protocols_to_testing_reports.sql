/*
  # Rename Research Protocols to Testing Reports

  1. Changes
    - Rename `research_protocols` table to `testing_reports`
    - Rename `protocol_ratings` table to `report_ratings`
    - Update all foreign key constraints
    - Update all policies with new table names
    - Update all indexes with new names
    - Update column names for clarity (protocol_type -> report_type, etc.)
  
  2. Security
    - Maintain all existing RLS policies
    - Preserve admin and public access patterns
*/

-- Rename research_protocols table to testing_reports
ALTER TABLE IF EXISTS research_protocols RENAME TO testing_reports;

-- Rename protocol_ratings table to report_ratings
ALTER TABLE IF EXISTS protocol_ratings RENAME TO report_ratings;

-- Update foreign key constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'protocol_ratings_protocol_id_fkey'
  ) THEN
    ALTER TABLE report_ratings 
    DROP CONSTRAINT protocol_ratings_protocol_id_fkey;
    
    ALTER TABLE report_ratings 
    ADD CONSTRAINT report_ratings_report_id_fkey 
    FOREIGN KEY (protocol_id) REFERENCES testing_reports(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Rename column in report_ratings table for consistency
ALTER TABLE IF EXISTS report_ratings RENAME COLUMN protocol_id TO report_id;

-- Rename column in testing_reports table
ALTER TABLE IF EXISTS testing_reports RENAME COLUMN protocol_type TO report_type;

-- Drop old indexes
DROP INDEX IF EXISTS idx_protocols_product_id;
DROP INDEX IF EXISTS idx_protocols_approval_status;
DROP INDEX IF EXISTS idx_protocols_research_area;
DROP INDEX IF EXISTS idx_ratings_protocol_id;

-- Create new indexes
CREATE INDEX IF NOT EXISTS idx_testing_reports_product_id ON testing_reports(product_id);
CREATE INDEX IF NOT EXISTS idx_testing_reports_approval_status ON testing_reports(approval_status);
CREATE INDEX IF NOT EXISTS idx_testing_reports_research_area ON testing_reports(research_area);
CREATE INDEX IF NOT EXISTS idx_report_ratings_report_id ON report_ratings(report_id);
CREATE INDEX IF NOT EXISTS idx_report_ratings_user_id ON report_ratings(user_id);

-- Update policies for testing_reports
DROP POLICY IF EXISTS "Anyone can view approved protocols" ON testing_reports;
DROP POLICY IF EXISTS "Admins can view all protocols" ON testing_reports;
DROP POLICY IF EXISTS "Admins can insert protocols" ON testing_reports;
DROP POLICY IF EXISTS "Admins can update protocols" ON testing_reports;

CREATE POLICY "Anyone can view approved reports"
  ON testing_reports FOR SELECT
  TO public
  USING (approval_status = 'approved');

CREATE POLICY "Admins can view all reports"
  ON testing_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert reports"
  ON testing_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update reports"
  ON testing_reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Update policies for report_ratings
DROP POLICY IF EXISTS "Anyone can view protocol ratings" ON report_ratings;
DROP POLICY IF EXISTS "Authenticated users can rate protocols" ON report_ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON report_ratings;

CREATE POLICY "Anyone can view report ratings"
  ON report_ratings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can rate reports"
  ON report_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON report_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);