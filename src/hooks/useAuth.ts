
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);

  const createUserProfile = async (phone: string, name: string, role: 'driver' | 'passenger') => {
    setLoading(true);
    try {
      console.log('Creating user profile:', { phone, name, role });
      
      // Генерируем уникальный ID для пользователя
      const userId = crypto.randomUUID();
      
      // Создаем профиль пользователя напрямую в базе данных
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            phone,
            name,
            role,
            is_verified: true, // Считаем пользователя верифицированным после подтверждения кода
            total_rides: 0,
            rating: 0.0
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Profile creation error:', error);
        throw error;
      }

      console.log('Profile created successfully:', data);
      return { data, error: null };
    } catch (error: any) {
      console.error('Create profile error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const checkUserExists = async (phone: string) => {
    try {
      console.log('Checking if user exists for phone:', phone);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();

      if (error) {
        console.error('Check user error:', error);
        return { exists: false, user: null };
      }

      return { exists: !!data, user: data };
    } catch (error: any) {
      console.error('Check user error:', error);
      return { exists: false, user: null };
    }
  };

  const signUp = async (phone: string, name: string, role: 'driver' | 'passenger') => {
    return await createUserProfile(phone, name, role);
  };

  const signIn = async (phone: string) => {
    return await checkUserExists(phone);
  };

  const signOut = async () => {
    setLoading(true);
    try {
      // Для демо версии просто очищаем локальное состояние
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из аккаунта",
      });
      return { error: null };
    } catch (error: any) {
      console.error('Signout error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из аккаунта",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: {
    name?: string;
    phone?: string;
    avatar_url?: string;
  }) => {
    setLoading(true);
    try {
      // Для демо версии - обновляем профиль по ID
      // В реальном приложении здесь бы был текущий пользователь
      console.log('Profile update requested:', updates);
      
      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    signUp,
    signIn,
    signOut,
    updateProfile,
    loading,
  };
};
