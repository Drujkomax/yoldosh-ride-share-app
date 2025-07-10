-- Исправляем RLS политики для работы с локальной аутентификацией
-- Удаляем старые политики
DROP POLICY IF EXISTS "Users can create their own rides" ON public.rides;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anonymous users can create profiles" ON public.profiles;

-- Создаем новые политики для rides, которые работают без Supabase Auth
CREATE POLICY "Anyone can create rides" 
ON public.rides 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view rides" 
ON public.rides 
FOR SELECT 
USING (true);

CREATE POLICY "Drivers can update their own rides" 
ON public.rides 
FOR UPDATE 
USING (driver_id::text = current_setting('app.current_user_id', true));

-- Создаем новые политики для profiles
CREATE POLICY "Anyone can create profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update profiles" 
ON public.profiles 
FOR UPDATE 
USING (true);

-- Создаем функцию для установки текущего пользователя
CREATE OR REPLACE FUNCTION public.set_current_user_id(user_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT set_config('app.current_user_id', user_id, true);
$$;