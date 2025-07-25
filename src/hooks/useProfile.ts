
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  date_of_birth?: string;
  role?: 'driver' | 'passenger';
  is_verified: boolean;
  total_rides: number;
  rating: number;
  avatar_url?: string;
  about?: string;
  created_at: string;
  updated_at: string;
}

export interface CarInfo {
  model: string;
  color: string;
}

export const useProfile = () => {
  const { user, setUser } = useUser();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading, error } = useQuery({
    queryKey: ['profile', user?.id], // Убираем avatarUrl из зависимостей, чтобы избежать бесконечных циклов
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('useProfile - Загрузка профиля для пользователя:', user.id);
      console.log('useProfile - Текущий avatarUrl в контексте:', user.avatarUrl);
      
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
      console.log('useProfile - Avatar URL из БД:', data?.avatar_url);
      
      // Если avatarUrl в БД отличается от контекста, обновляем контекст
      if (data && data.avatar_url !== user.avatarUrl) {
        console.log('useProfile - Обнаружено расхождение в avatarUrl, обновляем контекст');
        const updatedUser = {
          ...user,
          avatarUrl: data.avatar_url
        };
        setUser(updatedUser);
      }
      
      return data as UserProfile;
    },
    enabled: !!user?.id,
    staleTime: 0, // Устанавливаем в 0 для немедленного обновления данных
    refetchOnWindowFocus: true, // Обновляем при фокусе окна
    refetchOnMount: true, // Обновляем при каждом монтировании
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

      console.log('useProfile - Профиль обновлен:', data);
      return data;
    },
    onSuccess: (data) => {
      // Инвалидируем кеш
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      // Если обновился avatar_url, синхронизируем с контекстом
      if (data?.avatar_url !== user?.avatarUrl) {
        console.log('useProfile - Синхронизируем avatarUrl с контекстом:', data.avatar_url);
        const updatedUser = {
          ...user,
          avatarUrl: data.avatar_url
        };
        setUser(updatedUser);
      }
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
