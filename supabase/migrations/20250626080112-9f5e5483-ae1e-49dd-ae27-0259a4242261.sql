
-- Этап 1: Исправление схемы базы данных

-- Удаляем foreign key constraint между profiles и auth.users
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Изменяем тип столбца id в profiles на UUID с генерацией по умолчанию
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Обновляем foreign key constraints в других таблицах чтобы они ссылались на profiles.id
-- вместо auth.users.id

-- Для таблицы rides
ALTER TABLE public.rides DROP CONSTRAINT IF EXISTS rides_driver_id_fkey;
ALTER TABLE public.rides ADD CONSTRAINT rides_driver_id_fkey 
  FOREIGN KEY (driver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Для таблицы ride_requests  
ALTER TABLE public.ride_requests DROP CONSTRAINT IF EXISTS ride_requests_passenger_id_fkey;
ALTER TABLE public.ride_requests ADD CONSTRAINT ride_requests_passenger_id_fkey
  FOREIGN KEY (passenger_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Для таблицы bookings
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_passenger_id_fkey;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_passenger_id_fkey
  FOREIGN KEY (passenger_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Для таблицы chats
ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS chats_participant1_id_fkey;
ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS chats_participant2_id_fkey;
ALTER TABLE public.chats ADD CONSTRAINT chats_participant1_id_fkey
  FOREIGN KEY (participant1_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.chats ADD CONSTRAINT chats_participant2_id_fkey
  FOREIGN KEY (participant2_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Для таблицы messages
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_fkey
  FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Удаляем триггер который автоматически создавал профили при регистрации в auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Обновляем RLS политики чтобы они работали без auth.uid()
-- Временно отключаем RLS для всех таблиц для упрощения отладки
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides DISABLE ROW LEVEL SECURITY; 
ALTER TABLE public.ride_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- Удаляем все существующие RLS политики
DROP POLICY IF EXISTS "Anyone can create profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can delete profiles" ON public.profiles;

DROP POLICY IF EXISTS "Anyone can view active rides" ON public.rides;
DROP POLICY IF EXISTS "Drivers can manage own rides" ON public.rides;

DROP POLICY IF EXISTS "Anyone can view active requests" ON public.ride_requests;
DROP POLICY IF EXISTS "Passengers can manage own requests" ON public.ride_requests;

DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Passengers can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;

DROP POLICY IF EXISTS "Users can view own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;

DROP POLICY IF EXISTS "Chat participants can view messages" ON public.messages;
DROP POLICY IF EXISTS "Chat participants can send messages" ON public.messages;
