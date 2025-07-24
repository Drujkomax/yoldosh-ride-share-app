-- Improve the handle_new_user trigger to handle missing profile cases and better data extraction
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if profile already exists to avoid duplicates
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Insert new profile with better data extraction from user metadata
  INSERT INTO public.profiles (
    id, 
    phone, 
    name, 
    email, 
    first_name,
    last_name,
    is_verified, 
    total_rides, 
    rating,
    registration_method,
    privacy_consent,
    marketing_consent,
    onboarding_completed
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(
      NEW.raw_user_meta_data->>'name', 
      CONCAT(
        COALESCE(NEW.raw_user_meta_data->>'firstName', NEW.raw_user_meta_data->>'first_name', ''),
        ' ',
        COALESCE(NEW.raw_user_meta_data->>'lastName', NEW.raw_user_meta_data->>'last_name', '')
      )
    ),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'firstName', NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastName', NEW.raw_user_meta_data->>'last_name', ''),
    false,
    0,
    0.0,
    COALESCE(NEW.raw_user_meta_data->>'registrationMethod', 'email'),
    true,
    COALESCE((NEW.raw_user_meta_data->>'marketingConsent')::boolean, false),
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;