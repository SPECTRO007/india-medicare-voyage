-- Fix security warning - set search_path for the distance calculation function
CREATE OR REPLACE FUNCTION calculate_distance(lat1 DECIMAL, lon1 DECIMAL, lat2 DECIMAL, lon2 DECIMAL)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  earth_radius DECIMAL := 6371; -- Earth's radius in kilometers
  lat_diff DECIMAL;
  lon_diff DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  lat_diff := radians(lat2 - lat1);
  lon_diff := radians(lon2 - lon1);
  
  a := sin(lat_diff/2) * sin(lat_diff/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(lon_diff/2) * sin(lon_diff/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN earth_radius * c;
END;
$$;