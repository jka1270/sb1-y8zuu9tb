/*
  # Enable RLS and anonymous access for inventory table

  1. Security Changes
    - Enable Row Level Security on inventory table
    - Add policy for anonymous users to read inventory data

  This allows public access to inventory stock levels while maintaining security.
*/

-- Enable Row Level Security on inventory table
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous users to read inventory data
CREATE POLICY "anon can read inventory"
  ON public.inventory 
  FOR SELECT 
  TO anon 
  USING (true);