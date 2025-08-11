-- Update user_role enum to include hospital
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'hospital';

-- Create hospital_profiles table
CREATE TABLE public.hospital_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  established_year INTEGER,
  bed_capacity INTEGER,
  accreditations TEXT[],
  verified BOOLEAN DEFAULT false,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for hospital_profiles
ALTER TABLE public.hospital_profiles ENABLE ROW LEVEL SECURITY;

-- Create specialties table
CREATE TABLE public.specialties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID NOT NULL REFERENCES public.hospital_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for specialties
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;

-- Create hospital_doctors table (different from the existing doctors table)
CREATE TABLE public.hospital_doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID NOT NULL REFERENCES public.hospital_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  qualification TEXT,
  experience_years INTEGER DEFAULT 0,
  consultation_fee INTEGER DEFAULT 0,
  bio TEXT,
  image_url TEXT,
  languages TEXT[] DEFAULT ARRAY['English'],
  availability JSONB DEFAULT '{"mon":[],"tue":[],"wed":[],"thu":[],"fri":[],"sat":[],"sun":[]}'::jsonb,
  verified BOOLEAN DEFAULT false,
  rating NUMERIC DEFAULT 4.5,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for hospital_doctors
ALTER TABLE public.hospital_doctors ENABLE ROW LEVEL SECURITY;

-- Create doctor_portfolios table
CREATE TABLE public.doctor_portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.hospital_doctors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  case_type TEXT,
  success_rate NUMERIC,
  before_image_url TEXT,
  after_image_url TEXT,
  patient_testimonial TEXT,
  treatment_duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for doctor_portfolios
ALTER TABLE public.doctor_portfolios ENABLE ROW LEVEL SECURITY;

-- Create hospital_services table
CREATE TABLE public.hospital_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID NOT NULL REFERENCES public.hospital_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_range TEXT,
  duration TEXT,
  includes TEXT[],
  image_url TEXT,
  category TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for hospital_services
ALTER TABLE public.hospital_services ENABLE ROW LEVEL SECURITY;

-- Create hospital_reviews table
CREATE TABLE public.hospital_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID NOT NULL REFERENCES public.hospital_profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  treatment_type TEXT,
  verified_stay BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(hospital_id, patient_id)
);

-- Enable RLS for hospital_reviews
ALTER TABLE public.hospital_reviews ENABLE ROW LEVEL SECURITY;

-- Create patient_consultations table
CREATE TABLE public.patient_consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  hospital_id UUID NOT NULL REFERENCES public.hospital_profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.hospital_doctors(id) ON DELETE CASCADE,
  
  -- Patient details
  patient_name TEXT NOT NULL,
  patient_age INTEGER,
  patient_gender TEXT,
  patient_phone TEXT,
  patient_email TEXT,
  
  -- Medical information
  medical_condition TEXT NOT NULL,
  medical_history TEXT,
  current_medications TEXT,
  allergies TEXT,
  previous_surgeries TEXT,
  symptoms TEXT,
  urgency_level TEXT DEFAULT 'normal',
  
  -- Travel information
  passport_number TEXT,
  passport_country TEXT,
  passport_expiry DATE,
  preferred_travel_date DATE,
  
  -- Consultation status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'completed')),
  doctor_notes TEXT,
  estimated_cost NUMERIC,
  treatment_duration TEXT,
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for patient_consultations
ALTER TABLE public.patient_consultations ENABLE ROW LEVEL SECURITY;

-- Create medical_records table
CREATE TABLE public.medical_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID NOT NULL REFERENCES public.patient_consultations(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID NOT NULL,
  record_type TEXT, -- 'blood_test', 'scan', 'prescription', 'other'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for medical_records
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Update bookings table to include pickup/drop locations and remove crypto
ALTER TABLE public.bookings 
DROP COLUMN IF EXISTS crypto_amount,
DROP COLUMN IF EXISTS crypto_currency,
DROP COLUMN IF EXISTS crypto_address;

-- Add consultation reference to bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS consultation_id UUID REFERENCES public.patient_consultations(id);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_hospital_profiles_user_id ON public.hospital_profiles(user_id);
CREATE INDEX idx_specialties_hospital_id ON public.specialties(hospital_id);
CREATE INDEX idx_hospital_doctors_hospital_id ON public.hospital_doctors(hospital_id);
CREATE INDEX idx_doctor_portfolios_doctor_id ON public.doctor_portfolios(doctor_id);
CREATE INDEX idx_hospital_services_hospital_id ON public.hospital_services(hospital_id);
CREATE INDEX idx_hospital_reviews_hospital_id ON public.hospital_reviews(hospital_id);
CREATE INDEX idx_patient_consultations_patient_id ON public.patient_consultations(patient_id);
CREATE INDEX idx_patient_consultations_hospital_id ON public.patient_consultations(hospital_id);
CREATE INDEX idx_patient_consultations_doctor_id ON public.patient_consultations(doctor_id);
CREATE INDEX idx_patient_consultations_status ON public.patient_consultations(status);
CREATE INDEX idx_medical_records_consultation_id ON public.medical_records(consultation_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_hospital_profiles_updated_at
  BEFORE UPDATE ON public.hospital_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_specialties_updated_at
  BEFORE UPDATE ON public.specialties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hospital_doctors_updated_at
  BEFORE UPDATE ON public.hospital_doctors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctor_portfolios_updated_at
  BEFORE UPDATE ON public.doctor_portfolios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hospital_services_updated_at
  BEFORE UPDATE ON public.hospital_services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hospital_reviews_updated_at
  BEFORE UPDATE ON public.hospital_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_consultations_updated_at
  BEFORE UPDATE ON public.patient_consultations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies

-- Hospital Profiles
CREATE POLICY "Hospitals can manage their own profile"
ON public.hospital_profiles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view verified hospitals"
ON public.hospital_profiles
FOR SELECT
USING (verified = true);

CREATE POLICY "Admins can manage all hospital profiles"
ON public.hospital_profiles
FOR ALL
USING (get_user_role() = 'admin');

-- Specialties
CREATE POLICY "Hospitals can manage their specialties"
ON public.specialties
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.hospital_profiles hp
  WHERE hp.id = hospital_id AND hp.user_id = auth.uid()
));

CREATE POLICY "Anyone can view specialties of verified hospitals"
ON public.specialties
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.hospital_profiles hp
  WHERE hp.id = hospital_id AND hp.verified = true
));

CREATE POLICY "Admins can manage all specialties"
ON public.specialties
FOR ALL
USING (get_user_role() = 'admin');

-- Hospital Doctors
CREATE POLICY "Hospitals can manage their doctors"
ON public.hospital_doctors
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.hospital_profiles hp
  WHERE hp.id = hospital_id AND hp.user_id = auth.uid()
));

CREATE POLICY "Anyone can view doctors of verified hospitals"
ON public.hospital_doctors
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.hospital_profiles hp
  WHERE hp.id = hospital_id AND hp.verified = true
));

CREATE POLICY "Admins can manage all doctors"
ON public.hospital_doctors
FOR ALL
USING (get_user_role() = 'admin');

-- Doctor Portfolios
CREATE POLICY "Hospitals can manage their doctors' portfolios"
ON public.doctor_portfolios
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.hospital_doctors hd
  JOIN public.hospital_profiles hp ON hp.id = hd.hospital_id
  WHERE hd.id = doctor_id AND hp.user_id = auth.uid()
));

CREATE POLICY "Anyone can view portfolios of verified hospital doctors"
ON public.doctor_portfolios
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.hospital_doctors hd
  JOIN public.hospital_profiles hp ON hp.id = hd.hospital_id
  WHERE hd.id = doctor_id AND hp.verified = true
));

CREATE POLICY "Admins can manage all portfolios"
ON public.doctor_portfolios
FOR ALL
USING (get_user_role() = 'admin');

-- Hospital Services
CREATE POLICY "Hospitals can manage their services"
ON public.hospital_services
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.hospital_profiles hp
  WHERE hp.id = hospital_id AND hp.user_id = auth.uid()
));

CREATE POLICY "Anyone can view services of verified hospitals"
ON public.hospital_services
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.hospital_profiles hp
  WHERE hp.id = hospital_id AND hp.verified = true
));

CREATE POLICY "Admins can manage all services"
ON public.hospital_services
FOR ALL
USING (get_user_role() = 'admin');

-- Hospital Reviews
CREATE POLICY "Patients can create reviews"
ON public.hospital_reviews
FOR INSERT
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update their own reviews"
ON public.hospital_reviews
FOR UPDATE
USING (auth.uid() = patient_id);

CREATE POLICY "Anyone can view reviews"
ON public.hospital_reviews
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage all reviews"
ON public.hospital_reviews
FOR ALL
USING (get_user_role() = 'admin');

-- Patient Consultations
CREATE POLICY "Patients can create their own consultations"
ON public.patient_consultations
FOR INSERT
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can view their own consultations"
ON public.patient_consultations
FOR SELECT
USING (auth.uid() = patient_id);

CREATE POLICY "Hospitals can view consultations for their doctors"
ON public.patient_consultations
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.hospital_doctors hd
  JOIN public.hospital_profiles hp ON hp.id = hd.hospital_id
  WHERE hd.id = doctor_id AND hp.user_id = auth.uid()
));

CREATE POLICY "Hospitals can update consultations for their doctors"
ON public.patient_consultations
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.hospital_doctors hd
  JOIN public.hospital_profiles hp ON hp.id = hd.hospital_id
  WHERE hd.id = doctor_id AND hp.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all consultations"
ON public.patient_consultations
FOR ALL
USING (get_user_role() = 'admin');

-- Medical Records
CREATE POLICY "Patients can manage their consultation records"
ON public.medical_records
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.patient_consultations pc
  WHERE pc.id = consultation_id AND pc.patient_id = auth.uid()
));

CREATE POLICY "Hospitals can view records for their consultations"
ON public.medical_records
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.patient_consultations pc
  JOIN public.hospital_doctors hd ON hd.id = pc.doctor_id
  JOIN public.hospital_profiles hp ON hp.id = hd.hospital_id
  WHERE pc.id = consultation_id AND hp.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all medical records"
ON public.medical_records
FOR ALL
USING (get_user_role() = 'admin');

-- Audit Logs
CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (get_user_role() = 'admin');

-- Create storage bucket for medical records
INSERT INTO storage.buckets (id, name, public) 
VALUES ('medical-records', 'medical-records', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for medical records
CREATE POLICY "Patients can upload their medical records"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'medical-records' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Patients can view their medical records"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'medical-records' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Hospitals can view medical records for their consultations"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'medical-records' AND
  EXISTS (
    SELECT 1 FROM public.patient_consultations pc
    JOIN public.hospital_doctors hd ON hd.id = pc.doctor_id
    JOIN public.hospital_profiles hp ON hp.id = hd.hospital_id
    WHERE hp.user_id = auth.uid() AND
    pc.patient_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Admins can manage all medical records"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'medical-records' AND
  get_user_role() = 'admin'
);