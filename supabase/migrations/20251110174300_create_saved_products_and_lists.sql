/*
  # Create Saved Products and Product Lists Tables

  1. New Tables
    - `saved_products`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `product_id` (text, product identifier)
      - `product_name` (text, for reference)
      - `variant_id` (text, optional variant)
      - `research_notes` (text, optional)
      - `tags` (text[], for categorization)
      - `priority` (text, default 'medium')
      - `planned_use` (text, optional)
      - `quantity_needed` (integer, optional)
      - `budget_allocated` (numeric, optional)
      - `project_association` (text, optional)
      - `saved_at` (timestamptz, creation time)
      - `last_viewed` (timestamptz, last accessed)

    - `product_lists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, list name)
      - `description` (text, optional)
      - `list_type` (text, default 'custom')
      - `project_name` (text, optional)
      - `project_code` (text, optional)
      - `budget_limit` (numeric, optional)
      - `is_shared` (boolean, default false)
      - `share_token` (text, optional unique token)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `product_list_items`
      - `id` (uuid, primary key)
      - `list_id` (uuid, foreign key to product_lists)
      - `product_id` (text, product identifier)
      - `product_name` (text, for reference)
      - `variant_id` (text, optional)
      - `quantity` (integer, default 1)
      - `notes` (text, optional)
      - `priority` (integer, default 0)
      - `added_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own saved products and lists
    - Shared lists can be accessed via share token
*/

-- Create saved_products table
CREATE TABLE IF NOT EXISTS saved_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_name text NOT NULL,
  variant_id text,
  research_notes text,
  tags text[] DEFAULT '{}',
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  planned_use text,
  quantity_needed integer,
  budget_allocated numeric,
  project_association text,
  saved_at timestamptz DEFAULT now(),
  last_viewed timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id, variant_id)
);

-- Create product_lists table
CREATE TABLE IF NOT EXISTS product_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  list_type text DEFAULT 'custom',
  project_name text,
  project_code text,
  budget_limit numeric,
  is_shared boolean DEFAULT false,
  share_token text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_list_items table
CREATE TABLE IF NOT EXISTS product_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES product_lists(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_name text NOT NULL,
  variant_id text,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  notes text,
  priority integer DEFAULT 0,
  added_at timestamptz DEFAULT now(),
  UNIQUE(list_id, product_id, variant_id)
);

-- Enable RLS
ALTER TABLE saved_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_list_items ENABLE ROW LEVEL SECURITY;

-- Policies for saved_products
CREATE POLICY "Users can view own saved products"
  ON saved_products FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved products"
  ON saved_products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved products"
  ON saved_products FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved products"
  ON saved_products FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for product_lists
CREATE POLICY "Users can view own product lists"
  ON product_lists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own product lists"
  ON product_lists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own product lists"
  ON product_lists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own product lists"
  ON product_lists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for product_list_items
CREATE POLICY "Users can view items in own lists"
  ON product_list_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM product_lists
      WHERE product_lists.id = product_list_items.list_id
      AND product_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items in own lists"
  ON product_list_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM product_lists
      WHERE product_lists.id = product_list_items.list_id
      AND product_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in own lists"
  ON product_list_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM product_lists
      WHERE product_lists.id = product_list_items.list_id
      AND product_lists.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM product_lists
      WHERE product_lists.id = product_list_items.list_id
      AND product_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from own lists"
  ON product_list_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM product_lists
      WHERE product_lists.id = product_list_items.list_id
      AND product_lists.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_products_user_id ON saved_products(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_products_product_id ON saved_products(product_id);
CREATE INDEX IF NOT EXISTS idx_product_lists_user_id ON product_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_product_list_items_list_id ON product_list_items(list_id);