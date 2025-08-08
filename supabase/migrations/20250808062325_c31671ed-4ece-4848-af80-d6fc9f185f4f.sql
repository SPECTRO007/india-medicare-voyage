-- Clear existing data for fresh start
DELETE FROM public.profiles;
DELETE FROM public.bookings;
DELETE FROM public.consultations;
DELETE FROM public.analytics;

-- Create admin user profile directly (this will be referenced when the auth user signs up)
INSERT INTO public.profiles (
  user_id, 
  name, 
  email, 
  role, 
  country, 
  created_at, 
  updated_at
) VALUES (
  gen_random_uuid(), -- This will be replaced when the actual auth user is created
  'Admin User',
  'adigb@gmail.com',
  'admin',
  'United States',
  now(),
  now()
);

-- Create or replace function to handle admin user creation
CREATE OR REPLACE FUNCTION public.handle_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the admin email
  IF NEW.email = 'adigb@gmail.com' THEN
    -- Update or insert admin profile
    INSERT INTO public.profiles (user_id, name, email, role, country, created_at, updated_at)
    VALUES (NEW.id, 'Admin User', NEW.email, 'admin', 'United States', now(), now())
    ON CONFLICT (user_id) DO UPDATE SET
      role = 'admin',
      name = 'Admin User',
      updated_at = now();
  ELSE
    -- Handle regular users
    INSERT INTO public.profiles (user_id, name, email, role, country, created_at, updated_at)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'name', NEW.email, 'patient', NEW.raw_user_meta_data ->> 'country', now(), now())
    ON CONFLICT (user_id) DO UPDATE SET
      name = COALESCE(NEW.raw_user_meta_data ->> 'name', profiles.name),
      country = COALESCE(NEW.raw_user_meta_data ->> 'country', profiles.country),
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;