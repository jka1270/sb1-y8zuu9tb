/*
  # Add purity and molecular_weight columns to products table

  1. Changes
    - Add `purity` column (text) with default value '≥99% HPLC'
    - Add `molecular_weight` column (text) for storing molecular weight as formatted string
  
  2. Notes
    - Using text type for flexibility in displaying formatted values like "1234.5 Da"
    - Default purity set to common research-grade specification
*/

DO $$ 
BEGIN
  -- Add purity column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'purity'
  ) THEN
    ALTER TABLE products ADD COLUMN purity text DEFAULT '≥99% HPLC';
  END IF;

  -- Add molecular_weight column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'molecular_weight'
  ) THEN
    ALTER TABLE products ADD COLUMN molecular_weight text DEFAULT '0';
  END IF;
END $$;