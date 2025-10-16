/*
  # Create my_table

  1. New Tables
    - `my_table`
      - `id` (uuid, primary key, auto-generated)
      - `refs` (text array, default empty array, not null)

  2. Security
    - Enable RLS on `my_table` table
    - Add policy for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS public.my_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  refs text[] DEFAULT '{}'::text[] NOT NULL
);

ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own data"
  ON public.my_table
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);