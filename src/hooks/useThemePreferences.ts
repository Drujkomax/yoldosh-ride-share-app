import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemePreferences {
  id?: string;
  user_id: string;
  theme_mode: ThemeMode;
}

export const useThemePreferences = () => {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState<ThemePreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPreferences = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_theme_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching theme preferences:', error);
        return;
      }

      if (data) {
        setPreferences(data as ThemePreferences);
        // Sync with theme context if different (only for light/dark, not system)
        if (data.theme_mode !== 'system' && data.theme_mode !== theme) {
          setTheme(data.theme_mode as 'light' | 'dark');
        }
      } else {
        // Create default preferences if none exist
        const defaultPreferences = {
          user_id: user.id,
          theme_mode: theme as ThemeMode,
        };
        
        const { data: newData, error: createError } = await supabase
          .from('user_theme_preferences')
          .insert(defaultPreferences)
          .select()
          .single();

        if (createError) {
          console.error('Error creating theme preferences:', createError);
        } else {
          setPreferences(newData as ThemePreferences);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateThemeMode = async (themeMode: ThemeMode) => {
    if (!user?.id) return false;

    try {
      // Update theme context immediately for better UX (only for light/dark)
      if (themeMode !== 'system') {
        setTheme(themeMode as 'light' | 'dark');
      }

      if (preferences) {
        // Update existing preferences
        const { error } = await supabase
          .from('user_theme_preferences')
          .update({ theme_mode: themeMode })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating theme preferences:', error);
          // Revert theme if update failed (only for light/dark)
          if (preferences.theme_mode !== 'system') {
            setTheme(preferences.theme_mode as 'light' | 'dark');
          }
          toast.error('Ошибка при сохранении темы');
          return false;
        }
      } else {
        // Create new preferences
        const { data, error } = await supabase
          .from('user_theme_preferences')
          .insert({
            user_id: user.id,
            theme_mode: themeMode,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating theme preferences:', error);
          toast.error('Ошибка при сохранении темы');
          return false;
        }

        setPreferences(data as ThemePreferences);
      }

      setPreferences(prev => prev ? { ...prev, theme_mode: themeMode } : null);
      return true;
    } catch (error) {
      console.error('Error updating theme preferences:', error);
      toast.error('Ошибка при сохранении темы');
      return false;
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [user?.id]);

  return {
    preferences,
    isLoading,
    currentTheme: theme,
    updateThemeMode,
    refetch: fetchPreferences,
  };
};