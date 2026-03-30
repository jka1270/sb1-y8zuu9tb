/*
  # Allow Public Access to Payment Settings

  1. Changes
    - Update the SELECT policy on payment_settings to allow unauthenticated users
    - Guests need to see if COD is enabled during checkout
    - Only SELECT is allowed for unauthenticated users
    - UPDATE and INSERT still require admin authentication

  2. Security
    - Payment settings are not sensitive information (just a boolean flag)
    - Only controls which payment options are displayed to users
    - No security risk in allowing public read access
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Anyone can read payment settings" ON payment_settings;

-- Create new policy that allows both authenticated and unauthenticated users
CREATE POLICY "Anyone can read payment settings"
  ON payment_settings
  FOR SELECT
  USING (true);