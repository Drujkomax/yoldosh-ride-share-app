-- Fix security vulnerability in profiles_with_role view
-- Replace SECURITY DEFINER with SECURITY INVOKER to respect RLS policies

CREATE OR REPLACE VIEW public.profiles_with_role 
WITH (security_invoker=on) AS
SELECT 
  p.id,
  p.name,
  p.phone,
  p.avatar_url,
  p.is_verified,
  p.total_rides,
  p.rating,
  p.created_at,
  p.updated_at,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.user_cars 
      WHERE user_id = p.id AND is_active = true
    ) THEN true
    ELSE false
  END as can_drive,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.user_cars 
      WHERE user_id = p.id AND is_active = true
    ) THEN 'driver'
    ELSE 'passenger'
  END as role
FROM public.profiles p;