-- Clear all existing user data
DELETE FROM public.profiles;
DELETE FROM public.bookings;
DELETE FROM public.consultations;
DELETE FROM public.communication_requests;
DELETE FROM public.doctor_reviews;
DELETE FROM public.chat_messages;

-- Insert hospital credentials for demo
INSERT INTO public.hospital_credentials (email, password_hash, hospital_name) VALUES
('apollo.admin@medglobal.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Apollo Hospital'),
('fortis.admin@medglobal.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Fortis Hospital'),
('max.admin@medglobal.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Max Hospital');