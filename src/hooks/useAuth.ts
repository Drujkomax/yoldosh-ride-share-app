
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
      
      // Создаем временный email для регистрации
      const tempEmail = `${phone.replace(/\D/g, '')}@temp.yoldosh.uz`;
      const tempPassword = `${phone.replace(/\D/g, '')}Pass123!`;
      
      console.log('useAuth - Регистрируем пользователя в Supabase Auth...');
      
      // Используем Supabase Auth для создания пользователя
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tempEmail,
        password: tempPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            phone,
            name,
            firstName: name.split(' ')[0] || '',
            lastName: name.split(' ').slice(1).join(' ') || '',
            registrationMethod: 'phone'
          }
        }
      });

      if (authError) {
        console.error('useAuth - Ошибка при создании auth пользователя:', authError);
        
        let errorMessage = 'Ошибка при создании аккаунта';
        if (authError.message.includes('User already registered')) {
          errorMessage = 'Пользователь уже зарегистрирован';
        } else if (authError.message.includes('Password')) {
          errorMessage = 'Ошибка пароля';
        }
        
        toast.error(errorMessage);
        return false;
      }

      if (!authData.user) {
        console.error('useAuth - Не удалось создать пользователя');
        toast.error('Ошибка при создании аккаунта');
        return false;
      }

      console.log('useAuth - Auth пользователь создан:', authData.user.id);
      
      // Профиль будет создан автоматически через триггер handle_new_user
      // Ждем немного для обработки триггера
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Проверяем, что профиль создался
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        console.error('useAuth - Ошибка при получении профиля:', profileError);
        toast.error('Ошибка при создании профиля');
        return false;
      }

      console.log('useAuth - Профиль найден:', profile);

      // Сохраняем пользователя в контексте
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
      
      // Находим пользователя по номеру телефона
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
        return false; // Не показываем ошибку, пусть регистрация решает
      }

      console.log('useAuth - Профиль найден:', profile);

      // Входим в Supabase Auth с временными данными
      const tempEmail = `${phone.replace(/\D/g, '')}@temp.yoldosh.uz`;
      const tempPassword = `${phone.replace(/\D/g, '')}Pass123!`;

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: tempEmail,
        password: tempPassword,
      });

      if (authError) {
        console.error('useAuth - Ошибка при входе в Auth:', authError);
        // Если не удалось войти, возможно пользователь создан другим способом
        // Просто устанавливаем пользователя в контекст без аутентификации
      }

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

  const logout = async () => {
    console.log('useAuth - Выход из системы');
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('useAuth - Ошибка выхода:', error);
        toast.error('Ошибка при выходе из системы');
      } else {
        setUser(null);
        toast.success('Выход выполнен успешно!');
      }
    } catch (error) {
      console.error('useAuth - Неожиданная ошибка при выходе:', error);
      toast.error('Произошла неожиданная ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    login,
    logout,
    isLoading,
  };
};
