
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: 'driver' | 'passenger';
  is_verified: boolean;
  total_rides: number;
  rating: number;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CarInfo {
  model: string;
  color: string;
}

export const useProfile = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('useProfile - Загрузка профиля для пользователя:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('useProfile - Ошибка загрузки профиля:', error);
        throw error;
      }

      console.log('useProfile - Профиль загружен:', data);
      return data as UserProfile;
    },
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!user?.id) throw new Error('Пользователь не найден');
      
      console.log('useProfile - Обновление профиля:', updates);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('useProfile - Ошибка обновления профиля:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    profile,
    isLoading: profileLoading,
    error,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  };
};
