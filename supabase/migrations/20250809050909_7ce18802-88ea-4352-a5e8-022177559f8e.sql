-- Backfill profiles for existing users without a profile
INSERT INTO public.profiles (user_id, email, name, role, country, created_at, updated_at)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data ->> 'name', u.raw_user_meta_data ->> 'full_name', ''),
  CASE 
    WHEN u.email = 'adigb@gmail.com' THEN 'admin'::user_role
    ELSE COALESCE((u.raw_user_meta_data ->> 'role')::user_role, 'patient'::user_role)
  END,
  COALESCE(u.raw_user_meta_data ->> 'country', NULL),
  now(),
  now()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
);

-- Ensure trigger exists to insert profiles for new signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- Make get_user_role robust: fall back to admin-by-email when no profile exists
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid DEFAULT auth.uid())
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE user_id = user_uuid),
    (SELECT CASE WHEN u.email = 'adigb@gmail.com' THEN 'admin'::user_role ELSE 'patient'::user_role END
     FROM auth.users u WHERE u.id = user_uuid)
  )::user_role;
$function$;