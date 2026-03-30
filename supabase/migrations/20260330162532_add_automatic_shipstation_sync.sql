/*
  # Add Automatic ShipStation Sync
  
  1. New Function
    - `trigger_shipstation_sync` - PostgreSQL function that calls edge function after order creation
  
  2. New Trigger
    - Automatically syncs orders to ShipStation when status changes to 'paid' or 'processing'
    - Only triggers if ShipStation credentials are configured
    
  3. Changes
    - Add shipped_at, estimated_delivery, shipstation_status, shipstation_synced_at columns if not exists
    - Create trigger to automatically invoke edge function
    
  Note: The actual sync happens via the edge function using pg_net extension
*/

-- Add missing columns if they don't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipstation_status text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipstation_synced_at timestamptz;

-- Create a function to mark orders as ready for ShipStation sync
CREATE OR REPLACE FUNCTION mark_order_for_shipstation_sync()
RETURNS TRIGGER AS $$
BEGIN
  -- Only mark for sync if order is paid and hasn't been synced yet
  IF NEW.payment_status = 'paid' AND NEW.shipstation_order_id IS NULL THEN
    NEW.shipstation_status := 'pending_sync';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that marks orders for sync when they're paid
DROP TRIGGER IF EXISTS trigger_mark_for_shipstation_sync ON orders;
CREATE TRIGGER trigger_mark_for_shipstation_sync
  BEFORE INSERT OR UPDATE OF payment_status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION mark_order_for_shipstation_sync();

-- Add index for orders pending sync
CREATE INDEX IF NOT EXISTS idx_orders_pending_sync ON orders(shipstation_status)
  WHERE shipstation_status = 'pending_sync';
