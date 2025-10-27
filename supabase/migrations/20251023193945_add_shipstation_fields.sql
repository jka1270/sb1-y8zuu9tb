/*
  # Add ShipStation Integration Fields

  1. New Columns
    - `shipstation_order_id` - ShipStation's order ID
    - `shipstation_order_key` - ShipStation's order key
    - `tracking_number` - Carrier tracking number
    - `carrier` - Shipping carrier name (FedEx, UPS, etc.)
    - `shipped_at` - Timestamp when order was shipped
    - `estimated_delivery` - Estimated delivery date
    - `shipstation_status` - ShipStation order status
    - `shipstation_synced_at` - Last sync timestamp

  2. Changes
    - Add nullable text and timestamp columns for ShipStation integration
    - These fields will be populated when orders are synced with ShipStation
*/

-- Add ShipStation integration fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipstation_order_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipstation_order_key text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipstation_status text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipstation_synced_at timestamptz;

-- Create index for faster tracking number lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_shipstation_order_id ON orders(shipstation_order_id);
