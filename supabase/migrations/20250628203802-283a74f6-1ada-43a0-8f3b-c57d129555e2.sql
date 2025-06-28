
-- Добавляем новые поля для точных координат и маршрутов в таблицу rides
ALTER TABLE public.rides 
ADD COLUMN pickup_latitude NUMERIC,
ADD COLUMN pickup_longitude NUMERIC,
ADD COLUMN dropoff_latitude NUMERIC,
ADD COLUMN dropoff_longitude NUMERIC,
ADD COLUMN pickup_address TEXT,
ADD COLUMN dropoff_address TEXT,
ADD COLUMN route_data JSONB,
ADD COLUMN intermediate_stops JSONB DEFAULT '[]'::jsonb;

-- Добавляем аналогичные поля в таблицу ride_requests для совместимости
ALTER TABLE public.ride_requests
ADD COLUMN pickup_latitude NUMERIC,
ADD COLUMN pickup_longitude NUMERIC,
ADD COLUMN dropoff_latitude NUMERIC,
ADD COLUMN dropoff_longitude NUMERIC,
ADD COLUMN pickup_address TEXT,
ADD COLUMN dropoff_address TEXT;

-- Создаем индексы для быстрого поиска по координатам
CREATE INDEX idx_rides_pickup_location ON public.rides (pickup_latitude, pickup_longitude);
CREATE INDEX idx_rides_dropoff_location ON public.rides (dropoff_latitude, dropoff_longitude);
CREATE INDEX idx_ride_requests_pickup_location ON public.ride_requests (pickup_latitude, pickup_longitude);
CREATE INDEX idx_ride_requests_dropoff_location ON public.ride_requests (dropoff_latitude, dropoff_longitude);
