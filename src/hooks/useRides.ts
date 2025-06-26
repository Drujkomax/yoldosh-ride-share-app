
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Ride {
  id: string;
  driver_id: string;
  from_city: string;
  to_city: string;
  departure_date: string;
  departure_time: string;
  available_seats: number;
  price_per_seat: number;
  description?: string;
  car_model?: string;
  car_color?: string;
  status: 'active' | 'cancelled' | 'completed';
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
      console.log('useRides - Fetching rides from database');
      
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
        .eq('status', 'active')
        .order('departure_date', { ascending: true });

      if (error) {
        console.error('useRides - Error fetching rides:', error);
        throw error;
      }

      console.log('useRides - Fetched rides:', data?.length || 0, 'rides');

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

  const createRideMutation = useMutation({
    mutationFn: async (newRide: Omit<Ride, 'id' | 'created_at' | 'driver'>) => {
      console.log('useRides - Creating new ride with data:', newRide);
      
      // Проверяем корректность данных перед отправкой
      if (!newRide.driver_id) {
        console.error('useRides - No driver_id provided');
        throw new Error('Driver ID is required');
      }
      
      if (!newRide.from_city || !newRide.to_city) {
        console.error('useRides - Missing cities:', { from: newRide.from_city, to: newRide.to_city });
        throw new Error('From and to cities are required');
      }
      
      if (!newRide.departure_date || !newRide.departure_time) {
        console.error('useRides - Missing date/time:', { date: newRide.departure_date, time: newRide.departure_time });
        throw new Error('Departure date and time are required');
      }
      
      if (newRide.available_seats <= 0 || newRide.price_per_seat <= 0) {
        console.error('useRides - Invalid seats/price:', { seats: newRide.available_seats, price: newRide.price_per_seat });
        throw new Error('Seats and price must be greater than 0');
      }

      // Проверяем, что водитель существует в profiles
      console.log('useRides - Checking if driver exists in profiles');
      const { data: driverProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('id', newRide.driver_id)
        .single();
      
      if (profileError) {
        console.error('useRides - Driver profile not found:', profileError);
        throw new Error('Driver profile not found. Please complete registration first.');
      }
      
      console.log('useRides - Driver profile found:', driverProfile);

      const { data, error } = await supabase
        .from('rides')
        .insert([newRide])
        .select()
        .single();

      if (error) {
        console.error('useRides - Error creating ride:', error);
        console.error('useRides - Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('useRides - Ride created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('useRides - Create ride success:', data);
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      toast.success("Ваша поездка успешно опубликована");
    },
    onError: (error: any) => {
      console.error('useRides - Create ride error:', error);
      
      // Показываем более понятные ошибки пользователю
      let errorMessage = "Не удалось создать поездку";
      
      if (error.message?.includes('Driver profile not found')) {
        errorMessage = "Необходимо завершить регистрацию профиля";
      } else if (error.message?.includes('required')) {
        errorMessage = "Заполните все обязательные поля";
      } else if (error.code === '23503') {
        errorMessage = "Ошибка связи с профилем водителя";
      } else if (error.code === '42703') {
        errorMessage = "Ошибка структуры данных";
      }
      
      toast.error(errorMessage);
    },
  });

  const updateRideMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Ride> }) => {
      console.log('useRides - Updating ride:', id, updates);
      
      const { data, error } = await supabase
        .from('rides')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('useRides - Error updating ride:', error);
        throw error;
      }
      
      console.log('useRides - Ride updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      toast.success("Изменения сохранены");
    },
    onError: (error) => {
      console.error('useRides - Update ride error:', error);
      toast.error("Не удалось обновить поездку");
    },
  });

  const searchRides = async (filters: {
    from_city: string;
    to_city: string;
    departure_date?: string;
  }) => {
    console.log('useRides - Searching rides with filters:', filters);
    
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
      .eq('status', 'active')
      .eq('from_city', filters.from_city)
      .eq('to_city', filters.to_city);

    if (filters.departure_date) {
      query = query.eq('departure_date', filters.departure_date);
    }

    const { data, error } = await query.order('departure_date', { ascending: true });

    if (error) {
      console.error('useRides - Error searching rides:', error);
      throw error;
    }

    console.log('useRides - Found rides:', data?.length || 0);

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
