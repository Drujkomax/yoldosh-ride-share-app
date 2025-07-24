-- Добавляем поле about в таблицу profiles для хранения информации о пользователе
ALTER TABLE public.profiles 
ADD COLUMN about TEXT;