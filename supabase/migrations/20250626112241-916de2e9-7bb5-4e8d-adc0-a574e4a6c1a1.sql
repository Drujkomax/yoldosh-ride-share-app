
-- Включаем RLS для таблиц chats и messages
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS политики для таблицы chats
CREATE POLICY "Users can view their own chats" ON public.chats 
FOR SELECT USING (
  auth.uid() = participant1_id OR auth.uid() = participant2_id
);

CREATE POLICY "Users can create chats" ON public.chats 
FOR INSERT WITH CHECK (
  auth.uid() = participant1_id OR auth.uid() = participant2_id
);

CREATE POLICY "Users can update their own chats" ON public.chats 
FOR UPDATE USING (
  auth.uid() = participant1_id OR auth.uid() = participant2_id
);

-- RLS политики для таблицы messages
CREATE POLICY "Users can view messages in their chats" ON public.messages 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chats 
    WHERE chats.id = messages.chat_id 
    AND (auth.uid() = chats.participant1_id OR auth.uid() = chats.participant2_id)
  )
);

CREATE POLICY "Users can create messages in their chats" ON public.messages 
FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.chats 
    WHERE chats.id = messages.chat_id 
    AND (auth.uid() = chats.participant1_id OR auth.uid() = chats.participant2_id)
  )
);

CREATE POLICY "Users can update their own messages" ON public.messages 
FOR UPDATE USING (auth.uid() = sender_id);

-- Включаем realtime для таблиц
ALTER TABLE public.chats REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
