
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Booking {
  id: string;
  ride_id: string;
  passenger_id: string;
  seats_booked: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  pickup_location?: string;
  notes?: string;
  created_at: string;
  ride?: {
    from_city: string;
    to_city: string;
    departure_date: string;
    departure_time: string;
    driver: {
      name: string;
      rating?: number;
    };
  };
}

export const useBookings = () => {
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          rides (
            from_city,
            to_city,
            departure_date,
            departure_time,
            profiles:driver_id (
              name,
              rating
            )
          )
        `)
        .eq('passenger_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(booking => ({
        ...booking,
        ride: booking.rides ? {
          from_city: booking.rides.from_city,
          to_city: booking.rides.to_city,
          departure_date: booking.rides.departure_date,
          departure_time: booking.rides.departure_time,
          driver: {
            name: booking.rides.profiles?.name || 'Unknown',
            rating: booking.rides.profiles?.rating,
          },
        } : undefined,
      })) as Booking[];
    },
    enabled: true,
  });

  const createBookingMutation = useMutation({
    mutationFn: async (newBooking: Omit<Booking, 'id' | 'created_at' | 'ride'>) => {
      const { data, error } = await supabase
        .from('bookings')
        .insert([newBooking])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      toast({
        title: "Бронирование создано",
        description: "Ваша заявка отправлена водителю",
      });
    },
    onError: (error) => {
      console.error('Create booking error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось забронировать поездку",
        variant: "destructive",
      });
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Booking> }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({
        title: "Бронирование обновлено",
        description: "Изменения сохранены",
      });
    },
    onError: (error) => {
      console.error('Update booking error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить бронирование",
        variant: "destructive",
      });
    },
  });

  return {
    bookings,
    isLoading,
    error,
    createBooking: createBookingMutation.mutate,
    updateBooking: updateBookingMutation.mutate,
    isCreating: createBookingMutation.isPending,
    isUpdating: updateBookingMutation.isPending,
  };
};
