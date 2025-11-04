/*
  # Create Contact Messages Table

  1. New Tables
    - `contact_messages`
      - `id` (uuid, primary key) - Unique message identifier
      - `first_name` (text) - Customer's first name
      - `last_name` (text) - Customer's last name
      - `email` (text) - Customer's email address
      - `company` (text) - Company/Institution name
      - `phone` (text, nullable) - Phone number
      - `inquiry_type` (text) - Type of inquiry (product, technical, custom, etc.)
      - `subject` (text) - Message subject
      - `message` (text) - Message content
      - `research_area` (text, nullable) - Research area if applicable
      - `urgency` (text) - Urgency level (low, normal, high, critical)
      - `status` (text) - Message status (new, read, replied, resolved)
      - `admin_notes` (text, nullable) - Internal admin notes
      - `created_at` (timestamptz) - When message was submitted
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `contact_messages` table
    - Add policy for public (unauthenticated) users to insert messages
    - Add policy for authenticated admin users to read all messages
    - Add policy for authenticated admin users to update message status and notes
*/

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL,
  phone text,
  inquiry_type text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  research_area text,
  urgency text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact messages"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admin users can view all contact messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admin users can update contact messages"
  ON contact_messages
  FOR UPDATE
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

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_urgency ON contact_messages(urgency);