
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';

export interface FrequentLocation {
  id: string;
  user_id: string;
  location_name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  usage_count: number;
  last_used: string;
  location_type: 'home' | 'work' | 'frequent';
}

export const useFrequentLocations = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: frequentLocations = [], isLoading } = useQuery({
    queryKey: ['frequent-locations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('useFrequentLocations - Загрузка частых локаций для пользователя:', user.id);
      
      const { data, error } = await supabase
        .from('user_frequent_locations')
        .select('*')
        .eq('user_id', user.id)
        .order('usage_count', { ascending: false });

      if (error) {
        console.error('useFrequentLocations - Ошибка при загрузке:', error);
        throw error;
      }

      console.log('useFrequentLocations - Загружено локаций:', data?.length || 0);
      return data as FrequentLocation[];
    },
    enabled: !!user?.id,
  });

  const addFrequentLocationMutation = useMutation({
    mutationFn: async (location: Omit<FrequentLocation, 'id' | 'user_id' | 'usage_count' | 'last_used'>) => {
      if (!user?.id) throw new Error('Пользователь не авторизован');

      console.log('useFrequentLocations - Добавление частой локации:', location);

      // Проверяем, существует ли уже такая локация
      const { data: existing } = await supabase
        .from('user_frequent_locations')
        .select('*')
        .eq('user_id', user.id)
        .eq('address', location.address)
        .maybeSingle();

      if (existing) {
        // Обновляем счетчик использования
        const { data, error } = await supabase
          .from('user_frequent_locations')
          .update({
            usage_count: existing.usage_count + 1,
            last_used: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Создаем новую запись
        const { data, error } = await supabase
          .from('user_frequent_locations')
          .insert([{
            ...location,
            user_id: user.id,
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['frequent-locations', user?.id] });
    },
  });

  const updateLocationTypeMutation = useMutation({
    mutationFn: async ({ id, location_type }: { id: string; location_type: FrequentLocation['location_type'] }) => {
      const { data, error } = await supabase
        .from('user_frequent_locations')
        .update({ location_type })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['frequent-locations', user?.id] });
    },
  });

  return {
    frequentLocations,
    isLoading,
    addFrequentLocation: addFrequentLocationMutation.mutate,
    updateLocationType: updateLocationTypeMutation.mutate,
    isAdding: addFrequentLocationMutation.isPending,
  };
};
