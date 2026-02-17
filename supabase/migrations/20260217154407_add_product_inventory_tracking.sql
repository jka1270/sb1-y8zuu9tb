/*
  # Add Inventory Tracking to Products

  1. Changes to Products Table
    - Add `quantity` column (integer) to track current stock levels
    - Add `low_stock_threshold` column (integer) to set alert thresholds
    - Set default values for existing products
  
  2. Notes
    - Quantity defaults to 0 for new products
    - Low stock threshold defaults to 10 units
    - Existing products will have quantity set to 100 as a starting point
    - Both fields are nullable to allow flexibility
*/

DO $$ 
BEGIN
  -- Add quantity column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'quantity'
  ) THEN
    ALTER TABLE products ADD COLUMN quantity integer DEFAULT 0;
    
    -- Set default quantity for existing products
    UPDATE products SET quantity = 100 WHERE quantity IS NULL OR quantity = 0;
  END IF;

  -- Add low_stock_threshold column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'low_stock_threshold'
  ) THEN
    ALTER TABLE products ADD COLUMN low_stock_threshold integer DEFAULT 10;
  END IF;
END $$;