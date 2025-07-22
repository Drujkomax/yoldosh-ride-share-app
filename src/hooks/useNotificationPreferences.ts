import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

export interface NotificationPreferences {
  id?: string;
  user_id: string;
  push_enabled: boolean;
  push_ride_updates: boolean;
  push_messages: boolean;
  push_promotions: boolean;
  email_enabled: boolean;
  email_ride_updates: boolean;
  email_messages: boolean;
  email_promotions: boolean;
  email_weekly_summary: boolean;
  sms_enabled: boolean;
  sms_ride_updates: boolean;
  sms_important_only: boolean;
  calls_enabled: boolean;
  calls_urgent_only: boolean;
  marketing_enabled: boolean;
}

export const useNotificationPreferences = () => {
  const { user } = useUser();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPreferences = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching notification preferences:', error);
        return;
      }

      if (data) {
        setPreferences(data);
      } else {
        // Create default preferences if none exist
        const defaultPreferences = {
          user_id: user.id,
          push_enabled: true,
          push_ride_updates: true,
          push_messages: true,
          push_promotions: false,
          email_enabled: true,
          email_ride_updates: true,
          email_messages: false,
          email_promotions: false,
          email_weekly_summary: true,
          sms_enabled: false,
          sms_ride_updates: false,
          sms_important_only: true,
          calls_enabled: false,
          calls_urgent_only: true,
          marketing_enabled: false,
        };
        
        const { data: newData, error: createError } = await supabase
          .from('user_notification_preferences')
          .insert(defaultPreferences)
          .select()
          .single();

        if (createError) {
          console.error('Error creating notification preferences:', createError);
        } else {
          setPreferences(newData);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user?.id || !preferences) return false;

    try {
      const { error } = await supabase
        .from('user_notification_preferences')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating notification preferences:', error);
        toast.error('Ошибка при сохранении настроек');
        return false;
      }

      setPreferences(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Настройки сохранены');
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error('Ошибка при сохранении настроек');
      return false;
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [user?.id]);

  return {
    preferences,
    isLoading,
    updatePreferences,
    refetch: fetchPreferences,
  };
};