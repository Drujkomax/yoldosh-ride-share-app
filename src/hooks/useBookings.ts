
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';

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
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      console.log('useBookings - Starting to fetch bookings');
      
      if (!user) {
        console.log('useBookings - No user found');
        return [];
      }

      console.log('useBookings - Fetching bookings for user:', user.id);

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

      console.log('useBookings - Supabase response:', { data, error });

      if (error) {
        console.error('useBookings - Supabase error:', error);
        throw error;
      }

      const mappedBookings = data.map(booking => ({
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

      console.log('useBookings - Mapped bookings:', mappedBookings);
      return mappedBookings;
    },
    enabled: !!user,
    retry: 1,
  });

  const createBookingMutation = useMutation({
    mutationFn: async (newBooking: Omit<Booking, 'id' | 'created_at' | 'ride'>) => {
      console.log('=== СОЗДАНИЕ БРОНИРОВАНИЯ В БАЗЕ ДАННЫХ ===');
      console.log('useBookings - Creating booking:', newBooking);
      
      // Проверяем, что все обязательные поля заполнены
      if (!newBooking.ride_id || !newBooking.passenger_id) {
        throw new Error('Не заполнены обязательные поля: ride_id или passenger_id');
      }
      
      if (newBooking.seats_booked <= 0 || newBooking.total_price <= 0) {
        throw new Error('Количество мест и сумма должны быть больше 0');
      }

      // Убираем undefined значения из объекта
      const cleanBooking = {
        ride_id: newBooking.ride_id,
        passenger_id: newBooking.passenger_id,
        seats_booked: newBooking.seats_booked,
        total_price: newBooking.total_price,
        status: newBooking.status || 'pending',
        ...(newBooking.notes && { notes: newBooking.notes }),
        ...(newBooking.pickup_location && { pickup_location: newBooking.pickup_location })
      };

      console.log('useBookings - Clean booking data:', cleanBooking);
      
      const { data, error } = await supabase
        .from('bookings')
        .insert([cleanBooking])
        .select()
        .single();

      if (error) {
        console.error('useBookings - Create booking error:', error);
        console.error('useBookings - Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('useBookings - Booking created successfully:', data);
      console.log('=== БРОНИРОВАНИЕ СОЗДАНО УСПЕШНО ===');
      return data;
    },
    onSuccess: () => {
      console.log('useBookings - Booking creation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['driver-bookings'] });
      toast.success("Ваша заявка отправлена водителю");
    },
    onError: (error: any) => {
      console.error('useBookings - Create booking mutation error:', error);
      
      let errorMessage = "Не удалось забронировать поездку";
      
      if (error.code === '23503') {
        if (error.message.includes('ride_id')) {
          errorMessage = "Поездка не найдена или была удалена";
        } else if (error.message.includes('passenger_id')) {
          errorMessage = "Ошибка профиля пользователя. Попробуйте перезайти в приложение";
        }
      } else if (error.message?.includes('обязательные поля')) {
        errorMessage = "Заполните все обязательные поля";
      }
      
      toast.error(errorMessage);
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Booking> }) => {
      console.log('useBookings - Updating booking:', { id, updates });
      
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('useBookings - Update booking error:', error);
        throw error;
      }
      
      console.log('useBookings - Booking updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success("Изменения сохранены");
    },
    onError: (error) => {
      console.error('Update booking error:', error);
      toast.error("Не удалось обновить бронирование");
    },
  });

  return {
    bookings,
    isLoading,
    error,
    createBooking: createBookingMutation.mutateAsync,
    updateBooking: updateBookingMutation.mutate,
    isCreating: createBookingMutation.isPending,
    isUpdating: updateBookingMutation.isPending,
  };
};
