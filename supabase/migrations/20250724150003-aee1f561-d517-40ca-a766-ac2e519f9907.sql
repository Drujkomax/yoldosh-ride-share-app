-- Fix critical security issues: database functions and security definer view

-- First, fix all database functions to have proper search_path security
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
 RETURNS text
 LANGUAGE sql
 STABLE
 SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.user_cars 
      WHERE user_id = user_uuid AND is_active = true
    ) THEN 'driver'
    ELSE 'passenger'
  END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_chat_on_booking_confirmation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  -- Проверяем, что статус изменился на 'confirmed' и чата еще нет
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    -- Получаем driver_id из таблицы rides и создаем чат
    INSERT INTO public.chats (ride_id, participant1_id, participant2_id)
    SELECT NEW.ride_id, r.driver_id, NEW.passenger_id
    FROM public.rides r 
    WHERE r.id = NEW.ride_id
    AND NOT EXISTS (
      SELECT 1 FROM public.chats 
      WHERE ride_id = NEW.ride_id 
      AND ((participant1_id = r.driver_id AND participant2_id = NEW.passenger_id) 
           OR (participant1_id = NEW.passenger_id AND participant2_id = r.driver_id))
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_current_user_id(user_id text)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT set_config('app.current_user_id', user_id, true);
$function$;

CREATE OR REPLACE FUNCTION public.update_ride_seats_on_booking_confirmation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  -- Если статус изменился на 'confirmed'
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    -- Уменьшаем количество доступных мест
    UPDATE public.rides 
    SET available_seats = available_seats - NEW.seats_booked,
        updated_at = now()
    WHERE id = NEW.ride_id;
    
    -- Если мест больше нет, деактивируем поездку
    UPDATE public.rides 
    SET status = 'full',
        updated_at = now()
    WHERE id = NEW.ride_id 
    AND available_seats <= 0;
  END IF;
  
  -- Если статус изменился с 'confirmed' на что-то другое, возвращаем места
  IF OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
    UPDATE public.rides 
    SET available_seats = available_seats + OLD.seats_booked,
        status = CASE 
          WHEN status = 'full' THEN 'active'
          ELSE status
        END,
        updated_at = now()
    WHERE id = NEW.ride_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_all_trips(user_uuid uuid)
 RETURNS TABLE(trip_id uuid, trip_type text, from_city text, to_city text, departure_date date, departure_time time without time zone, status text, price_per_seat numeric, seats_count integer, other_user_id uuid, other_user_name text, other_user_rating numeric, other_user_avatar text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE
 SECURITY DEFINER SET search_path = ''
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
$function$;

CREATE OR REPLACE FUNCTION public.update_estimated_arrival_time()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  -- Обновляем расчетное время прибытия
  NEW.estimated_arrival_time = (NEW.departure_date + NEW.departure_time + (NEW.duration_hours || ' hours')::interval);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.deactivate_expired_rides()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  UPDATE public.rides 
  SET status = 'cancelled', 
      updated_at = now()
  WHERE status = 'active' 
    AND (departure_date + departure_time) < now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.complete_finished_rides()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  -- Завершаем поездки, время которых истекло
  UPDATE public.rides 
  SET status = 'completed', 
      updated_at = now()
  WHERE status IN ('active', 'full') 
    AND estimated_arrival_time < now();
    
  -- Завершаем соответствующие бронирования
  UPDATE public.bookings 
  SET status = 'completed', 
      updated_at = now()
  WHERE status = 'confirmed' 
    AND ride_id IN (
      SELECT id FROM public.rides 
      WHERE status = 'completed' 
      AND estimated_arrival_time < now()
    );
END;
$function$;

-- Remove the password_hash column from profiles table for security
ALTER TABLE public.profiles DROP COLUMN IF EXISTS password_hash;