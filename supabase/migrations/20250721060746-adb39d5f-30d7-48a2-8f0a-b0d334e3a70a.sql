-- Добавляем поддержку системных сообщений и кнопок для водителей
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS sender_type character varying DEFAULT 'user',
ADD COLUMN IF NOT EXISTS system_action_type character varying,
ADD COLUMN IF NOT EXISTS booking_request_id uuid,
ADD COLUMN IF NOT EXISTS action_data jsonb,
ADD COLUMN IF NOT EXISTS is_action_completed boolean DEFAULT false;

-- Добавляем комментарии для ясности
COMMENT ON COLUMN public.messages.sender_type IS 'Тип отправителя: user, system';
COMMENT ON COLUMN public.messages.system_action_type IS 'Тип системного действия: booking_request, booking_confirmation';
COMMENT ON COLUMN public.messages.booking_request_id IS 'ID запроса на бронирование, если сообщение связано с бронированием';
COMMENT ON COLUMN public.messages.action_data IS 'Дополнительные данные для системных действий';
COMMENT ON COLUMN public.messages.is_action_completed IS 'Завершено ли действие (например, обработан ли запрос на бронирование)';