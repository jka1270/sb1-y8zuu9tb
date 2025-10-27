/*
  # Fix User Creation Database Error

  1. Database Functions
    - Create `handle_new_user` function to automatically create user profiles
    - Create `create_default_user_preferences` function for user preferences
    - Add trigger to automatically create profiles on auth.users insert

  2. Security
    - Ensure proper RLS policies are in place
    - Handle edge cases for profile creation
*/

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into user_profiles
  INSERT INTO public.user_profiles (
    id,
    first_name,
    last_name,
    company,
    phone,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create default user preferences
CREATE OR REPLACE FUNCTION create_default_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default preferences for new user
  INSERT INTO public.user_preferences (
    id,
    email_notifications,
    order_updates,
    stock_alerts,
    newsletter,
    research_updates,
    price_alerts,
    preferred_currency,
    preferred_units,
    default_shipping_method,
    auto_save_cart,
    privacy_level,
    data_retention_period,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    true,
    true,
    false,
    false,
    true,
    false,
    'USD',
    'metric',
    'standard',
    true,
    'standard',
    365,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure the user_preferences trigger exists
DROP TRIGGER IF EXISTS create_user_preferences_trigger ON public.user_profiles;

CREATE TRIGGER create_user_preferences_trigger
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION create_default_user_preferences();

-- Update RLS policies to ensure proper access
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Ensure user_preferences policies exist
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;

CREATE POLICY "Users can manage own preferences"
  ON public.user_preferences
  FOR ALL
  TO authenticated
  USING (id = auth.uid());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;