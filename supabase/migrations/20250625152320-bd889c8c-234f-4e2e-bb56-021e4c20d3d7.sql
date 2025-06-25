
-- Create profiles table for additional user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('driver', 'passenger')),
  is_verified BOOLEAN DEFAULT false,
  total_rides INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rides table
CREATE TABLE public.rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_city VARCHAR(100) NOT NULL,
  to_city VARCHAR(100) NOT NULL,
  departure_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  available_seats INTEGER NOT NULL CHECK (available_seats > 0),
  price_per_seat DECIMAL(10,2) NOT NULL,
  description TEXT,
  car_model VARCHAR(100),
  car_color VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ride_requests table
CREATE TABLE public.ride_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_city VARCHAR(100) NOT NULL,
  to_city VARCHAR(100) NOT NULL,
  preferred_date DATE NOT NULL,
  passengers_count INTEGER DEFAULT 1 CHECK (passengers_count > 0),
  max_price_per_seat DECIMAL(10,2),
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'matched', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seats_booked INTEGER NOT NULL CHECK (seats_booked > 0),
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  pickup_location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ride_id, passenger_id)
);

-- Create chats table
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE,
  participant1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant1_id, participant2_id, ride_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'location')),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for rides
CREATE POLICY "Anyone can view active rides" ON public.rides FOR SELECT USING (status = 'active');
CREATE POLICY "Drivers can manage own rides" ON public.rides FOR ALL USING (auth.uid() = driver_id);

-- RLS Policies for ride_requests
CREATE POLICY "Anyone can view active requests" ON public.ride_requests FOR SELECT USING (status = 'active');
CREATE POLICY "Passengers can manage own requests" ON public.ride_requests FOR ALL USING (auth.uid() = passenger_id);

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings" ON public.bookings 
  FOR SELECT USING (
    auth.uid() = passenger_id OR 
    auth.uid() = (SELECT driver_id FROM public.rides WHERE id = ride_id)
  );
CREATE POLICY "Passengers can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = passenger_id);
CREATE POLICY "Users can update own bookings" ON public.bookings 
  FOR UPDATE USING (
    auth.uid() = passenger_id OR 
    auth.uid() = (SELECT driver_id FROM public.rides WHERE id = ride_id)
  );

-- RLS Policies for chats
CREATE POLICY "Users can view own chats" ON public.chats 
  FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);
CREATE POLICY "Users can create chats" ON public.chats 
  FOR INSERT WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- RLS Policies for messages
CREATE POLICY "Chat participants can view messages" ON public.messages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chats 
      WHERE id = chat_id AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
  );
CREATE POLICY "Chat participants can send messages" ON public.messages 
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.chats 
      WHERE id = chat_id AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
  );

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', 'Пользователь'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'passenger')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_rides_cities ON public.rides(from_city, to_city);
CREATE INDEX idx_rides_date ON public.rides(departure_date);
CREATE INDEX idx_ride_requests_cities ON public.ride_requests(from_city, to_city);
CREATE INDEX idx_ride_requests_date ON public.ride_requests(preferred_date);
CREATE INDEX idx_bookings_ride ON public.bookings(ride_id);
CREATE INDEX idx_messages_chat ON public.messages(chat_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
