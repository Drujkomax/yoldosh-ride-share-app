
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
  session: Session | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setUser(null);
      } else if (profile) {
        setUser({
          id: profile.id,
          phone: profile.phone,
          role: profile.role as UserRole,
          isVerified: profile.is_verified || false,
          name: profile.name,
          totalRides: profile.total_rides || 0,
          rating: profile.rating || undefined,
          avatarUrl: profile.avatar_url || undefined,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updatedUser: UserProfile | null) => {
    setUser(updatedUser);
  };

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        setUser: updateUser, 
        isAuthenticated: !!user && !!session,
        session,
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
