/*
  # Create Research Profiles Table

  1. New Tables
    - `research_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `institution_type` (text) - University, research institute, etc.
      - `research_areas` (text[]) - Array of research focus areas
      - `position_title` (text) - Job title
      - `department` (text) - Department name
      - `supervisor_name` (text) - Supervisor/PI name
      - `supervisor_email` (text) - Supervisor email
      - `years_experience` (integer) - Years of research experience
      - `education_level` (text) - Highest degree
      - `specializations` (text[]) - Array of specializations
      - `publications_count` (integer) - Number of publications
      - `orcid_id` (text) - ORCID identifier
      - `research_interests` (text) - Research interests description
      - `current_projects` (text) - Current projects description
      - `funding_sources` (text[]) - Funding sources
      - `ethics_training_completed` (boolean) - Ethics training status
      - `ethics_training_date` (date) - Ethics training completion date
      - `safety_training_completed` (boolean) - Safety training status
      - `safety_training_date` (date) - Safety training completion date
      - `institutional_approval` (boolean) - Has institutional approval
      - `approval_document_url` (text) - URL to approval document
      - `verification_status` (text) - pending, verified, or rejected
      - `verified_at` (timestamptz) - Verification timestamp
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `research_profiles` table
    - Add policies for authenticated users to manage their own profiles
    - Add admin policies for verification
*/

CREATE TABLE IF NOT EXISTS research_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_type text NOT NULL,
  research_areas text[] DEFAULT '{}',
  position_title text NOT NULL,
  department text,
  supervisor_name text,
  supervisor_email text,
  years_experience integer DEFAULT 0,
  education_level text NOT NULL,
  specializations text[] DEFAULT '{}',
  publications_count integer DEFAULT 0,
  orcid_id text,
  research_interests text,
  current_projects text,
  funding_sources text[] DEFAULT '{}',
  ethics_training_completed boolean DEFAULT false,
  ethics_training_date date,
  safety_training_completed boolean DEFAULT false,
  safety_training_date date,
  institutional_approval boolean DEFAULT false,
  approval_document_url text,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE research_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own research profile"
  ON research_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own research profile"
  ON research_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own research profile"
  ON research_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all research profiles"
  ON research_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update all research profiles"
  ON research_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_research_profiles_verification_status 
  ON research_profiles(verification_status);

CREATE INDEX IF NOT EXISTS idx_research_profiles_institution_type 
  ON research_profiles(institution_type);
