
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Ride {
  id: string;
  driver_id: string;
  from_city: string;
  to_city: string;
  pickup_address?: string;
  dropoff_address?: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  dropoff_latitude?: number;
  dropoff_longitude?: number;
  precise_pickup_latitude?: number;
  precise_pickup_longitude?: number;
  precise_dropoff_latitude?: number;
  precise_dropoff_longitude?: number;
  route_data?: any;
  route_polyline?: string;
  estimated_duration_minutes?: number;
  estimated_distance_km?: number;
  toll_info?: any;
  intermediate_stops?: any[];
  departure_date: string;
  departure_time: string;
  departure_flexibility?: number;
  available_seats: number;
  price_per_seat: number;
  description?: string;
  car_model?: string;
  car_color?: string;
  duration_hours?: number;
  estimated_arrival_time?: string;
  passenger_pickup_instructions?: string;
  passenger_dropoff_instructions?: string;
  comfort_settings?: any;
  status: 'active' | 'cancelled' | 'completed' | 'full';
  created_at: string;
  driver?: {
    name: string;
    rating?: number;
    total_rides: number;
  };
}

export const useRides = () => {
  const queryClient = useQueryClient();

  const { data: rides = [], isLoading, error } = useQuery({
    queryKey: ['rides'],
    queryFn: async () => {
      console.log('useRides - Загрузка поездок из базы данных');
      
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          profiles:driver_id (
            name,
            rating,
            total_rides
          )
        `)
        .in('status', ['active', 'full'])
        .order('departure_date', { ascending: true });

      if (error) {
        console.error('useRides - Ошибка при загрузке поездок:', error);
        throw error;
      }

      console.log('useRides - Загружено поездок:', data?.length || 0);

      return data.map(ride => ({
        ...ride,
        driver: ride.profiles ? {
          name: ride.profiles.name,
          rating: ride.profiles.rating,
          total_rides: ride.profiles.total_rides,
        } : undefined,
      })) as Ride[];
    },
  });

  // Функция для автоматического создания профиля водителя если нужно
  const ensureDriverProfile = async (driverId: string, driverData: any) => {
    try {
      console.log('useRides - Проверяем профиль водителя:', driverId);
      
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('id', driverId)
        .maybeSingle();
      
      if (checkError) {
        console.error('useRides - Ошибка при проверке профиля водителя:', checkError);
        return false;
      }
      
      if (existingProfile) {
        console.log('useRides - Профиль водителя найден:', existingProfile);
        return true;
      }

      console.log('useRides - Профиль водителя не найден, создаем автоматически...');
      
      // Создаем профиль автоматически
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([
          {
            id: driverId,
            phone: driverData.phone || `+998${Math.floor(Math.random() * 1000000000)}`,
            name: driverData.name || 'Водитель',
            role: 'driver',
            is_verified: false,
            total_rides: 0,
            rating: 0.0
          }
        ])
        .select()
        .single();

      if (createError) {
        console.error('useRides - Ошибка при создании профиля водителя:', createError);
        return false;
      }

      console.log('useRides - Профиль водителя создан автоматически:', newProfile);
      return true;
    } catch (error) {
      console.error('useRides - Ошибка в ensureDriverProfile:', error);
      return false;
    }
  };

  const createRideMutation = useMutation({
    mutationFn: async (newRide: Omit<Ride, 'id' | 'created_at' | 'driver' | 'estimated_arrival_time'>) => {
      console.log('=== НАЧАЛО СОЗДАНИЯ ПОЕЗДКИ ===');
      console.log('useRides - Данные новой поездки:', newRide);
      
      // Базовая валидация данных
      if (!newRide.driver_id) {
        console.error('useRides - Отсутствует ID водителя');
        throw new Error('ID водителя обязателен');
      }
      
      if (!newRide.from_city || !newRide.to_city) {
        console.error('useRides - Отсутствуют города:', { from: newRide.from_city, to: newRide.to_city });
        throw new Error('Города отправления и назначения обязательны');
      }
      
      if (!newRide.departure_date || !newRide.departure_time) {
        console.error('useRides - Отсутствуют дата/время:', { date: newRide.departure_date, time: newRide.departure_time });
        throw new Error('Дата и время отправления обязательны');
      }
      
      if (newRide.available_seats <= 0 || newRide.price_per_seat <= 0) {
        console.error('useRides - Некорректные места/цена:', { seats: newRide.available_seats, price: newRide.price_per_seat });
        throw new Error('Количество мест и цена должны быть больше 0');
      }

      console.log('useRides - Базовая валидация пройдена');

      // Попытка создать поездку напрямую
      console.log('useRides - Попытка создания поездки...');
      const { data, error } = await supabase
        .from('rides')
        .insert([{
          ...newRide,
          duration_hours: newRide.duration_hours || 2
        }])
        .select()
        .single();

      if (error) {
        console.error('useRides - Ошибка при создании поездки:', error);
        console.error('useRides - Детали ошибки:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });

        // Если ошибка связана с foreign key (профиль водителя не найден)
        if (error.code === '23503' && error.message.includes('driver_id')) {
          console.log('useRides - Профиль водителя не найден, пытаемся создать...');
          
          // Пытаемся получить данные из localStorage для создания профиля
          const userData = JSON.parse(localStorage.getItem('yoldosh_user') || '{}');
          console.log('useRides - Данные пользователя из localStorage:', userData);
          
          const profileCreated = await ensureDriverProfile(newRide.driver_id, userData);
          
          if (profileCreated) {
            console.log('useRides - Профиль создан, повторная попытка создания поездки...');
            
            // Повторная попытка создания поездки
            const { data: retryData, error: retryError } = await supabase
              .from('rides')
              .insert([newRide])
              .select()
              .single();

            if (retryError) {
              console.error('useRides - Повторная ошибка при создании поездки:', retryError);
              throw retryError;
            }
            
            console.log('useRides - Поездка создана после создания профиля:', retryData);
            return retryData;
          } else {
            throw new Error('Не удалось создать профиль водителя');
          }
        }
        
        throw error;
      }
      
      console.log('useRides - Поездка успешно создана:', data);
      console.log('=== КОНЕЦ СОЗДАНИЯ ПОЕЗДКИ ===');
      return data;
    },
    onSuccess: (data) => {
      console.log('useRides - Успешное создание поездки, обновляем кэш');
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      toast.success("Ваша поездка успешно опубликована");
      
      // Сохраняем ID созданной поездки для навигации
      if (data?.id) {
        localStorage.setItem('lastCreatedRideId', data.id);
      }
    },
    onError: (error: any) => {
      console.error('useRides - Ошибка создания поездки в onError:', error);
      
      // Показываем более понятные ошибки пользователю
      let errorMessage = "Не удалось создать поездку";
      
      if (error.message?.includes('ID водителя')) {
        errorMessage = "Необходимо войти в систему";
      } else if (error.message?.includes('обязательны')) {
        errorMessage = "Заполните все обязательные поля";
      } else if (error.code === '23503') {
        errorMessage = "Ошибка профиля пользователя. Попробуйте перезайти в приложение";
      } else if (error.code === '42703') {
        errorMessage = "Ошибка данных";
      }
      
      toast.error(errorMessage);
    },
  });

  const updateRideMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Ride> }) => {
      console.log('useRides - Обновление поездки:', id, updates);
      
      const { data, error } = await supabase
        .from('rides')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('useRides - Ошибка при обновлении поездки:', error);
        throw error;
      }
      
      console.log('useRides - Поездка успешно обновлена:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      toast.success("Изменения сохранены");
    },
    onError: (error) => {
      console.error('useRides - Ошибка обновления поездки:', error);
      toast.error("Не удалось обновить поездку");
    },
  });

  const searchRides = async (filters: {
    from_city: string;
    to_city: string;
    departure_date?: string;
  }) => {
    console.log('useRides - Поиск поездок с фильтрами:', filters);
    
    let query = supabase
      .from('rides')
      .select(`
        *,
        profiles:driver_id (
          name,
          rating,
          total_rides
        )
      `)
      .in('status', ['active', 'full'])
      .eq('from_city', filters.from_city)
      .eq('to_city', filters.to_city);

    if (filters.departure_date) {
      query = query.eq('departure_date', filters.departure_date);
    }

    const { data, error } = await query.order('departure_date', { ascending: true });

    if (error) {
      console.error('useRides - Ошибка при поиске поездок:', error);
      throw error;
    }

    console.log('useRides - Найдено поездок:', data?.length || 0);

    return data.map(ride => ({
      ...ride,
      driver: ride.profiles ? {
        name: ride.profiles.name,
        rating: ride.profiles.rating,
        total_rides: ride.profiles.total_rides,
      } : undefined,
    })) as Ride[];
  };

  return {
    rides,
    isLoading,
    error,
    createRide: createRideMutation.mutate,
    updateRide: updateRideMutation.mutate,
    searchRides,
    isCreating: createRideMutation.isPending,
    isUpdating: updateRideMutation.isPending,
  };
};
