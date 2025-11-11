/*
  # Setup to make affan@uok.edu an admin when they sign up
  
  1. Changes
    - Create a function that automatically makes affan@uok.edu an admin on signup
    - Update the handle_new_user trigger to call this function
*/

-- Function to check and set admin for specific email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert user profile
  INSERT INTO public.user_profiles (id, first_name, last_name, company, phone, role, is_admin)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(new.raw_user_meta_data->>'last_name', 'User'),
    COALESCE(new.raw_user_meta_data->>'company', ''),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    CASE 
      WHEN new.email = 'affan@uok.edu' THEN 'super_admin'
      ELSE 'customer'
    END,
    CASE 
      WHEN new.email = 'affan@uok.edu' THEN true
      ELSE false
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;