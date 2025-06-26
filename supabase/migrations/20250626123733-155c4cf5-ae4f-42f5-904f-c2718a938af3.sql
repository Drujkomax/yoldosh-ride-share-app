
-- Проверяем существующие внешние ключи и добавляем недостающие профили
-- Сначала добавляем профили пользователей, если их нет
INSERT INTO public.profiles (id, phone, name, role, is_verified, total_rides, rating) VALUES
('a25113b0-5fa4-4e63-9425-203e885cbf67', '+998 (90) 123-45-67', 'Пассажир', 'passenger', false, 0, 0.0),
('b9a45984-eaf8-413f-a064-0b24a958708d', '+998 (94) 546-45-64', 'паукауц', 'driver', false, 0, 0.0)
ON CONFLICT (id) DO UPDATE SET
  phone = EXCLUDED.phone,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  is_verified = EXCLUDED.is_verified,
  total_rides = EXCLUDED.total_rides,
  rating = EXCLUDED.rating;

-- Проверяем и добавляем недостающие внешние ключи
DO $$
BEGIN
    -- Добавляем внешний ключ для rides -> profiles если его нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'rides_driver_id_fkey' 
        AND table_name = 'rides'
    ) THEN
        ALTER TABLE public.rides 
        ADD CONSTRAINT rides_driver_id_fkey 
        FOREIGN KEY (driver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Добавляем внешний ключ для ride_requests -> profiles если его нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'ride_requests_passenger_id_fkey' 
        AND table_name = 'ride_requests'
    ) THEN
        ALTER TABLE public.ride_requests 
        ADD CONSTRAINT ride_requests_passenger_id_fkey 
        FOREIGN KEY (passenger_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;
