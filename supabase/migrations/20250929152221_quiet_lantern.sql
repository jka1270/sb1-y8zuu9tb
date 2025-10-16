/*
  # Create product reviews table

  1. New Tables
    - `product_reviews`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `product_id` (text)
      - `product_name` (text)
      - `rating` (integer, 1-5)
      - `title` (text)
      - `review_text` (text)
      - `verified_purchase` (boolean)
      - `helpful_count` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for review management
*/

-- Create product_reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL,
  review_text text NOT NULL,
  verified_purchase boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read reviews"
  ON product_reviews
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews"
  ON product_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON product_reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON product_reviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to check if purchase is verified
CREATE OR REPLACE FUNCTION check_verified_purchase()
RETURNS trigger AS $$
BEGIN
  -- Check if user has purchased this product
  IF EXISTS (
    SELECT 1 FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = NEW.user_id 
    AND oi.product_id = NEW.product_id
    AND o.payment_status = 'paid'
  ) THEN
    NEW.verified_purchase = true;
  ELSE
    NEW.verified_purchase = false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS check_verified_purchase_trigger ON product_reviews;
CREATE TRIGGER check_verified_purchase_trigger
  BEFORE INSERT OR UPDATE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION check_verified_purchase();