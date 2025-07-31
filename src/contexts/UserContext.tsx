import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';

export type UserRole = 'driver' | 'passenger';

interface UserProfile {
  id: string;
  phone: string;
  email?: string;
  role?: UserRole; // Опциональная, определяется динамически
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
  session: Session | null;
  refreshUserRole: () => Promise<void>;
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Функция для обновления роли пользователя
  const refreshUserRole = async () => {
    if (!user?.id) return;
    
    try {
      console.log('UserContext - Обновление роли пользователя:', user.id);
      
      // Загружаем роль из profiles_with_role view
      const { data: profileWithRole, error } = await supabase
        .from('profiles_with_role')
        .select('role, can_drive')
        .eq('id', user.id)
        .single();
      
      if (profileWithRole && !error) {
        console.log('UserContext - Роль обновлена:', profileWithRole);
        setUser(prev => prev ? {
          ...prev,
          role: profileWithRole.role as UserRole,
          canDrive: profileWithRole.can_drive
        } : null);
      }
    } catch (error) {
      console.error('UserContext - Ошибка обновления роли:', error);
    }
  };

  useEffect(() => {
    const loadUserProfile = async (userId: string) => {
      try {
        console.log('UserContext - Загрузка профиля пользователя:', userId);
        
        // Загружаем профиль из таблицы profiles с принудительным обновлением
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (profile && !profileError) {
          console.log('UserContext - Профиль загружен из БД:', profile);
          console.log('UserContext - Avatar URL из БД:', profile.avatar_url);
          
          const completeUser: UserProfile = {
            id: profile.id,
            phone: profile.phone || '',
            name: profile.name || '',
            email: profile.email || '',
            isVerified: profile.is_verified || false,
            totalRides: profile.total_rides || 0,
            rating: profile.rating || 0.0,
            avatarUrl: profile.avatar_url // Всегда используем значение из БД
          };
          
          console.log('UserContext - Создан объект пользователя:', completeUser);
          
          // Устанавливаем пользователя ТОЛЬКО из данных БД (убираем localStorage как источник правды)
          setUser(completeUser);
          
          // localStorage используется только для кеширования, не как источник правды
          localStorage.setItem('yoldosh_user', JSON.stringify(completeUser));
        } else {
          console.error('UserContext - Ошибка загрузки профиля:', profileError);
          setUser(null);
          localStorage.removeItem('yoldosh_user');
        }
      } catch (error) {
        console.error('UserContext - Ошибка загрузки профиля:', error);
        setUser(null);
        localStorage.removeItem('yoldosh_user');
      }
    };

    const initializeAuth = async () => {
      try {
        console.log('UserContext - Инициализация аутентификации...');
        
        // Сначала проверяем активную сессию в Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('UserContext - Ошибка получения сессии:', sessionError);
        }
        
        setSession(session);
        
        if (session?.user) {
          console.log('UserContext - Найдена активная сессия Supabase:', session.user.id);
          await loadUserProfile(session.user.id);
        } else {
          console.log('UserContext - Нет активной сессии Supabase');
          setUser(null);
        }
      } catch (error) {
        console.error('UserContext - Ошибка инициализации:', error);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Подписываемся на изменения аутентификации Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('UserContext - Auth state changed:', event, newSession?.user?.id);
        
        setSession(newSession);
        
        if (newSession?.user) {
          // При любом событии входа загружаем профиль заново
          console.log('UserContext - Загружаем профиль после события:', event);
          try {
            await loadUserProfile(newSession.user.id);
          } catch (error) {
            console.error('UserContext - Ошибка загрузки профиля при аутентификации:', error);
          }
          setLoading(false); // Всегда завершаем загрузку
        } else if (event === 'SIGNED_OUT') {
          // Пользователь вышел из системы
          console.log('UserContext - Пользователь вышел из системы');
          setUser(null);
          localStorage.removeItem('yoldosh_user');
          setLoading(false);
        } else {
          // Для любых других событий тоже завершаем загрузку
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateUser = async (updatedUser: UserProfile | null) => {
    console.log('UserContext - Обновление пользователя:', updatedUser);
    
    if (!updatedUser) {
      setUser(null);
      localStorage.removeItem('yoldosh_user');
      return;
    }
    
    // Если это новый пользователь без правильного UUID, генерируем новый
    if (!updatedUser.id || !isValidUUID(updatedUser.id)) {
      updatedUser = {
        ...updatedUser,
        id: generateUUID()
      };
      console.log('UserContext - Сгенерирован новый UUID для пользователя:', updatedUser.id);
    }
    
    // Нормализуем данные пользователя
    const normalizedUser = {
      id: updatedUser.id,
      phone: updatedUser.phone || '',
      name: updatedUser.name || '',
      isVerified: updatedUser.isVerified || false,
      totalRides: updatedUser.totalRides || 0,
      rating: updatedUser.rating || 0.0,
      avatarUrl: updatedUser.avatarUrl // Сохраняем avatarUrl
    };

    console.log('UserContext - Нормализованный пользователь:', normalizedUser);

    // Обновляем профиль в Supabase ТОЛЬКО если есть изменения
    try {
      const updateData = {
        id: normalizedUser.id,
        name: normalizedUser.name,
        phone: normalizedUser.phone,
        is_verified: normalizedUser.isVerified,
        total_rides: normalizedUser.totalRides,
        rating: normalizedUser.rating,
        // КРИТИЧЕСКИ ВАЖНО: включаем avatar_url только если он есть
        ...(normalizedUser.avatarUrl && { avatar_url: normalizedUser.avatarUrl })
      };
      
      console.log('UserContext - Обновляем БД с данными:', updateData);

      const { error } = await supabase
        .from('profiles')
        .upsert([updateData]);

      if (error) {
        console.error('UserContext - Ошибка обновления профиля в БД:', error);
      } else {
        console.log('UserContext - Профиль успешно обновлен в БД');
        
        // После успешного обновления в БД, перезагружаем профиль из БД
        if (session?.user?.id) {
          const { data: freshProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (freshProfile) {
            console.log('UserContext - Обновленный профиль из БД:', freshProfile);
            const freshUser: UserProfile = {
              id: freshProfile.id,
              phone: freshProfile.phone || '',
              name: freshProfile.name || '',
              email: freshProfile.email || '',
              isVerified: freshProfile.is_verified || false,
              totalRides: freshProfile.total_rides || 0,
              rating: freshProfile.rating || 0.0,
              avatarUrl: freshProfile.avatar_url // Используем свежие данные из БД
            };
            
            setUser(freshUser);
            localStorage.setItem('yoldosh_user', JSON.stringify(freshUser));
            
            // Инвалидируем кеш профиля чтобы данные обновились
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            
            // Обновляем роль после изменения профиля
            await refreshUserRole();
            return;
          }
        }
      }
    } catch (error) {
      console.error('UserContext - Ошибка при работе с Supabase:', error);
    }
    
    // Fallback - устанавливаем локальные данные если БД недоступна
    setUser(normalizedUser);
    localStorage.setItem('yoldosh_user', JSON.stringify(normalizedUser));
  };

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        setUser: updateUser, 
        isAuthenticated: !!session?.user,
        loading,
        session,
        refreshUserRole
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
