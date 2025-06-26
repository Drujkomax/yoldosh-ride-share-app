
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'driver' | 'passenger';

interface UserProfile {
  id: string;
  phone: string;
  role: UserRole;
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
    // Загружаем пользователя из localStorage при инициализации
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem('yoldosh_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('UserContext - Loaded user from localStorage:', parsedUser);
          
          // Проверяем валидность UUID
          if (!parsedUser.id || !isValidUUID(parsedUser.id)) {
            console.log('UserContext - Invalid UUID detected, generating new one');
            parsedUser.id = generateUUID();
            localStorage.setItem('yoldosh_user', JSON.stringify(parsedUser));
          }
          
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('UserContext - Error loading user from localStorage:', error);
        localStorage.removeItem('yoldosh_user');
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  const updateUser = (updatedUser: UserProfile | null) => {
    console.log('UserContext - Updating user:', updatedUser);
    
    // Если это новый пользователь без правильного UUID, генерируем новый
    if (updatedUser && (!updatedUser.id || !isValidUUID(updatedUser.id))) {
      updatedUser = {
        ...updatedUser,
        id: generateUUID()
      };
      console.log('UserContext - Generated new UUID for user:', updatedUser.id);
    }
    
    setUser(updatedUser);
    
    // Сохраняем в localStorage
    if (updatedUser) {
      console.log('UserContext - Saving user to localStorage:', updatedUser);
      localStorage.setItem('yoldosh_user', JSON.stringify(updatedUser));
    } else {
      console.log('UserContext - Removing user from localStorage');
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
