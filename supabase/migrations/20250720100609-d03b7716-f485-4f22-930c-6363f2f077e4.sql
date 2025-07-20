-- Удаляем старые политики для bookings
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;

-- Создаем новые политики, которые работают с кастомной аутентификацией
CREATE POLICY "Anyone can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view bookings" 
ON public.bookings 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update bookings" 
ON public.bookings 
FOR UPDATE 
USING (true);