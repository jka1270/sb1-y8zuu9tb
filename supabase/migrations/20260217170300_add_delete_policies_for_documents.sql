/*
  # Add DELETE Policies for Document Tables

  1. Changes
    - Add DELETE policy for `testing_reports` table to allow admins to delete reports
    - Add DELETE policy for `technical_data_sheets` table to allow admins to delete TDS documents
    - Add DELETE policy for `safety_data_sheets` table to allow admins to delete SDS documents
  
  2. Security
    - Only users with admin or super_admin role can delete documents
    - Ensures proper authorization before deletion
*/

-- Add DELETE policy for testing_reports
CREATE POLICY "Admins can delete reports"
  ON testing_reports FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Add DELETE policy for technical_data_sheets
CREATE POLICY "Admins can delete technical data sheets"
  ON technical_data_sheets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Add DELETE policy for safety_data_sheets
CREATE POLICY "Admins can delete safety data sheets"
  ON safety_data_sheets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );