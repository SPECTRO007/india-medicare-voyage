-- Remove flight_bookings table and replace with simplified bookings table
DROP TABLE IF EXISTS public.flight_bookings;

-- Create bookings table for simplified booking flow
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
  tour_package_id UUID REFERENCES tour_packages(id) ON DELETE SET NULL,
  
  -- Passport verification
  passport_number TEXT,
  passport_expiry DATE,
  passport_country TEXT,
  
  -- Address details
  pickup_address TEXT,
  drop_address TEXT,
  
  -- Booking details
  total_amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Payment details
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT CHECK (payment_method IN ('stripe', 'razorpay', 'crypto', 'cash')),
  payment_transaction_id TEXT,
  
  -- Crypto payment specific
  crypto_currency TEXT,
  crypto_address TEXT,
  crypto_amount DECIMAL(20,8),
  
  booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all bookings" ON public.bookings
  FOR ALL USING (get_user_role() = 'admin'::user_role);

-- Create analytics table for admin tracking
CREATE TABLE public.analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'booking_created', 'payment_completed', 'consultation_booked', etc.
  event_data JSONB,
  revenue DECIMAL(12,2) DEFAULT 0,
  cost DECIMAL(12,2) DEFAULT 0,
  profit DECIMAL(12,2) GENERATED ALWAYS AS (revenue - cost) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for analytics
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Only admins can view analytics
CREATE POLICY "Only admins can view analytics" ON public.analytics
  FOR ALL USING (get_user_role() = 'admin'::user_role);

-- Create admin user function
CREATE OR REPLACE FUNCTION public.ensure_admin_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to set admin role
CREATE TRIGGER ensure_admin_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_admin_user();

-- Add triggers for updated_at
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_status ON public.bookings(booking_status);
CREATE INDEX idx_analytics_event_type ON public.analytics(event_type);
CREATE INDEX idx_analytics_created_at ON public.analytics(created_at);