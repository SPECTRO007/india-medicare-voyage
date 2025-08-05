-- Drop existing doctor-related functionality and create hospital-based system
-- First update the user_role enum to include 'hospital'
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'hospital';

-- Create hospital_credentials table for predefined hospital login credentials
CREATE TABLE IF NOT EXISTS public.hospital_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on hospital_credentials
ALTER TABLE public.hospital_credentials ENABLE ROW LEVEL SECURITY;

-- Create policy for hospital_credentials (only readable by the system)
CREATE POLICY "Hospital credentials are system managed" 
ON public.hospital_credentials 
FOR ALL 
USING (false);

-- Update hospitals table to link with user accounts
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- Update doctors table to include ratings and link to hospitals
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.doctors DROP COLUMN IF EXISTS rating;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5);
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Create doctor_reviews table
CREATE TABLE IF NOT EXISTS public.doctor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(doctor_id, user_id)
);

-- Enable RLS on doctor_reviews
ALTER TABLE public.doctor_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for doctor_reviews
CREATE POLICY "Anyone can view doctor reviews" 
ON public.doctor_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own reviews" 
ON public.doctor_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON public.doctor_reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create communication_requests table
CREATE TABLE IF NOT EXISTS public.communication_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on communication_requests
ALTER TABLE public.communication_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for communication_requests
CREATE POLICY "Users can view their own requests" 
ON public.communication_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Doctors can view requests for them" 
ON public.communication_requests 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.doctors 
  WHERE doctors.user_id = auth.uid() 
  AND doctors.id = communication_requests.doctor_id
));

CREATE POLICY "Users can create communication requests" 
ON public.communication_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can update their requests" 
ON public.communication_requests 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.doctors 
  WHERE doctors.user_id = auth.uid() 
  AND doctors.id = communication_requests.doctor_id
));

-- Update doctor policies to allow hospitals to manage their doctors
DROP POLICY IF EXISTS "Doctors can insert their own profile" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can update their own profile" ON public.doctors;

CREATE POLICY "Hospital staff can insert doctors for their hospital" 
ON public.doctors 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.hospitals 
    WHERE hospitals.user_id = auth.uid() 
    AND hospitals.id = doctors.hospital_id
  )
);

CREATE POLICY "Hospital staff can update doctors for their hospital" 
ON public.doctors 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.hospitals 
    WHERE hospitals.user_id = auth.uid() 
    AND hospitals.id = doctors.hospital_id
  )
);

-- Create trigger to update doctor ratings based on reviews
CREATE OR REPLACE FUNCTION update_doctor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.doctors
  SET 
    rating = (
      SELECT COALESCE(AVG(rating::NUMERIC), 4.5)
      FROM public.doctor_reviews
      WHERE doctor_id = COALESCE(NEW.doctor_id, OLD.doctor_id)
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.doctor_reviews
      WHERE doctor_id = COALESCE(NEW.doctor_id, OLD.doctor_id)
    )
  WHERE id = COALESCE(NEW.doctor_id, OLD.doctor_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for rating updates
DROP TRIGGER IF EXISTS update_doctor_rating_trigger ON public.doctor_reviews;
CREATE TRIGGER update_doctor_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.doctor_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_doctor_rating();

-- Insert dummy hospital credentials (these will be visible in code for now)
INSERT INTO public.hospital_credentials (email, password_hash, hospital_name) VALUES
('apollo.admin@medglobal.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Apollo Hospitals'),
('fortis.admin@medglobal.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Fortis Healthcare'),
('max.admin@medglobal.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Max Healthcare')
ON CONFLICT (email) DO NOTHING;