-- Clear existing data for fresh start
DELETE FROM public.profiles;
DELETE FROM public.bookings;
DELETE FROM public.consultations;
DELETE FROM public.analytics;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create improved trigger for admin user handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the admin email
  IF NEW.email = 'adigb@gmail.com' THEN
    -- Insert admin profile
    INSERT INTO public.profiles (user_id, name, email, role, country, created_at, updated_at)
    VALUES (NEW.id, 'Admin User', NEW.email, 'admin', 'United States', now(), now());
  ELSE
    -- Handle regular users
    INSERT INTO public.profiles (user_id, name, email, role, country, created_at, updated_at)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name', ''), 
      NEW.email, 
      COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'patient'), 
      NEW.raw_user_meta_data ->> 'country', 
      now(), 
      now()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();