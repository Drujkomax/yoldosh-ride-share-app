-- Create ride alerts table
CREATE TABLE public.ride_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  from_city TEXT NOT NULL,
  to_city TEXT NOT NULL,
  departure_date DATE,
  max_price_per_seat NUMERIC,
  min_seats INTEGER DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ride_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for ride alerts
CREATE POLICY "Users can view their own ride alerts" 
ON public.ride_alerts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ride alerts" 
ON public.ride_alerts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ride alerts" 
ON public.ride_alerts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ride alerts" 
ON public.ride_alerts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ride_alerts_updated_at
BEFORE UPDATE ON public.ride_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();