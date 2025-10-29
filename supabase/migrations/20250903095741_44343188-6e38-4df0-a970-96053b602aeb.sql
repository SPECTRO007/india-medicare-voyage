-- Create passport verification table
CREATE TABLE public.passport_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  passport_image_url TEXT NOT NULL,
  selfie_image_url TEXT NOT NULL,
  passport_number TEXT,
  passport_country TEXT,
  passport_expiry DATE,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.passport_verifications ENABLE ROW LEVEL SECURITY;

-- Policies for passport verifications
CREATE POLICY "Users can view their own verification" ON public.passport_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verification" ON public.passport_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verification" ON public.passport_verifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all verifications" ON public.passport_verifications
  FOR ALL USING (get_user_role() = 'admin'::user_role);

-- Create storage bucket for passport documents
INSERT INTO storage.buckets (id, name, public) VALUES ('passport-documents', 'passport-documents', false);

-- Storage policies for passport documents
CREATE POLICY "Users can upload their passport documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'passport-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their passport documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'passport-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all passport documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'passport-documents' AND 
    get_user_role() = 'admin'::user_role
  );

-- Add trigger for updated_at
CREATE TRIGGER update_passport_verifications_updated_at
  BEFORE UPDATE ON public.passport_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();