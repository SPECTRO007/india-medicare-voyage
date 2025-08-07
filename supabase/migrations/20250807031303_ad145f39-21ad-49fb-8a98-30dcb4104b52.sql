
-- Delete all profiles first (due to foreign key constraints)
DELETE FROM public.profiles;

-- Delete all user accounts from auth.users
DELETE FROM auth.users;

-- Reset any sequences or clean up related data
DELETE FROM public.consultations;
DELETE FROM public.bookings;
DELETE FROM public.chat_messages;
DELETE FROM public.communication_requests;
DELETE FROM public.doctor_reviews;
DELETE FROM public.analytics WHERE user_id IS NOT NULL;

-- Clean up any other user-related data
TRUNCATE public.hospital_credentials;
