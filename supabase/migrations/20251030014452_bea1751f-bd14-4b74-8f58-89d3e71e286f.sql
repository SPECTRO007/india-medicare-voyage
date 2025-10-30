-- Make consultation_id nullable in medical_records to allow standalone document uploads
ALTER TABLE public.medical_records 
ALTER COLUMN consultation_id DROP NOT NULL;

-- Update RLS policies to allow users to insert their own standalone medical records
DROP POLICY IF EXISTS "Patients manage their own consultation records" ON public.medical_records;

CREATE POLICY "Patients can insert their own medical records"
ON public.medical_records
FOR INSERT
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Patients can view their own medical records"
ON public.medical_records
FOR SELECT
USING (auth.uid() = uploaded_by);

CREATE POLICY "Patients can delete their own medical records"
ON public.medical_records
FOR DELETE
USING (auth.uid() = uploaded_by);

CREATE POLICY "Doctors can view records for their consultations"
ON public.medical_records
FOR SELECT
USING (
  consultation_id IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM consultations c
    JOIN doctors d ON d.id = c.doctor_id
    WHERE c.id = medical_records.consultation_id
    AND d.user_id = auth.uid()
  )
);