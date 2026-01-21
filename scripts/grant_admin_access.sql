-- =============================================
-- Grant Admin Access Script
-- Run this in Supabase SQL Editor
-- =============================================

-- Update the user's profile role to 'admin'
-- This assumes the user has already signed up and has a profile
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'boldideas.official@gmail.com';

-- Verify the update
SELECT email, role 
FROM public.profiles 
WHERE email = 'boldideas.official@gmail.com';
