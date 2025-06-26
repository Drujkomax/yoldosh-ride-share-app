
-- Создаем таблицу для отзывов
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewed_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  review_type VARCHAR(20) NOT NULL CHECK (review_type IN ('driver_to_passenger', 'passenger_to_driver')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Уникальный индекс чтобы каждый пользователь мог оставить только один отзыв на бронирование
  UNIQUE(booking_id, reviewer_id)
);

-- Включаем RLS для таблицы отзывов
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Политики RLS для отзывов
CREATE POLICY "Users can view all reviews" 
  ON public.reviews 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create reviews for their bookings" 
  ON public.reviews 
  FOR INSERT 
  WITH CHECK (
    reviewer_id = (SELECT id FROM public.profiles WHERE id = reviewer_id)
    AND EXISTS (
      SELECT 1 FROM public.bookings b 
      JOIN public.rides r ON b.ride_id = r.id 
      WHERE b.id = booking_id 
      AND b.status = 'completed'
      AND (b.passenger_id = reviewer_id OR r.driver_id = reviewer_id)
    )
  );

-- Функция для автоматического обновления доступных мест при подтверждении бронирования
CREATE OR REPLACE FUNCTION public.update_ride_seats_on_booking_confirmation()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Создаем триггер для автоматического обновления мест
CREATE TRIGGER trigger_update_ride_seats_on_booking_confirmation
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ride_seats_on_booking_confirmation();

-- Обновляем enum статусов поездок, добавляем 'full'
ALTER TABLE public.rides 
DROP CONSTRAINT IF EXISTS rides_status_check;

ALTER TABLE public.rides 
ADD CONSTRAINT rides_status_check 
CHECK (status IN ('active', 'cancelled', 'completed', 'full'));
