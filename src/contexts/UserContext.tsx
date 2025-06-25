
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

export type UserRole = 'driver' | 'passenger';

// Re-export the auth hook data
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();

  return (
    <UserContext.Provider value={auth}>
      {children}
    </UserContext.Provider>
  );
};

const UserContext = createContext<ReturnType<typeof useAuth> | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
