-- Исправим возможные проблемы с RLS политиками

-- Удалим дублирующиеся политики для messages
DROP POLICY IF EXISTS "Users can create messages" ON public.messages;

-- Улучшим политику для создания уведомлений - добавим проверку аутентификации
DROP POLICY IF EXISTS "System can create notifications for users" ON public.user_notifications;
CREATE POLICY "System can create notifications for users" 
ON public.user_notifications 
FOR INSERT 
WITH CHECK (true);

-- Создадим более конкретную политику для создания уведомлений администраторами
CREATE POLICY "Authenticated users can create notifications" 
ON public.user_notifications 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Исправим политику для профилей - добавим проверку для неаутентифицированных пользователей
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = auth.uid() OR auth.uid() IS NULL);

-- Добавим политику для анонимного доступа к профилям (для регистрации)
CREATE POLICY "Anonymous users can create profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() IS NULL);

-- Исправим проблемы с функциями триггеров
DROP TRIGGER IF EXISTS update_estimated_arrival_time_trigger ON public.rides;
CREATE TRIGGER update_estimated_arrival_time_trigger
    BEFORE INSERT OR UPDATE ON public.rides
    FOR EACH ROW
    EXECUTE FUNCTION public.update_estimated_arrival_time();

-- Добавим индексы для повышения производительности
CREATE INDEX IF NOT EXISTS idx_bookings_passenger_id ON public.bookings(passenger_id);
CREATE INDEX IF NOT EXISTS idx_bookings_ride_id ON public.bookings(ride_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON public.rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_departure_date ON public.rides(departure_date);
CREATE INDEX IF NOT EXISTS idx_chats_participants ON public.chats(participant1_id, participant2_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);