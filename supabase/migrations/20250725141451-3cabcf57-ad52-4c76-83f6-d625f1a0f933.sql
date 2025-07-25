-- Восстанавливаем avatar_url, который был затерт при логине
UPDATE profiles 
SET avatar_url = 'https://qfqzfazuwxgasygxhlfq.supabase.co/storage/v1/object/public/avatars/954a05d1-e925-4bfa-bd4b-809c8429cbdb/1753432036691.jpg',
    updated_at = now()
WHERE id = '954a05d1-e925-4bfa-bd4b-809c8429cbdb' AND avatar_url IS NULL;