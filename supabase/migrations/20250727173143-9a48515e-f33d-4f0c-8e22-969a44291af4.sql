-- Add hospitals table for location-based search
CREATE TABLE public.hospitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  specializations TEXT[],
  rating DECIMAL(3, 2) DEFAULT 4.0,
  total_beds INTEGER DEFAULT 0,
  icu_beds INTEGER DEFAULT 0,
  emergency_available BOOLEAN DEFAULT true,
  accreditations TEXT[],
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add distance calculation function
CREATE OR REPLACE FUNCTION calculate_distance(lat1 DECIMAL, lon1 DECIMAL, lat2 DECIMAL, lon2 DECIMAL)
RETURNS DECIMAL AS $$
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
$$ LANGUAGE plpgsql;

-- Add chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('patient', 'doctor')),
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  content TEXT NOT NULL,
  file_url TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add flight bookings table
CREATE TABLE public.flight_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  consultation_id UUID REFERENCES consultations(id),
  departure_city TEXT NOT NULL,
  arrival_city TEXT NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE,
  passenger_count INTEGER NOT NULL DEFAULT 1,
  flight_class TEXT NOT NULL DEFAULT 'economy' CHECK (flight_class IN ('economy', 'business', 'first')),
  total_price DECIMAL(10, 2),
  booking_status TEXT NOT NULL DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  booking_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add phone to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT '+1';

-- Update doctors table with additional fields
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS hospital_id UUID REFERENCES hospitals(id);
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{"English"}';
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS education TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS certifications TEXT[];

-- Enable RLS
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.flight_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hospitals
CREATE POLICY "Anyone can view hospitals" 
ON public.hospitals 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage hospitals" 
ON public.hospitals 
FOR ALL 
USING (get_user_role() = 'admin'::user_role);

-- RLS Policies for chat messages
CREATE POLICY "Users can view messages in their consultations" 
ON public.chat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM consultations c 
    WHERE c.id = chat_messages.consultation_id 
    AND (c.user_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM doctors d WHERE d.user_id = auth.uid() AND d.id = c.doctor_id))
  )
);

CREATE POLICY "Users can send messages in their consultations" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM consultations c 
    WHERE c.id = chat_messages.consultation_id 
    AND (c.user_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM doctors d WHERE d.user_id = auth.uid() AND d.id = c.doctor_id))
  )
);

-- RLS Policies for flight bookings
CREATE POLICY "Users can view their own flight bookings" 
ON public.flight_bookings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own flight bookings" 
ON public.flight_bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flight bookings" 
ON public.flight_bookings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all flight bookings" 
ON public.flight_bookings 
FOR ALL 
USING (get_user_role() = 'admin'::user_role);

-- Triggers for updated_at
CREATE TRIGGER update_hospitals_updated_at
  BEFORE UPDATE ON public.hospitals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flight_bookings_updated_at
  BEFORE UPDATE ON public.flight_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Sample hospital data for testing
INSERT INTO public.hospitals (name, address, city, state, latitude, longitude, phone, specializations, rating, total_beds) VALUES
('Apollo Hospital', 'Bannerghatta Road', 'Bengaluru', 'Karnataka', 12.9352, 77.6245, '+91-80-26304050', '{"Cardiology","Oncology","Orthopedics","Neurology"}', 4.5, 500),
('Fortis Hospital', 'Cunningham Road', 'Bengaluru', 'Karnataka', 12.9698, 77.5802, '+91-80-66214444', '{"Cardiology","Gastroenterology","Urology"}', 4.3, 350),
('Narayana Health', 'Bommasandra', 'Bengaluru', 'Karnataka', 12.8064, 77.6632, '+91-80-71222200', '{"Cardiac Surgery","Pediatrics","Orthopedics"}', 4.4, 400),
('Manipal Hospital', 'HAL Airport Road', 'Bengaluru', 'Karnataka', 12.9563, 77.6648, '+91-80-25026666', '{"Neurology","Oncology","Gynecology"}', 4.2, 300),
('Columbia Asia Hospital', 'Kirloskar Business Park', 'Bengaluru', 'Karnataka', 12.9915, 77.7108, '+91-80-66768888', '{"Emergency Medicine","Dermatology","ENT"}', 4.1, 200);