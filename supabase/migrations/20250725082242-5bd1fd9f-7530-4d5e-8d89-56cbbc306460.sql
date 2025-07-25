-- Fix Security Definer View issue by removing SECURITY DEFINER from profiles_with_role view
DROP VIEW IF EXISTS public.profiles_with_role;

-- Recreate the view without SECURITY DEFINER to use the querying user's permissions
CREATE VIEW public.profiles_with_role AS
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

-- Fix overly permissive RLS policies on profiles table
DROP POLICY IF EXISTS "Anyone can create profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can update profiles" ON public.profiles;

-- Create secure RLS policies for profiles
CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "System can create profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- Keep the existing secure policies and add missing ones
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = id);

-- Fix overly permissive RLS policies on rides table
DROP POLICY IF EXISTS "Anyone can create rides" ON public.rides;

CREATE POLICY "Authenticated users can create rides" 
ON public.rides 
FOR INSERT 
WITH CHECK (auth.uid() = driver_id);

-- Fix overly permissive RLS policies on bookings table  
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can view bookings" ON public.bookings;

-- Create secure RLS policies for bookings
CREATE POLICY "Authenticated users can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "Passengers can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = passenger_id);

CREATE POLICY "Passengers can update their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = passenger_id);

-- Fix overly permissive RLS policies on chats table
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.chats;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.chats;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.chats;

-- Create secure RLS policies for chats
CREATE POLICY "Chat participants can view chats" 
ON public.chats 
FOR SELECT 
USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Chat participants can create chats" 
ON public.chats 
FOR INSERT 
WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Chat participants can update chats" 
ON public.chats 
FOR UPDATE 
USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- Fix overly permissive RLS policies on messages table
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.messages;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.messages;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.messages;

-- Create secure RLS policies for messages
CREATE POLICY "Chat participants can view messages" 
ON public.messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.chats 
    WHERE id = messages.chat_id 
    AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
  )
);

CREATE POLICY "Authenticated users can create messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.chats 
    WHERE id = messages.chat_id 
    AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
  )
);

CREATE POLICY "Message senders can update their messages" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = sender_id);

-- Fix overly permissive RLS policies on user_cars table
DROP POLICY IF EXISTS "Users can manage own cars" ON public.user_cars;

CREATE POLICY "Users can manage their own cars" 
ON public.user_cars 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);