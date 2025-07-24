import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

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
        // Загружаем профиль из таблицы profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (profile && !profileError) {
          console.log('UserContext - Профиль загружен из БД:', profile);
          const completeUser: UserProfile = {
            id: profile.id,
            phone: profile.phone || '',
            name: profile.name || '',
            email: profile.email || '',
            isVerified: profile.is_verified || false,
            totalRides: profile.total_rides || 0,
            rating: profile.rating || 0.0,
            avatarUrl: profile.avatar_url
          };
          
          // Если пользователь уже существует, обновляем только данные из БД (включая avatarUrl)
          setUser(prev => {
            if (prev) {
              const updatedUser = {
                ...prev,
                ...completeUser // Перезаписываем всеми данными из БД, включая avatarUrl
              };
              localStorage.setItem('yoldosh_user', JSON.stringify(updatedUser));
              return updatedUser;
            } else {
              localStorage.setItem('yoldosh_user', JSON.stringify(completeUser));
              return completeUser;
            }
          });
        } else {
          console.error('UserContext - Ошибка загрузки профиля:', profileError);
          setUser(null);
        }
      } catch (error) {
        console.error('UserContext - Ошибка загрузки профиля:', error);
        setUser(null);
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
        
        if (newSession?.user && event === 'SIGNED_IN') {
          // Пользователь вошел в систему
          setTimeout(async () => {
            await loadUserProfile(newSession.user.id);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          // Пользователь вышел из системы
          setUser(null);
          localStorage.removeItem('yoldosh_user');
        }
      }
    );

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

      // Обновляем профиль в Supabase и получаем актуальную роль
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert([{
            id: updatedUser.id,
            name: updatedUser.name,
            phone: updatedUser.phone,
            is_verified: updatedUser.isVerified,
            total_rides: updatedUser.totalRides,
            rating: updatedUser.rating || 0.0,
            avatar_url: updatedUser.avatarUrl // Добавляем avatar_url в обновление
          }]);

        if (error) {
          console.error('UserContext - Ошибка обновления профиля:', error);
        } else {
          console.log('UserContext - Профиль успешно обновлен в Supabase');
          // Обновляем роль после изменения профиля
          await refreshUserRole();
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
