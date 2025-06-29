
-- Добавляем дополнительные поля в таблицу profiles для onboarding
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name VARCHAR;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name VARCHAR;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email VARCHAR;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS privacy_consent BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS registration_method VARCHAR DEFAULT 'email';

-- Создаем индекс для email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Добавляем ограничение уникальности для email (если не существует)
ALTER TABLE public.profiles ADD CONSTRAINT unique_email UNIQUE (email);
