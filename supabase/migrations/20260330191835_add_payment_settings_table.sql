/*
  # Add Payment Settings Table

  1. New Tables
    - `payment_settings`
      - `id` (uuid, primary key)
      - `cod_enabled` (boolean, default true) - Controls if COD is available as payment option
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `payment_settings` table
    - Add policy for authenticated users to read settings
    - Add policy for admin users to update settings

  3. Initial Data
    - Insert default payment settings with COD enabled
*/

-- Create payment_settings table
CREATE TABLE IF NOT EXISTS payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cod_enabled boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- Policy for all users to read payment settings
CREATE POLICY "Anyone can read payment settings"
  ON payment_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for admins to update payment settings
CREATE POLICY "Admins can update payment settings"
  ON payment_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy for admins to insert payment settings
CREATE POLICY "Admins can insert payment settings"
  ON payment_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Insert default settings if none exist
INSERT INTO payment_settings (cod_enabled)
SELECT true
WHERE NOT EXISTS (SELECT 1 FROM payment_settings);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS payment_settings_updated_at ON payment_settings;
CREATE TRIGGER payment_settings_updated_at
  BEFORE UPDATE ON payment_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_settings_updated_at();