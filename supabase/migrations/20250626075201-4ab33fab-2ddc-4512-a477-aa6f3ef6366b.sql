
-- Удаляем существующие политики
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Создаем новые политики для демо-версии
CREATE POLICY "Anyone can create profile" ON public.profiles
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read profiles" ON public.profiles
FOR SELECT USING (true);

CREATE POLICY "Anyone can update profiles" ON public.profiles
FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete profiles" ON public.profiles
FOR DELETE USING (true);
