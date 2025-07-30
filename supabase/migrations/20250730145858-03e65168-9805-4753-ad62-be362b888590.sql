-- Update user_theme_preferences table to support only light/dark themes
-- First update any existing 'system' entries to 'light' as default
UPDATE public.user_theme_preferences 
SET theme_mode = 'light' 
WHERE theme_mode = 'system';

-- Then update the constraint to only allow light/dark
ALTER TABLE public.user_theme_preferences 
DROP CONSTRAINT IF EXISTS user_theme_preferences_theme_mode_check;

ALTER TABLE public.user_theme_preferences 
ADD CONSTRAINT user_theme_preferences_theme_mode_check 
CHECK (theme_mode IN ('light', 'dark'));

-- Update default value
ALTER TABLE public.user_theme_preferences 
ALTER COLUMN theme_mode SET DEFAULT 'light';