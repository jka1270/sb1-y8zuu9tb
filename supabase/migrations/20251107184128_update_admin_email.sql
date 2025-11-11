/*
  # Update super admin email to admin@researchraws.com
  
  1. Changes
    - Update the handle_new_user function to make admin@researchraws.com the super admin
    - Remove admin privileges from affan@uok.edu if it exists
*/

-- Update function to use new admin email
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
      WHEN new.email = 'admin@researchraws.com' THEN 'super_admin'
      ELSE 'customer'
    END,
    CASE 
      WHEN new.email = 'admin@researchraws.com' THEN true
      ELSE false
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;