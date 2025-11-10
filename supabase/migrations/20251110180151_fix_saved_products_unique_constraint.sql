/*
  # Fix Saved Products Unique Constraint

  1. Changes
    - Drop the existing UNIQUE constraint that doesn't handle NULL properly
    - Create two separate partial unique indexes:
      - One for rows WITH variant_id
      - One for rows WITHOUT variant_id (NULL)
    - This ensures proper duplicate prevention for both cases

  2. Why
    - PostgreSQL's UNIQUE constraint considers NULL as distinct values
    - This allowed multiple rows with the same (user_id, product_id, NULL)
    - Partial indexes solve this by treating NULL cases separately
*/

-- Drop the existing constraint
ALTER TABLE saved_products DROP CONSTRAINT IF EXISTS saved_products_user_id_product_id_variant_id_key;

-- Create partial unique index for rows WITH variant_id
CREATE UNIQUE INDEX IF NOT EXISTS saved_products_with_variant_unique 
ON saved_products (user_id, product_id, variant_id)
WHERE variant_id IS NOT NULL;

-- Create partial unique index for rows WITHOUT variant_id (NULL)
CREATE UNIQUE INDEX IF NOT EXISTS saved_products_without_variant_unique 
ON saved_products (user_id, product_id)
WHERE variant_id IS NULL;