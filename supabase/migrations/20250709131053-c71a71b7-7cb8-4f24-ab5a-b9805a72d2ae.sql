-- Add new fields to rides table for instant booking and return trips
ALTER TABLE public.rides 
ADD COLUMN instant_booking_enabled boolean DEFAULT false,
ADD COLUMN return_trip_id uuid DEFAULT NULL;

-- Add foreign key constraint for return trip linkage
ALTER TABLE public.rides 
ADD CONSTRAINT fk_return_trip 
FOREIGN KEY (return_trip_id) REFERENCES public.rides(id) ON DELETE SET NULL;

-- Create storage bucket for profile photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for avatar uploads
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);