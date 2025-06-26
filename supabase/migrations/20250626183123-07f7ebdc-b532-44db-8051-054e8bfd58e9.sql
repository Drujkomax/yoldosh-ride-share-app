
-- Добавляем колонку для длительности поездки в часах
ALTER TABLE public.rides ADD COLUMN duration_hours INTEGER DEFAULT 2;

-- Добавляем колонку для автоматического расчета времени завершения поездки
ALTER TABLE public.rides ADD COLUMN estimated_arrival_time TIMESTAMP WITH TIME ZONE;

-- Функция для обновления времени прибытия при изменении времени отправления или длительности
CREATE OR REPLACE FUNCTION public.update_estimated_arrival_time()
RETURNS TRIGGER AS $$
BEGIN
  -- Обновляем расчетное время прибытия
  NEW.estimated_arrival_time = (NEW.departure_date + NEW.departure_time + (NEW.duration_hours || ' hours')::interval);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для автоматического обновления времени прибытия
CREATE TRIGGER trigger_update_estimated_arrival_time
  BEFORE INSERT OR UPDATE ON public.rides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_estimated_arrival_time();

-- Функция для деактивации поездок после времени отправления
CREATE OR REPLACE FUNCTION public.deactivate_expired_rides()
RETURNS void AS $$
BEGIN
  UPDATE public.rides 
  SET status = 'cancelled', 
      updated_at = now()
  WHERE status = 'active' 
    AND (departure_date + departure_time) < now();
END;
$$ LANGUAGE plpgsql;

-- Обновляем ограничение статусов бронирований, добавляем 'completed'
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));

-- Функция для автоматического завершения поездок
CREATE OR REPLACE FUNCTION public.complete_finished_rides()
RETURNS void AS $$
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
$$ LANGUAGE plpgsql;
