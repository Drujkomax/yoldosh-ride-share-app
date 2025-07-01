
-- Расширяем таблицу rides для поддержки детального функционала создания поездок
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS precise_pickup_latitude NUMERIC;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS precise_pickup_longitude NUMERIC;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS precise_dropoff_latitude NUMERIC;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS precise_dropoff_longitude NUMERIC;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS estimated_duration_minutes INTEGER;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS estimated_distance_km NUMERIC;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS route_polyline TEXT;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS toll_info JSONB;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS departure_flexibility INTEGER DEFAULT 0; -- в минутах
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS passenger_pickup_instructions TEXT;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS passenger_dropoff_instructions TEXT;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS comfort_settings JSONB DEFAULT '{"music_allowed": true, "smoking_allowed": false, "pets_allowed": false, "air_conditioning": true}'::jsonb;

-- Добавляем комментарии для ясности
COMMENT ON COLUMN public.rides.precise_pickup_latitude IS 'Точная широта места посадки пассажиров';
COMMENT ON COLUMN public.rides.precise_pickup_longitude IS 'Точная долгота места посадки пассажиров';
COMMENT ON COLUMN public.rides.precise_dropoff_latitude IS 'Точная широта места высадки пассажиров';
COMMENT ON COLUMN public.rides.precise_dropoff_longitude IS 'Точная долгота места высадки пассажиров';
COMMENT ON COLUMN public.rides.estimated_duration_minutes IS 'Расчетное время поездки в минутах';
COMMENT ON COLUMN public.rides.estimated_distance_km IS 'Расчетное расстояние в километрах';
COMMENT ON COLUMN public.rides.route_polyline IS 'Закодированная полилиния маршрута Google Maps';
COMMENT ON COLUMN public.rides.toll_info IS 'Информация о платных дорогах и стоимости';
COMMENT ON COLUMN public.rides.departure_flexibility IS 'Гибкость времени отправления в минутах';
COMMENT ON COLUMN public.rides.comfort_settings IS 'Настройки комфорта поездки';
