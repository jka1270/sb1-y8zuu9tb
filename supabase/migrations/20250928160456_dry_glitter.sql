/*
  # Inventory Management System

  1. New Tables
    - `inventory`
      - `id` (uuid, primary key)
      - `product_id` (text, product identifier)
      - `variant_id` (text, variant identifier)
      - `sku` (text, unique stock keeping unit)
      - `current_stock` (integer, current quantity)
      - `reserved_stock` (integer, reserved for pending orders)
      - `available_stock` (integer, computed available quantity)
      - `reorder_point` (integer, minimum stock level)
      - `max_stock` (integer, maximum stock level)
      - `cost_per_unit` (numeric, cost price)
      - `supplier_id` (text, supplier identifier)
      - `batch_number` (text, manufacturing batch)
      - `expiry_date` (date, product expiry)
      - `location` (text, storage location)
      - `temperature_zone` (text, storage temperature requirements)
      - `last_restocked` (timestamptz, last restock date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `inventory_transactions`
      - `id` (uuid, primary key)
      - `inventory_id` (uuid, foreign key)
      - `transaction_type` (text, type of transaction)
      - `quantity_change` (integer, quantity changed)
      - `reference_id` (text, order/adjustment reference)
      - `reason` (text, reason for transaction)
      - `performed_by` (uuid, user who performed transaction)
      - `notes` (text, additional notes)
      - `created_at` (timestamptz)

    - `low_stock_alerts`
      - `id` (uuid, primary key)
      - `inventory_id` (uuid, foreign key)
      - `alert_type` (text, type of alert)
      - `threshold_value` (integer, threshold that triggered alert)
      - `current_stock` (integer, stock level when alert triggered)
      - `status` (text, alert status)
      - `acknowledged_by` (uuid, user who acknowledged)
      - `acknowledged_at` (timestamptz)
      - `resolved_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Functions
    - `update_available_stock()` - Calculate available stock
    - `check_low_stock_alerts()` - Check and create alerts
    - `process_inventory_transaction()` - Handle stock changes

  3. Security
    - Enable RLS on all tables
    - Admin-only access for inventory management
    - Read-only access for stock levels
*/

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  variant_id text,
  sku text UNIQUE NOT NULL,
  current_stock integer NOT NULL DEFAULT 0,
  reserved_stock integer NOT NULL DEFAULT 0,
  available_stock integer GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
  reorder_point integer NOT NULL DEFAULT 10,
  max_stock integer NOT NULL DEFAULT 1000,
  cost_per_unit numeric(10,2) NOT NULL DEFAULT 0,
  supplier_id text,
  batch_number text,
  expiry_date date,
  location text DEFAULT 'Main Warehouse',
  temperature_zone text DEFAULT '-20°C',
  last_restocked timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT inventory_stock_check CHECK (current_stock >= 0),
  CONSTRAINT inventory_reserved_check CHECK (reserved_stock >= 0),
  CONSTRAINT inventory_reorder_check CHECK (reorder_point >= 0),
  CONSTRAINT inventory_max_stock_check CHECK (max_stock > reorder_point)
);

-- Create inventory transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id uuid REFERENCES inventory(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('restock', 'sale', 'adjustment', 'reservation', 'return', 'expired', 'damaged')),
  quantity_change integer NOT NULL,
  reference_id text,
  reason text,
  performed_by uuid,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create low stock alerts table
