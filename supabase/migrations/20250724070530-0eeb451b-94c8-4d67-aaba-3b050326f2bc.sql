-- Enable email authentication and update profiles table to work with Supabase Auth
-- First, let's add a password field to store hashed passwords for demo purposes
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add a trigger to automatically create profiles when users sign up through Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, name, email, is_verified, total_rides, rating)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    false,
    0,
    0.0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add RLS policy for auth users to access their own profiles
CREATE POLICY "Auth users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Auth users can update their own profile" ON public.profiles  
  FOR UPDATE USING (auth.uid() = id);

-- Update existing records to ensure they work with the new system
UPDATE public.profiles SET email = phone WHERE email IS NULL OR email = '';