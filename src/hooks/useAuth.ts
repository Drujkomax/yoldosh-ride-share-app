
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
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

  const register = async (phone: string, name: string, _role?: string) => {
    setIsLoading(true);
    try {
      console.log('=== НАЧАЛО РЕГИСТРАЦИИ ===');
      console.log('useAuth - Данные для регистрации:', { phone, name });
      
      const userId = generateUUID();
      console.log('useAuth - Сгенерированный UUID:', userId);
      
      // Проверяем, не существует ли уже пользователь с таким телефоном
      console.log('useAuth - Проверяем существование пользователя...');
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id, phone')
        .eq('phone', phone)
        .maybeSingle();

      if (checkError) {
        console.error('useAuth - Ошибка при проверке существующего пользователя:', checkError);
      }

      if (existingUser) {
        console.log('useAuth - Пользователь уже существует:', existingUser);
        toast.error('Пользователь с таким номером уже зарегистрирован');
        return false;
      }

      console.log('useAuth - Пользователь не найден, создаем нового...');
      
      // Создаем профиль пользователя БЕЗ роли
      console.log('useAuth - Отправляем данные в Supabase profiles таблицу...');
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            phone,
            name,
            is_verified: false,
            total_rides: 0,
            rating: 0.0
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('useAuth - Ошибка при создании профиля:', error);
        console.error('useAuth - Детали ошибки:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        let errorMessage = 'Ошибка при регистрации';
        if (error.code === '23505') {
          errorMessage = 'Пользователь с таким номером уже существует';
        } else if (error.code === '23514') {
          errorMessage = 'Некорректные данные для регистрации';
        }
        
        toast.error(errorMessage);
        return false;
      }

      console.log('useAuth - Профиль успешно создан в базе данных:', profile);

      // Сохраняем пользователя в контексте БЕЗ роли
      const userProfile = {
        id: profile.id,
        phone: profile.phone,
        name: profile.name,
        isVerified: profile.is_verified || false,
        totalRides: profile.total_rides || 0,
        rating: profile.rating || 0.0,
        avatarUrl: profile.avatar_url
      };

      console.log('useAuth - Данные пользователя для контекста:', userProfile);
      setUser(userProfile);
      
      console.log('useAuth - Регистрация завершена успешно!');
      toast.success('Регистрация прошла успешно!');
      return true;
    } catch (error) {
      console.error('useAuth - Неожиданная ошибка при регистрации:', error);
      toast.error('Произошла неожиданная ошибка при регистрации');
      return false;
    } finally {
      setIsLoading(false);
      console.log('=== КОНЕЦ РЕГИСТРАЦИИ ===');
    }
  };

  const login = async (phone: string) => {
    setIsLoading(true);
    try {
      console.log('=== НАЧАЛО ВХОДА ===');
      console.log('useAuth - Попытка входа для телефона:', phone);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();

      if (error) {
        console.error('useAuth - Ошибка при поиске пользователя:', error);
        toast.error('Ошибка при поиске пользователя');
        return false;
      }

      if (!profile) {
        console.log('useAuth - Пользователь не найден для телефона:', phone);
        toast.error('Пользователь не найден');
        return false;
      }

      console.log('useAuth - Профиль найден:', profile);

      const userProfile = {
        id: profile.id,
        phone: profile.phone,
        name: profile.name,
        isVerified: profile.is_verified || false,
        totalRides: profile.total_rides || 0,
        rating: profile.rating || 0.0,
        avatarUrl: profile.avatar_url
      };

      setUser(userProfile);
      console.log('useAuth - Вход выполнен успешно!');
      toast.success('Вход выполнен успешно!');
      return true;
    } catch (error) {
      console.error('useAuth - Неожиданная ошибка при входе:', error);
      toast.error('Произошла неожиданная ошибка при входе');
      return false;
    } finally {
      setIsLoading(false);
      console.log('=== КОНЕЦ ВХОДА ===');
    }
  };

  const logout = () => {
    console.log('useAuth - Выход из системы');
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
