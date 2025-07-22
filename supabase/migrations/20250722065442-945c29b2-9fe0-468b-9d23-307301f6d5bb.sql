
-- Создание таблицы настроек уведомлений пользователей
CREATE TABLE public.user_notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  push_ride_updates BOOLEAN NOT NULL DEFAULT true,
  push_messages BOOLEAN NOT NULL DEFAULT true,
  push_promotions BOOLEAN NOT NULL DEFAULT false,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  email_ride_updates BOOLEAN NOT NULL DEFAULT true,
  email_messages BOOLEAN NOT NULL DEFAULT false,
  email_promotions BOOLEAN NOT NULL DEFAULT false,
  email_weekly_summary BOOLEAN NOT NULL DEFAULT true,
  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  sms_ride_updates BOOLEAN NOT NULL DEFAULT false,
  sms_important_only BOOLEAN NOT NULL DEFAULT true,
  calls_enabled BOOLEAN NOT NULL DEFAULT false,
  calls_urgent_only BOOLEAN NOT NULL DEFAULT true,
  marketing_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Создание таблицы сохраненных пассажиров
CREATE TABLE public.saved_passengers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  saved_passenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nickname TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, saved_passenger_id)
);

-- Создание таблицы настроек темы
CREATE TABLE public.user_theme_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme_mode VARCHAR(20) NOT NULL DEFAULT 'system', -- 'light', 'dark', 'system'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Создание таблицы настроек способов оплаты
CREATE TABLE public.user_payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  method_type VARCHAR(20) NOT NULL, -- 'card', 'bank', 'cash'
  method_name TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  details JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создание таблицы настроек способов получения выплат
CREATE TABLE public.user_payout_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  method_type VARCHAR(20) NOT NULL, -- 'bank', 'card', 'wallet'
  method_name TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  details JSONB NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включение RLS для всех таблиц
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_theme_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_payout_methods ENABLE ROW LEVEL SECURITY;

-- RLS политики для user_notification_preferences
CREATE POLICY "Users can view their own notification preferences"
  ON public.user_notification_preferences
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own notification preferences"
  ON public.user_notification_preferences
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own notification preferences"
  ON public.user_notification_preferences
  FOR UPDATE
  USING (user_id = auth.uid());

-- RLS политики для saved_passengers
CREATE POLICY "Users can view their own saved passengers"
  ON public.saved_passengers
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own saved passengers"
  ON public.saved_passengers
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own saved passengers"
  ON public.saved_passengers
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own saved passengers"
  ON public.saved_passengers
  FOR DELETE
  USING (user_id = auth.uid());

-- RLS политики для user_theme_preferences
CREATE POLICY "Users can view their own theme preferences"
  ON public.user_theme_preferences
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own theme preferences"
  ON public.user_theme_preferences
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own theme preferences"
  ON public.user_theme_preferences
  FOR UPDATE
  USING (user_id = auth.uid());

-- RLS политики для user_payment_methods
CREATE POLICY "Users can manage their own payment methods"
  ON public.user_payment_methods
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS политики для user_payout_methods
CREATE POLICY "Users can manage their own payout methods"
  ON public.user_payout_methods
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Триггеры для обновления updated_at
CREATE TRIGGER update_user_notification_preferences_updated_at
  BEFORE UPDATE ON public.user_notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_passengers_updated_at
  BEFORE UPDATE ON public.saved_passengers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_theme_preferences_updated_at
  BEFORE UPDATE ON public.user_theme_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_payment_methods_updated_at
  BEFORE UPDATE ON public.user_payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_payout_methods_updated_at
  BEFORE UPDATE ON public.user_payout_methods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
