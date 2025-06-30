
-- Добавляем поле для хранения геолокации в сообщениях
ALTER TABLE public.messages 
ADD COLUMN location_data JSONB;

-- Создаем таблицу для фотографий автомобилей
CREATE TABLE public.car_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID NOT NULL REFERENCES public.user_cars(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу для уведомлений пользователей
CREATE TABLE public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  related_id UUID, -- ID связанной записи (поездка, бронирование и т.д.)
  related_type VARCHAR(50), -- тип связанной записи
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Добавляем настройки уведомлений и приватности в профили
ALTER TABLE public.profiles 
ADD COLUMN notification_settings JSONB DEFAULT '{"push_enabled": true, "email_enabled": true, "sms_enabled": false}'::jsonb,
ADD COLUMN privacy_settings JSONB DEFAULT '{"show_phone": true, "show_rating": true, "show_trips_count": true}'::jsonb;

-- Индексы для производительности
CREATE INDEX idx_car_photos_car_id ON public.car_photos(car_id);
CREATE INDEX idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX idx_user_notifications_is_read ON public.user_notifications(is_read);
CREATE INDEX idx_messages_location_data ON public.messages USING GIN (location_data);

-- Функция для получения всех поездок пользователя (как водитель и как пассажир)
CREATE OR REPLACE FUNCTION public.get_user_all_trips(user_uuid uuid)
RETURNS TABLE (
  trip_id uuid,
  trip_type text,
  from_city text,
  to_city text,
  departure_date date,
  departure_time time,
  status text,
  price_per_seat numeric,
  seats_count integer,
  other_user_id uuid,
  other_user_name text,
  other_user_rating numeric,
  other_user_avatar text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
AS $function$
  -- Поездки как водитель
  SELECT 
    r.id as trip_id,
    'driver' as trip_type,
    r.from_city,
    r.to_city,
    r.departure_date,
    r.departure_time,
    r.status,
    r.price_per_seat,
    b.seats_booked as seats_count,
    p.id as other_user_id,
    p.name as other_user_name,
    p.rating as other_user_rating,
    p.avatar_url as other_user_avatar,
    r.created_at
  FROM public.rides r
  LEFT JOIN public.bookings b ON r.id = b.ride_id AND b.status = 'confirmed'
  LEFT JOIN public.profiles p ON b.passenger_id = p.id
  WHERE r.driver_id = user_uuid
  
  UNION ALL
  
  -- Поездки как пассажир
  SELECT 
    r.id as trip_id,
    'passenger' as trip_type,
    r.from_city,
    r.to_city,
    r.departure_date,
    r.departure_time,
    b.status,
    r.price_per_seat,
    b.seats_booked as seats_count,
    p.id as other_user_id,
    p.name as other_user_name,
    p.rating as other_user_rating,
    p.avatar_url as other_user_avatar,
    b.created_at
  FROM public.bookings b
  JOIN public.rides r ON b.ride_id = r.id
  JOIN public.profiles p ON r.driver_id = p.id
  WHERE b.passenger_id = user_uuid
  
  ORDER BY created_at DESC;
$function$
