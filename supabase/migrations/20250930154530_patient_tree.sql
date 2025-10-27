/*
  # Fix User Registration Database Error

  1. Database Functions
    - `handle_new_user()` - Creates user profile automatically on signup
    - `create_default_user_preferences()` - Creates default preferences for new users
  
  2. Triggers
    - Trigger on auth.users to create profile automatically
    - Trigger on user_profiles to create preferences
  
  3. Security
    - Updated RLS policies for proper access
    - Function permissions and security definer
  
  4. Error Handling
    - Proper null handling and defaults
    - Graceful error handling in functions
*/

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_default_user_preferences() CASCADE;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert user profile with data from auth metadata
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create function to create default user preferences
CREATE OR REPLACE FUNCTION public.create_default_user_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert default user preferences
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the profile creation
    RAISE WARNING 'Failed to create user preferences for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_user_preferences_trigger ON public.user_profiles;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for user preferences creation
CREATE TRIGGER create_user_preferences_trigger
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_user_preferences();

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
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Update user preferences RLS policies
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own preferences"
  ON public.user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own preferences"
  ON public.user_preferences
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;

-- Ensure the functions can be executed
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_default_user_preferences() TO authenticated;