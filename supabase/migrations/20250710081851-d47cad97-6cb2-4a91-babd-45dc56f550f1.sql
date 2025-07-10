-- Удалим дублирующиеся внешние ключи
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS fk_bookings_passenger;
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS fk_bookings_ride;
ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS fk_chats_participant1;
ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS fk_chats_participant2;
ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS fk_chats_ride;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS fk_messages_chat;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS fk_messages_sender;

-- Добавим недостающие триггеры для автоматического обновления timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Добавим триггеры для обновления updated_at на всех таблицах
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_car_photos_updated_at ON public.car_photos;
CREATE TRIGGER update_car_photos_updated_at
    BEFORE UPDATE ON public.car_photos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_ride_requests_updated_at ON public.ride_requests;
CREATE TRIGGER update_ride_requests_updated_at
    BEFORE UPDATE ON public.ride_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_rides_updated_at ON public.rides;
CREATE TRIGGER update_rides_updated_at
    BEFORE UPDATE ON public.rides
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_cars_updated_at ON public.user_cars;
CREATE TRIGGER update_user_cars_updated_at
    BEFORE UPDATE ON public.user_cars
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_frequent_locations_updated_at ON public.user_frequent_locations;
CREATE TRIGGER update_user_frequent_locations_updated_at
    BEFORE UPDATE ON public.user_frequent_locations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_notifications_updated_at ON public.user_notifications;
CREATE TRIGGER update_user_notifications_updated_at
    BEFORE UPDATE ON public.user_notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Добавим недостающие триггеры для бронирований
DROP TRIGGER IF EXISTS booking_confirmation_trigger ON public.bookings;
CREATE TRIGGER booking_confirmation_trigger
    AFTER UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_ride_seats_on_booking_confirmation();

DROP TRIGGER IF EXISTS create_chat_on_booking_confirmed ON public.bookings;
CREATE TRIGGER create_chat_on_booking_confirmed
    AFTER UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.create_chat_on_booking_confirmation();