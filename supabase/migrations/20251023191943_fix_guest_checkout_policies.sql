/*
  # Fix Guest Checkout RLS Policies

  1. Changes
    - Update RLS policies to properly handle both authenticated and guest users
    - Ensure authenticated users can create orders with their user_id
    - Ensure anonymous users can create orders with null user_id
    - Simplify order_items policies

  2. Security
    - Authenticated users can only create orders for themselves
    - Anonymous users can only create guest orders (null user_id)
    - Both can create order items for their orders
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Anonymous users can create guest orders" ON orders;
DROP POLICY IF EXISTS "Users can create order items for own orders" ON order_items;
DROP POLICY IF EXISTS "Anonymous users can create order items" ON order_items;

-- Recreate policies for orders
CREATE POLICY "Authenticated users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can create guest orders"
  ON orders
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Recreate policies for order_items (simplified)
CREATE POLICY "Authenticated users can create order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

CREATE POLICY "Anonymous users can create order items"
  ON order_items
  FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id IS NULL
    )
  );
