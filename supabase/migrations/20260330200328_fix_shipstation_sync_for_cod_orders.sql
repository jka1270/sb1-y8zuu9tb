/*
  # Fix ShipStation Sync for COD Orders

  1. Changes
    - Update the mark_order_for_shipstation_sync function to sync COD orders
    - COD orders (payment_method = 'cod') should be synced to ShipStation even with pending payment status
    - Orders will be synced if:
      * Payment status is 'paid' (existing behavior for card payments)
      * OR payment method is 'cod' and status is 'pending' or 'processing' (new behavior for COD)
    
  2. Rationale
    - COD orders need to be shipped before payment is collected
    - ShipStation needs order details to process and ship COD orders
    - Payment collection happens at delivery time for COD orders
*/

-- Update the function to handle COD orders
CREATE OR REPLACE FUNCTION mark_order_for_shipstation_sync()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark for sync if:
  -- 1. Order is paid (card payment), OR
  -- 2. Order is COD with pending/processing status
  -- AND order hasn't been synced yet
  IF NEW.shipstation_order_id IS NULL AND (
    NEW.payment_status = 'paid' OR 
    (NEW.payment_method = 'cod' AND NEW.payment_status IN ('pending', 'processing'))
  ) THEN
    NEW.shipstation_status := 'pending_sync';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- The trigger already exists, no need to recreate it
-- It will automatically use the updated function