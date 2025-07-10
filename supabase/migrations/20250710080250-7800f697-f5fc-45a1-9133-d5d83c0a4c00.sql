-- Enable RLS on tables that don't have it
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bookings table
CREATE POLICY "Users can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (passenger_id = auth.uid());

CREATE POLICY "Users can create their own bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (passenger_id = auth.uid());

CREATE POLICY "Users can update their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (passenger_id = auth.uid());

CREATE POLICY "Drivers can view bookings for their rides" 
ON public.bookings 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.rides 
  WHERE rides.id = bookings.ride_id 
  AND rides.driver_id = auth.uid()
));

CREATE POLICY "Drivers can update bookings for their rides" 
ON public.bookings 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.rides 
  WHERE rides.id = bookings.ride_id 
  AND rides.driver_id = auth.uid()
));

-- Create RLS policies for car_photos table
CREATE POLICY "Users can view all car photos" 
ON public.car_photos 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own car photos" 
ON public.car_photos 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_cars 
  WHERE user_cars.id = car_photos.car_id 
  AND user_cars.user_id = auth.uid()
));

-- Create RLS policies for profiles table
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = auth.uid());

-- Create RLS policies for ride_requests table
CREATE POLICY "Users can view all ride requests" 
ON public.ride_requests 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own ride requests" 
ON public.ride_requests 
FOR INSERT 
WITH CHECK (passenger_id = auth.uid());

CREATE POLICY "Users can update their own ride requests" 
ON public.ride_requests 
FOR UPDATE 
USING (passenger_id = auth.uid());

CREATE POLICY "Users can delete their own ride requests" 
ON public.ride_requests 
FOR DELETE 
USING (passenger_id = auth.uid());

-- Create RLS policies for rides table
CREATE POLICY "Users can view all rides" 
ON public.rides 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own rides" 
ON public.rides 
FOR INSERT 
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Users can update their own rides" 
ON public.rides 
FOR UPDATE 
USING (driver_id = auth.uid());

CREATE POLICY "Users can delete their own rides" 
ON public.rides 
FOR DELETE 
USING (driver_id = auth.uid());

-- Create RLS policies for user_notifications table
CREATE POLICY "Users can view their own notifications" 
ON public.user_notifications 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" 
ON public.user_notifications 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "System can create notifications for users" 
ON public.user_notifications 
FOR INSERT 
WITH CHECK (true);