import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

export interface UserCar {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year?: number;
  color?: string;
  license_plate?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserCars = () => {
  const { user, refreshUserRole } = useUser();
  const queryClient = useQueryClient();

  const { data: cars = [], isLoading, error } = useQuery({
    queryKey: ['user-cars', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('useUserCars - Загрузка машин пользователя:', user.id);
      
      const { data, error } = await supabase
        .from('user_cars')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useUserCars - Ошибка при загрузке машин:', error);
        throw error;
      }

      console.log('useUserCars - Загружено машин:', data?.length || 0);
      return data as UserCar[];
    },
    enabled: !!user?.id,
  });

  const addCarMutation = useMutation({
    mutationFn: async (newCar: Omit<UserCar, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('Пользователь не найден');
      
      console.log('useUserCars - Добавление машины:', newCar);
      
      const { data, error } = await supabase
        .from('user_cars')
        .insert([{
          ...newCar,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('useUserCars - Ошибка при добавлении машины:', error);
        throw error;
      }
      
      console.log('useUserCars - Машина успешно добавлена:', data);
      return data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['user-cars'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Обновляем роль пользователя после добавления машины
      await refreshUserRole();
      toast.success("Машина успешно добавлена!");
    },
    onError: (error: any) => {
      console.error('useUserCars - Ошибка добавления машины:', error);
      toast.error("Не удалось добавить машину");
    },
  });

  const updateCarMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<UserCar> }) => {
      console.log('useUserCars - Обновление машины:', id, updates);
      
      const { data, error } = await supabase
        .from('user_cars')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('useUserCars - Ошибка при обновлении машины:', error);
        throw error;
      }
      
      console.log('useUserCars - Машина успешно обновлена:', data);
      return data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['user-cars'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Обновляем роль если изменился статус активности машины
      await refreshUserRole();
      toast.success("Изменения сохранены");
    },
    onError: (error) => {
      console.error('useUserCars - Ошибка обновления машины:', error);
      toast.error("Не удалось обновить машину");
    },
  });

  const deleteCarMutation = useMutation({
    mutationFn: async (carId: string) => {
      console.log('useUserCars - Удаление машины:', carId);
      
      const { error } = await supabase
        .from('user_cars')
        .delete()
        .eq('id', carId);

      if (error) {
        console.error('useUserCars - Ошибка при удалении машины:', error);
        throw error;
      }
      
      console.log('useUserCars - Машина успешно удалена');
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['user-cars'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Обновляем роль после удаления машины
      await refreshUserRole();
      toast.success("Машина удалена");
    },
    onError: (error) => {
      console.error('useUserCars - Ошибка удаления машины:', error);
      toast.error("Не удалось удалить машину");
    },
  });

  const activeCar = cars.find(car => car.is_active);
  const canDrive = cars.some(car => car.is_active);

  return {
    cars,
    activeCar,
    canDrive,
    isLoading,
    error,
    addCar: addCarMutation.mutate,
    updateCar: updateCarMutation.mutate,
    deleteCar: deleteCarMutation.mutate,
    isAdding: addCarMutation.isPending,
    isUpdating: updateCarMutation.isPending,
    isDeleting: deleteCarMutation.isPending,
  };
};
