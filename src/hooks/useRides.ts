
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

      if (error) throw error;

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
      const { data, error } = await supabase
        .from('rides')
        .insert([newRide])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      toast.success("Ваша поездка успешно опубликована");
    },
    onError: (error) => {
      console.error('Create ride error:', error);
      toast.error("Не удалось создать поездку");
    },
  });

  const updateRideMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Ride> }) => {
      const { data, error } = await supabase
        .from('rides')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      toast.success("Изменения сохранены");
    },
    onError: (error) => {
      console.error('Update ride error:', error);
      toast.error("Не удалось обновить поездку");
    },
  });

  const searchRides = async (filters: {
    from_city: string;
    to_city: string;
    departure_date?: string;
  }) => {
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

    if (error) throw error;

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
