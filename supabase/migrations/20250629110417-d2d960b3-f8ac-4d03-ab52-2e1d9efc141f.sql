
-- Создание таблицы популярных остановок
CREATE TABLE public.popular_stops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_name VARCHAR(100) NOT NULL,
  stop_name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC(10, 8) NOT NULL,
  longitude NUMERIC(11, 8) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  popularity_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создание таблицы часто используемых локаций пользователя
CREATE TABLE public.user_frequent_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  location_name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  usage_count INTEGER NOT NULL DEFAULT 1,
  last_used TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  location_type VARCHAR(20) NOT NULL DEFAULT 'frequent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Обновление таблицы rides для лучшей поддержки промежуточных остановок
ALTER TABLE public.rides 
ADD COLUMN IF NOT EXISTS intermediate_stops_addresses JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS intermediate_stops_coordinates JSONB DEFAULT '[]'::jsonb;

-- Создание индексов для оптимизации производительности
CREATE INDEX IF NOT EXISTS idx_popular_stops_city ON public.popular_stops(city_name);
CREATE INDEX IF NOT EXISTS idx_popular_stops_category ON public.popular_stops(category);
CREATE INDEX IF NOT EXISTS idx_popular_stops_popularity ON public.popular_stops(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_frequent_locations_user_id ON public.user_frequent_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_frequent_locations_type ON public.user_frequent_locations(location_type);
CREATE INDEX IF NOT EXISTS idx_rides_from_to_date ON public.rides(from_city, to_city, departure_date);

-- Включение RLS для новых таблиц
ALTER TABLE public.user_frequent_locations ENABLE ROW LEVEL SECURITY;

-- Политики RLS для user_frequent_locations
CREATE POLICY "Users can view their own frequent locations" 
  ON public.user_frequent_locations 
  FOR SELECT 
  USING (auth.uid()::text = user_id::text OR auth.uid() IS NULL);

CREATE POLICY "Users can create their own frequent locations" 
  ON public.user_frequent_locations 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own frequent locations" 
  ON public.user_frequent_locations 
  FOR UPDATE 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own frequent locations" 
  ON public.user_frequent_locations 
  FOR DELETE 
  USING (auth.uid()::text = user_id::text);

-- Политики для popular_stops (только чтение для всех)
ALTER TABLE public.popular_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view popular stops" 
  ON public.popular_stops 
  FOR SELECT 
  TO public
  USING (true);

-- Заполнение популярных остановок для основных городов Узбекистана
INSERT INTO public.popular_stops (city_name, stop_name, address, latitude, longitude, category, popularity_score) VALUES
-- Ташкент
('Ташкент', 'Автовокзал Ташкент', 'ул. Афросиаб, Ташкент', 41.2856, 69.2034, 'transport_hub', 100),
('Ташкент', 'Железнодорожный вокзал', 'пл. Амира Темура, Ташкент', 41.2979, 69.2784, 'transport_hub', 95),
('Ташкент', 'ТРЦ Next', 'ул. Шота Руставели, Ташкент', 41.3123, 69.2797, 'shopping', 85),
('Ташкент', 'Аэропорт Ташкент', 'Юнусабадский район, Ташкент', 41.2579, 69.2811, 'transport_hub', 90),
('Ташкент', 'Площадь Независимости', 'пл. Мустакиллик, Ташкент', 41.2995, 69.2401, 'landmark', 80),

-- Самарканд
('Самарканд', 'Автовокзал Самарканд', 'ул. Гагарина, Самарканд', 39.6678, 66.9456, 'transport_hub', 95),
('Самарканд', 'Регистан', 'площадь Регистан, Самарканд', 39.6542, 66.9756, 'landmark', 100),
('Самарканд', 'Железнодорожный вокзал', 'ул. Вокзальная, Самарканд', 39.6234, 66.9123, 'transport_hub', 85),

-- Бухара
('Бухара', 'Автовокзал Бухара', 'ул. Алишера Навои, Бухара', 39.7689, 64.4123, 'transport_hub', 90),
('Бухара', 'Старый город', 'Историческая часть, Бухара', 39.7747, 64.4286, 'landmark', 95),

-- Андижан
('Андижан', 'Автовокзал Андижан', 'ул. Бабура, Андижан', 40.7856, 72.3567, 'transport_hub', 85),
('Андижан', 'Центральный базар', 'ул. Навои, Андижан', 40.7821, 72.3442, 'shopping', 80),

-- Фергана
('Фергана', 'Автовокзал Фергана', 'ул. Мустакиллик, Фергана', 40.3789, 71.7923, 'transport_hub', 80),
('Фергана', 'Парк Алишера Навои', 'ул. Алишера Навои, Фергана', 40.3834, 71.7842, 'landmark', 75),

-- Наманган
('Наманган', 'Автовокзал Наманган', 'ул. Туркистон, Наманган', 41.0123, 71.6845, 'transport_hub', 80),
('Наманган', 'Центральная площадь', 'пл. Мустакиллик, Наманган', 41.0004, 71.6726, 'landmark', 70);
