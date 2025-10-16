/*
  # Fix User Profile RLS Policy

  1. Policy Updates
    - Drop existing policy that uses incorrect function name
    - Create new policy using correct `auth.uid()` function
    - Ensure users can read their own profile data

  2. Security
    - Maintain Row Level Security on user_profiles table
    - Use standard Supabase auth function for user identification
*/

DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;

CREATE POLICY "Users can read own profile"
    ON user_profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Also fix other policies to use correct function
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Users can insert own profile"
    ON user_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
    ON user_profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());