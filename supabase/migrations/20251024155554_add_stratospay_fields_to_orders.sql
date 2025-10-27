/*
  # Add StratosPay Payment Fields

  1. Changes
    - Add `stratospay_transaction_id` column to store StratosPay transaction reference
    - Add `stratospay_reference` column to store external reference ID
    
  2. Notes
    - Fields are nullable as not all orders will use StratosPay
    - Existing orders won't be affected
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'stratospay_transaction_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN stratospay_transaction_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'stratospay_reference'
  ) THEN
    ALTER TABLE orders ADD COLUMN stratospay_reference text;
  END IF;
END $$;