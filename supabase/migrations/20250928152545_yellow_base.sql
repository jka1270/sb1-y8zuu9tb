/*
  # Create research applications tracking

  1. New Tables
    - `research_applications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `institution_name` (text)
      - `research_area` (text)
      - `project_title` (text)
      - `project_description` (text)
      - `principal_investigator` (text)
      - `ethics_approval` (boolean)
      - `ethics_approval_number` (text)
      - `intended_use` (text)
      - `safety_protocols` (text)
      - `status` (text)
      - `submitted_at` (timestamp)
      - `reviewed_at` (timestamp)
      - `approved_at` (timestamp)

  2. Security
    - Enable RLS on `research_applications` table
    - Add policies for users to manage their applications
*/

CREATE TABLE IF NOT EXISTS research_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  institution_name text NOT NULL,
  research_area text NOT NULL,
  project_title text NOT NULL,
  project_description text NOT NULL,
  principal_investigator text NOT NULL,
  ethics_approval boolean DEFAULT false,
  ethics_approval_number text,
  intended_use text NOT NULL,
  safety_protocols text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'requires_info')),
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  approved_at timestamptz,
  reviewer_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE research_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own applications"
  ON research_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications"
  ON research_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending applications"
  ON research_applications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

-- Function to update timestamps on status changes
CREATE OR REPLACE FUNCTION update_application_timestamps()
RETURNS trigger AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    NEW.updated_at := now();
    
    IF NEW.status = 'under_review' AND OLD.status = 'pending' THEN
      NEW.reviewed_at := now();
    END IF;
    
    IF NEW.status = 'approved' THEN
      NEW.approved_at := now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamps
CREATE OR REPLACE TRIGGER update_application_timestamps_trigger
  BEFORE UPDATE ON research_applications
  FOR EACH ROW EXECUTE FUNCTION update_application_timestamps();