CREATE TABLE IF NOT EXISTS low_stock_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id uuid REFERENCES inventory(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'expiring_soon', 'expired')),
  threshold_value integer,
  current_stock integer NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  acknowledged_by uuid,
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_available_stock ON inventory(available_stock);
CREATE INDEX IF NOT EXISTS idx_inventory_reorder_point ON inventory(current_stock, reorder_point);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_inventory_id ON inventory_transactions(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_status ON low_stock_alerts(status);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_inventory_id ON low_stock_alerts(inventory_id);

-- Function to update inventory after transactions
CREATE OR REPLACE FUNCTION process_inventory_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Update current stock based on transaction type
  IF NEW.transaction_type IN ('restock', 'return') THEN
    UPDATE inventory 
    SET current_stock = current_stock + NEW.quantity_change,
        last_restocked = CASE WHEN NEW.transaction_type = 'restock' THEN now() ELSE last_restocked END,
        updated_at = now()
    WHERE id = NEW.inventory_id;
  ELSIF NEW.transaction_type IN ('sale', 'expired', 'damaged') THEN
    UPDATE inventory 
    SET current_stock = current_stock - ABS(NEW.quantity_change),
        updated_at = now()
    WHERE id = NEW.inventory_id;
  ELSIF NEW.transaction_type = 'reservation' THEN
    UPDATE inventory 
    SET reserved_stock = reserved_stock + ABS(NEW.quantity_change),
        updated_at = now()
    WHERE id = NEW.inventory_id;
  ELSIF NEW.transaction_type = 'adjustment' THEN
    UPDATE inventory 
    SET current_stock = current_stock + NEW.quantity_change,
        updated_at = now()
    WHERE id = NEW.inventory_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check and create low stock alerts
CREATE OR REPLACE FUNCTION check_low_stock_alerts()
RETURNS TRIGGER AS $$
DECLARE
  alert_exists boolean;
BEGIN
  -- Check for low stock alert
  IF NEW.current_stock <= NEW.reorder_point AND NEW.current_stock > 0 THEN
    SELECT EXISTS(
      SELECT 1 FROM low_stock_alerts 
      WHERE inventory_id = NEW.id 
      AND alert_type = 'low_stock' 
      AND status = 'active'
    ) INTO alert_exists;
    
    IF NOT alert_exists THEN
      INSERT INTO low_stock_alerts (inventory_id, alert_type, threshold_value, current_stock)
      VALUES (NEW.id, 'low_stock', NEW.reorder_point, NEW.current_stock);
    END IF;
  END IF;
  
  -- Check for out of stock alert
  IF NEW.current_stock = 0 THEN
    SELECT EXISTS(
      SELECT 1 FROM low_stock_alerts 
      WHERE inventory_id = NEW.id 
      AND alert_type = 'out_of_stock' 
      AND status = 'active'
    ) INTO alert_exists;
    
    IF NOT alert_exists THEN
      INSERT INTO low_stock_alerts (inventory_id, alert_type, threshold_value, current_stock)
      VALUES (NEW.id, 'out_of_stock', 0, NEW.current_stock);
    END IF;
  END IF;
  
  -- Check for expiring products (within 30 days)
  IF NEW.expiry_date IS NOT NULL AND NEW.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN
    SELECT EXISTS(
      SELECT 1 FROM low_stock_alerts 
      WHERE inventory_id = NEW.id 
      AND alert_type = 'expiring_soon' 
      AND status = 'active'
    ) INTO alert_exists;
    
    IF NOT alert_exists THEN
      INSERT INTO low_stock_alerts (inventory_id, alert_type, current_stock)
      VALUES (NEW.id, 'expiring_soon', NEW.current_stock);
    END IF;
  END IF;
  
  -- Resolve alerts if stock is replenished
  IF NEW.current_stock > NEW.reorder_point THEN
    UPDATE low_stock_alerts 
    SET status = 'resolved', resolved_at = now()
    WHERE inventory_id = NEW.id 
    AND alert_type IN ('low_stock', 'out_of_stock') 
    AND status = 'active';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER inventory_transaction_trigger
  AFTER INSERT ON inventory_transactions
  FOR EACH ROW
  EXECUTE FUNCTION process_inventory_transaction();

CREATE TRIGGER inventory_alert_trigger
  AFTER UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION check_low_stock_alerts();

-- Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE low_stock_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inventory (admin access only for modifications, read access for stock levels)
CREATE POLICY "Public can read inventory stock levels"
  ON inventory
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can read inventory transactions"
  ON inventory_transactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read alerts"
  ON low_stock_alerts
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample inventory data
INSERT INTO inventory (product_id, variant_id, sku, current_stock, reorder_point, max_stock, cost_per_unit, batch_number, expiry_date, location, temperature_zone) VALUES
('1', 'bpc-5mg', 'BPC-157-5MG', 45, 20, 200, 18.99, 'BPC240115', '2026-01-15', 'Cold Storage A', '-20°C'),
('1', 'bpc-10mg', 'BPC-157-10MG', 32, 15, 150, 28.99, 'BPC240115', '2026-01-15', 'Cold Storage A', '-20°C'),
('8', 'cjc-10mg', 'CJC-10MG', 28, 10, 100, 65.99, 'CJC240120', '2025-12-20', 'Cold Storage B', '-20°C'),
('11', 'cjc-dac-5mg', 'CJC-DAC-5MG', 15, 20, 80, 42.99, 'CJCDAC240118', '2025-11-18', 'Cold Storage B', '-20°C'),
('11', 'cjc-dac-10mg', 'CJC-DAC-10MG', 8, 15, 60, 98.99, 'CJCDAC240118', '2025-11-18', 'Cold Storage B', '-20°C'),
('12', 'cjc-ipa-10mg', 'CJC-IPA-10MG', 22, 12, 75, 56.99, 'COMBO240122', '2025-10-22', 'Cold Storage C', '-20°C'),
('6', 'ghk-50mg', 'GHK-CU-50MG', 67, 25, 300, 32.99, 'GHK240110', '2026-06-10', 'Standard Storage', '2-8°C'),
('6', 'ghk-75mg', 'GHK-CU-75MG', 41, 20, 200, 42.99, 'GHK240110', '2026-06-10', 'Standard Storage', '2-8°C'),
('6', 'ghk-100mg', 'GHK-CU-100MG', 29, 15, 150, 54.99, 'GHK240110', '2026-06-10', 'Standard Storage', '2-8°C'),
('5', 'ipa-5mg', 'IPA-5MG', 38, 18, 120, 45.99, 'IPA240125', '2025-12-25', 'Cold Storage A', '-20°C'),
('5', 'ipa-10mg', 'IPA-10MG', 24, 12, 80, 58.99, 'IPA240125', '2025-12-25', 'Cold Storage A', '-20°C'),
('4', 'mt2-10mg', 'MT2-10MG', 52, 20, 180, 29.99, 'MT2240105', '2026-03-05', 'Cold Storage C', '-20°C'),
('7', 'pe22-10mg', 'PE22-10MG', 19, 15, 60, 58.99, 'PE22240130', '2025-09-30', 'Cold Storage B', '-20°C'),
('8', 'pt141-5mg', 'PT141-5MG', 33, 16, 100, 43.99, 'PT141240112', '2025-11-12', 'Cold Storage C', '-20°C'),
('8', 'pt141-10mg', 'PT141-10MG', 21, 12, 75, 49.99, 'PT141240112', '2025-11-12', 'Cold Storage C', '-20°C'),
('9', 'ret-24mg', 'RET-24MG', 12, 8, 40, 189.99, 'RET240201', '2025-08-01', 'Ultra Cold Storage', '-80°C'),
('9', 'ret-60mg', 'RET-60MG', 6, 5, 25, 449.99, 'RET240201', '2025-08-01', 'Ultra Cold Storage', '-80°C'),
('10', 'sel-5mg', 'SEL-5MG', 44, 20, 150, 38.99, 'SEL240115', '2026-02-15', 'Cold Storage A', '-20°C'),
('10', 'sel-10mg', 'SEL-10MG', 31, 15, 100, 42.99, 'SEL240115', '2026-02-15', 'Cold Storage A', '-20°C'),
('11', 'sema-5mg', 'SEMA-5MG', 26, 12, 80, 68.99, 'SEMA240208', '2025-07-08', 'Cold Storage B', '-20°C'),
('11', 'sema-30mg', 'SEMA-30MG', 9, 8, 30, 229.99, 'SEMA240208', '2025-07-08', 'Cold Storage B', '-20°C'),
('12', 'semax-30mg', 'SEMAX-30MG', 18, 10, 60, 98.99, 'SEMAX240220', '2025-06-20', 'Cold Storage C', '-20°C'),
('13', 'ser-5mg', 'SER-5MG', 35, 15, 100, 105.99, 'SER240125', '2025-12-25', 'Cold Storage A', '-20°C'),
('13', 'ser-10mg', 'SER-10MG', 22, 12, 75, 128.99, 'SER240125', '2025-12-25', 'Cold Storage A', '-20°C'),
('14', 'ss31-10mg', 'SS31-10MG', 41, 18, 120, 38.99, 'SS31240118', '2026-01-18', 'Cold Storage B', '-20°C'),
('14', 'ss31-50mg', 'SS31-50MG', 16, 10, 50, 119.99, 'SS31240118', '2026-01-18', 'Cold Storage B', '-20°C'),
('15', 'sur-10mg', 'SUR-10MG', 14, 8, 40, 105.99, 'SUR240210', '2025-05-10', 'Ultra Cold Storage', '-80°C'),
('16', 'tb500-5mg', 'TB500-5MG', 58, 25, 200, 19.99, 'TB500240101', '2026-04-01', 'Cold Storage A', '-20°C'),
('17', 'test-20mg', 'TEST-20MG', 37, 20, 120, 38.99, 'TEST240205', '2026-05-05', 'Cold Storage C', '-20°C'),
('18', 'tes-10mg', 'TES-10MG', 23, 12, 75, 95.99, 'TES240215', '2025-08-15', 'Cold Storage B', '-20°C'),
('19', 'ta1-5mg', 'TA1-5MG', 39, 18, 100, 42.99, 'TA1240128', '2026-01-28', 'Cold Storage A', '-20°C'),
('19', 'ta1-10mg', 'TA1-10MG', 25, 12, 75, 83.99, 'TA1240128', '2026-01-28', 'Cold Storage A', '-20°C'),
('20', 'tb4-10mg', 'TB4-10MG', 34, 15, 100, 58.99, 'TB4240202', '2025-11-02', 'Cold Storage C', '-20°C'),
('21', 'tir-10mg', 'TIR-10MG', 17, 10, 50, 113.99, 'TIR240225', '2025-04-25', 'Ultra Cold Storage', '-80°C'),
('21', 'tir-30mg', 'TIR-30MG', 7, 6, 25, 299.99, 'TIR240225', '2025-04-25', 'Ultra Cold Storage', '-80°C');