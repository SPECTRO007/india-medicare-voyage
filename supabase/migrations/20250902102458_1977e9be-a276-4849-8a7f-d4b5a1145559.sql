-- Update RLS policies for hospitals table to allow hospital owners to manage their own records

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage hospitals" ON public.hospitals;
DROP POLICY IF EXISTS "Anyone can view hospitals" ON public.hospitals;

-- Create new policies
CREATE POLICY "Anyone can view hospitals" 
ON public.hospitals 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage all hospitals" 
ON public.hospitals 
FOR ALL 
USING (get_user_role() = 'admin'::user_role)
WITH CHECK (get_user_role() = 'admin'::user_role);

CREATE POLICY "Hospital owners can insert their own hospital" 
ON public.hospitals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hospital owners can update their own hospital" 
ON public.hospitals 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hospital owners can view their own hospital" 
ON public.hospitals 
FOR SELECT 
USING (auth.uid() = user_id);