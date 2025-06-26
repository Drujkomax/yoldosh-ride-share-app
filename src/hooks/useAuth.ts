
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser, UserRole } from '@/contexts/UserContext';
import { toast } from 'sonner';

// Функция для генерации UUID v4
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const useAuth = () => {
  const { setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const register = async (phone: string, name: string, role: UserRole) => {
    setIsLoading(true);
    try {
      console.log('Attempting to register user:', { phone, name, role });
      
      const userId = generateUUID();
      console.log('Generated UUID:', userId);
      
      // Создаем профиль пользователя в базе данных
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            phone,
            name,
            role,
            is_verified: false,
            total_rides: 0,
            rating: 0.0
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Registration error:', error);
        toast.error('Ошибка при регистрации');
        return false;
      }

      console.log('Profile created successfully:', profile);

      // Сохраняем пользователя в контексте
      const userProfile = {
        id: profile.id,
        phone: profile.phone,
        name: profile.name,
        role: profile.role as UserRole,
        isVerified: profile.is_verified || false,
        totalRides: profile.total_rides || 0,
        rating: profile.rating || 0.0,
        avatarUrl: profile.avatar_url
      };

      setUser(userProfile);
      toast.success('Регистрация прошла успешно!');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Ошибка при регистрации');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting to login user:', phone);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', phone)
        .single();

      if (error) {
        console.error('Login error:', error);
        toast.error('Пользователь не найден');
        return false;
      }

      console.log('Profile found:', profile);

      const userProfile = {
        id: profile.id,
        phone: profile.phone,
        name: profile.name,
        role: profile.role as UserRole,
        isVerified: profile.is_verified || false,
        totalRides: profile.total_rides || 0,
        rating: profile.rating || 0.0,
        avatarUrl: profile.avatar_url
      };

      setUser(userProfile);
      toast.success('Вход выполнен успешно!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Ошибка при входе');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    toast.success('Выход выполнен успешно!');
  };

  return {
    register,
    login,
    logout,
    isLoading,
  };
};
