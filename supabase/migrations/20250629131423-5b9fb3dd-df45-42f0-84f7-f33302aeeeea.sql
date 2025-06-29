
-- Добавляем таблицу для информации о машинах пользователей
CREATE TABLE public.user_cars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  make VARCHAR NOT NULL, -- марка автомобиля
  model VARCHAR NOT NULL, -- модель автомобиля
  year INTEGER, -- год выпуска
  color VARCHAR, -- цвет
  license_plate VARCHAR, -- номерной знак
  is_verified BOOLEAN DEFAULT FALSE, -- верифицирована ли машина
  is_active BOOLEAN DEFAULT TRUE, -- активна ли машина (может быть несколько машин)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, license_plate) -- один номер у одного пользователя
);

-- Включаем RLS для таблицы машин
ALTER TABLE public.user_cars ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы машин
CREATE POLICY "Users can view all cars" 
  ON public.user_cars 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage own cars" 
  ON public.user_cars 
  FOR ALL 
  USING (true);

-- Удаляем колонку role из профилей, так как роль теперь определяется наличием машины
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Обновляем таблицу rides - добавляем ссылку на конкретную машину
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS car_id UUID REFERENCES public.user_cars(id);

-- Создаем функцию для определения роли пользователя
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.user_cars 
      WHERE user_id = user_uuid AND is_active = true
    ) THEN 'driver'
    ELSE 'passenger'
  END;
$$;

-- Создаем view для профилей с автоматически определяемой ролью
CREATE OR REPLACE VIEW public.profiles_with_role AS
SELECT 
  p.*,
  public.get_user_role(p.id) as role,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.user_cars 
      WHERE user_id = p.id AND is_active = true
    ) THEN true
    ELSE false
  END as can_drive
FROM public.profiles p;
