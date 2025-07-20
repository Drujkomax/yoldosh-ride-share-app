
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'driver' | 'passenger';

interface UserProfile {
  id: string;
  phone: string;
  role?: UserRole; // Теперь опциональная, определяется динамически
  canDrive?: boolean; // Может ли пользователь водить (есть ли машина)
  isVerified: boolean;
  name?: string;
  totalRides: number;
  rating?: number;
  avatarUrl?: string;
}

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Функция для генерации UUID v4
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Функция для проверки валидности UUID
const isValidUUID = (str: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        console.log('UserContext - Проверяем Supabase сессию...');
        
        // Сначала проверяем активную сессию в Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('UserContext - Ошибка получения сессии:', sessionError);
        }
        
        if (session?.user) {
          console.log('UserContext - Найдена активная сессия Supabase:', session.user.id);
          
          // Загружаем профиль из базы данных
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile && !profileError) {
            console.log('UserContext - Профиль загружен из БД:', profile);
            const completeUser: UserProfile = {
              id: profile.id,
              phone: profile.phone || '',
              name: profile.name || '',
              isVerified: profile.is_verified || false,
              totalRides: profile.total_rides || 0,
              rating: profile.rating || 0.0,
              avatarUrl: profile.avatar_url
            };
            
            setUser(completeUser);
            
            // Синхронизируем с localStorage
            localStorage.setItem('yoldosh_user', JSON.stringify(completeUser));
            setLoading(false);
            return;
          }
        }
        
        // Если нет активной сессии Supabase, проверяем localStorage
        console.log('UserContext - Нет активной сессии Supabase, проверяем localStorage');
        const storedUser = localStorage.getItem('yoldosh_user');
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('UserContext - Найден пользователь в localStorage:', parsedUser);
          
          // Проверяем валидность UUID
          if (!parsedUser.id || !isValidUUID(parsedUser.id)) {
            console.log('UserContext - Некорректный UUID, генерируем новый');
            parsedUser.id = generateUUID();
            localStorage.setItem('yoldosh_user', JSON.stringify(parsedUser));
            console.log('UserContext - Новый UUID сгенерирован:', parsedUser.id);
          }
          
          const completeUser = {
            id: parsedUser.id,
            phone: parsedUser.phone || '',
            name: parsedUser.name || '',
            isVerified: parsedUser.isVerified || false,
            totalRides: parsedUser.totalRides || 0,
            rating: parsedUser.rating || 0.0,
            avatarUrl: parsedUser.avatarUrl
          };
          
          console.log('UserContext - Данные пользователя нормализованы:', completeUser);
          
          // Проверяем, существует ли профиль в Supabase, если нет - создаем
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', completeUser.id)
            .single();

          if (!existingProfile) {
            console.log('UserContext - Создаем профиль в Supabase');
            const { error } = await supabase
              .from('profiles')
              .insert([{
                id: completeUser.id,
                name: completeUser.name,
                phone: completeUser.phone,
                is_verified: completeUser.isVerified,
                total_rides: completeUser.totalRides,
                rating: completeUser.rating || 0.0
              }]);

            if (error) {
              console.error('UserContext - Ошибка создания профиля:', error);
            } else {
              console.log('UserContext - Профиль успешно создан в Supabase');
            }
          } else {
            console.log('UserContext - Профиль уже существует в Supabase');
          }
          
          setUser(completeUser);
        } else {
          console.log('UserContext - Пользователь не найден нигде');
        }
      } catch (error) {
        console.error('UserContext - Ошибка при загрузке пользователя:', error);
        localStorage.removeItem('yoldosh_user');
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();

    // Подписываемся на изменения аутентификации Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('UserContext - Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        // Пользователь вошел в систему через Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          const completeUser: UserProfile = {
            id: profile.id,
            phone: profile.phone || '',
            name: profile.name || '',
            isVerified: profile.is_verified || false,
            totalRides: profile.total_rides || 0,
            rating: profile.rating || 0.0,
            avatarUrl: profile.avatar_url
          };
          
          setUser(completeUser);
          localStorage.setItem('yoldosh_user', JSON.stringify(completeUser));
        }
      } else if (event === 'SIGNED_OUT') {
        // Пользователь вышел из системы
        setUser(null);
        localStorage.removeItem('yoldosh_user');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateUser = async (updatedUser: UserProfile | null) => {
    console.log('UserContext - Обновление пользователя:', updatedUser);
    
    // Если это новый пользователь без правильного UUID, генерируем новый
    if (updatedUser && (!updatedUser.id || !isValidUUID(updatedUser.id))) {
      updatedUser = {
        ...updatedUser,
        id: generateUUID()
      };
      console.log('UserContext - Сгенерирован новый UUID для пользователя:', updatedUser.id);
    }
    
    // Нормализуем данные пользователя БЕЗ роли
    if (updatedUser) {
      updatedUser = {
        id: updatedUser.id,
        phone: updatedUser.phone || '',
        name: updatedUser.name || '',
        isVerified: updatedUser.isVerified || false,
        totalRides: updatedUser.totalRides || 0,
        rating: updatedUser.rating || 0.0,
        avatarUrl: updatedUser.avatarUrl
      };

      console.log('UserContext - Пользователь обновлен без роли:', updatedUser);

      // Обновляем или создаем профиль в Supabase
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert([{
            id: updatedUser.id,
            name: updatedUser.name,
            phone: updatedUser.phone,
            is_verified: updatedUser.isVerified,
            total_rides: updatedUser.totalRides,
            rating: updatedUser.rating || 0.0
          }]);

        if (error) {
          console.error('UserContext - Ошибка обновления профиля:', error);
        } else {
          console.log('UserContext - Профиль успешно обновлен в Supabase');
        }
      } catch (error) {
        console.error('UserContext - Ошибка при работе с Supabase:', error);
      }
    }
    
    setUser(updatedUser);
    
    // Сохраняем в localStorage
    if (updatedUser) {
      console.log('UserContext - Сохранение пользователя в localStorage');
      localStorage.setItem('yoldosh_user', JSON.stringify(updatedUser));
    } else {
      console.log('UserContext - Удаление пользователя из localStorage');
      localStorage.removeItem('yoldosh_user');
    }
  };

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        setUser: updateUser, 
        isAuthenticated: !!user,
        loading
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
