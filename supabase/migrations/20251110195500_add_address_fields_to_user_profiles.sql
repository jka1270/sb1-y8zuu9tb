/*
  # Add Address Fields to User Profiles

  1. Changes
    - Add address fields to `user_profiles` table:
      - `address_line1` (text) - Street address
      - `address_line2` (text) - Apartment, suite, etc.
      - `city` (text) - City name
      - `state` (text) - State/province
      - `postal_code` (text) - ZIP/postal code
      - `country` (text) - Country name

  2. Notes
    - All address fields are nullable to support gradual profile completion
    - Default value for country is 'United States' for convenience
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'address_line1'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN address_line1 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'address_line2'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN address_line2 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'city'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN city text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'state'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN state text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'postal_code'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN postal_code text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'country'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN country text DEFAULT 'United States';
  END IF;
END $$;
