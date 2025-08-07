-- Update the existing user's metadata to have admin role
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"admin"')
WHERE email = 'adigb@gmail.com';

-- Create the missing profile record
INSERT INTO public.profiles (user_id, name, email, role, country, phone, country_code)
SELECT 
  id,
  raw_user_meta_data->>'name',
  email,
  'admin'::public.user_role,
  raw_user_meta_data->>'country',
  raw_user_meta_data->>'phone',
  raw_user_meta_data->>'country_code'
FROM auth.users 
WHERE email = 'adigb@gmail.com';