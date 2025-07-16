-- Удаляем старые неправильные политики для chats
DROP POLICY IF EXISTS "Users can view their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update their own chats" ON public.chats;

-- Удаляем старые неправильные политики для messages
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- Создаем правильные политики для chats
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

-- Создаем правильные политики для messages  
CREATE POLICY "Users can view messages in their chats" ON public.messages 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chats 
    WHERE chats.id = messages.chat_id 
    AND (auth.uid() = chats.participant1_id OR auth.uid() = chats.participant2_id)
  )
);

CREATE POLICY "Users can update their own messages" ON public.messages 
FOR UPDATE USING (auth.uid() = sender_id);