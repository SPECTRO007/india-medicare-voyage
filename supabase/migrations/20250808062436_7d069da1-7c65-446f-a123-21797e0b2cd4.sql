-- Fix the security issue with function search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
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
$$;