-- Удаляем все существующие политики
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can view all avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- Создаем простые публичные политики для bucket avatars
CREATE POLICY "Anyone can upload to avatars bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can view avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can update in avatars bucket" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can delete from avatars bucket" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars');