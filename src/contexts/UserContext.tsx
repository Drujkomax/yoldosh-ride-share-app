
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'driver' | 'passenger';

interface User {
  id: string;
  phone: string;
  role: UserRole;
  isVerified: boolean;
  name?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        setUser, 
        isAuthenticated: !!user 
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
