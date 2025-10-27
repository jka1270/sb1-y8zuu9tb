/*
  # Rename references column to refs

  1. Changes
    - Rename column "references" to "refs" in my_table
    - Safe operation using IF EXISTS check
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'my_table' 
    AND column_name = 'references'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.my_table RENAME COLUMN "references" TO refs;
  END IF;
END $$;