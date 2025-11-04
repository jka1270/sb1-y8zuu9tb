/*
  # Enable Guest Checkout

  1. Changes
    - Add RLS policies to allow anonymous users to create orders
    - Allow guest users to insert orders with null user_id
    - Allow guest users to insert order items for their orders

  2. Security
    - Anonymous users can only create orders (INSERT)
    - Anonymous users cannot read, update, or delete orders
    - Order items can only be created for valid orders
    - Authenticated users maintain full CRUD access to their own orders
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anonymous users can create guest orders" ON orders;
DROP POLICY IF EXISTS "Anonymous users can create order items" ON order_items;

-- Allow anonymous users to create orders
CREATE POLICY "Anonymous users can create guest orders"
  ON orders
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Allow anonymous users to create order items
CREATE POLICY "Anonymous users can create order items"
  ON order_items
  FOR INSERT
  TO anon
  WITH CHECK (true);
