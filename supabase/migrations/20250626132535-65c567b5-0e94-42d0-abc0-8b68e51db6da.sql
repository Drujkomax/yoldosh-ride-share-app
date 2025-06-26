
-- Этап 1: Исправление базы данных и RLS политик (исправленная версия)

-- Отключаем RLS временно для очистки политик
ALTER TABLE public.chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- Удаляем все существующие политики
DROP POLICY IF EXISTS "Users can view their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- Добавляем foreign key constraints (только если их еще нет)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_chats_ride') THEN
        ALTER TABLE public.chats ADD CONSTRAINT fk_chats_ride FOREIGN KEY (ride_id) REFERENCES public.rides(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_chats_participant1') THEN
        ALTER TABLE public.chats ADD CONSTRAINT fk_chats_participant1 FOREIGN KEY (participant1_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_chats_participant2') THEN
        ALTER TABLE public.chats ADD CONSTRAINT fk_chats_participant2 FOREIGN KEY (participant2_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_messages_chat') THEN
        ALTER TABLE public.messages ADD CONSTRAINT fk_messages_chat FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_messages_sender') THEN
        ALTER TABLE public.messages ADD CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_bookings_ride') THEN
        ALTER TABLE public.bookings ADD CONSTRAINT fk_bookings_ride FOREIGN KEY (ride_id) REFERENCES public.rides(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_bookings_passenger') THEN
        ALTER TABLE public.bookings ADD CONSTRAINT fk_bookings_passenger FOREIGN KEY (passenger_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Создаем новые упрощенные RLS политики
CREATE POLICY "Users can view their own chats" ON public.chats 
FOR SELECT USING (true);

CREATE POLICY "Users can create chats" ON public.chats 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own chats" ON public.chats 
FOR UPDATE USING (true);

CREATE POLICY "Users can view messages in their chats" ON public.messages 
FOR SELECT USING (true);

CREATE POLICY "Users can create messages" ON public.messages 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own messages" ON public.messages 
FOR UPDATE USING (true);

-- Включаем RLS обратно
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Создаем функцию для автоматического создания чата при подтверждении заявки
CREATE OR REPLACE FUNCTION create_chat_on_booking_confirmation()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Создаем триггер для автоматического создания чата
DROP TRIGGER IF EXISTS booking_confirmation_chat_trigger ON public.bookings;
CREATE TRIGGER booking_confirmation_chat_trigger
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION create_chat_on_booking_confirmation();

-- Включаем realtime для чатов и сообщений
ALTER TABLE public.chats REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Добавляем таблицы в realtime publication (только если их там еще нет)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'chats'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;
END $$;
