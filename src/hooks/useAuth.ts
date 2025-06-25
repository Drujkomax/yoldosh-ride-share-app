
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);

  const signUp = async (phone: string, name: string, role: 'driver' | 'passenger') => {
    setLoading(true);
    try {
      // For now, we'll use email-based signup with phone as username
      // In production, you'd implement proper SMS authentication
      const email = `${phone.replace(/\D/g, '')}@yoldosh.app`;
      const password = 'temp123'; // In production, generate a secure password or use OTP
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            phone,
            name,
            role,
          },
        },
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (phone: string) => {
    setLoading(true);
    try {
      const email = `${phone.replace(/\D/g, '')}@yoldosh.app`;
      const password = 'temp123';
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Signin error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из аккаунта",
      });
    } catch (error: any) {
      console.error('Signout error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из аккаунта",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: {
    name?: string;
    phone?: string;
    avatar_url?: string;
  }) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    signUp,
    signIn,
    signOut,
    updateProfile,
    loading,
  };
};
