-- Fix the function search path security issue
DROP FUNCTION IF EXISTS public.ensure_admin_user() CASCADE;

CREATE OR REPLACE FUNCTION public.ensure_admin_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if this is the admin email
  IF NEW.email = 'adigb@gmail.com' THEN
    -- Update the profile to admin role
    UPDATE public.profiles 
    SET role = 'admin'::user_role 
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS ensure_admin_role ON auth.users;
CREATE TRIGGER ensure_admin_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_admin_user();