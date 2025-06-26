
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';

export interface DriverBooking {
  id: string;
  ride_id: string;
  passenger_id: string;
  seats_booked: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  pickup_location?: string;
  notes?: string;
  created_at: string;
  ride: {
    from_city: string;
    to_city: string;
    departure_date: string;
    departure_time: string;
  };
  passenger: {
    name: string;
    phone: string;
    rating?: number;
    total_rides: number;
  };
}

export const useDriverBookings = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['driver-bookings', user?.id],
    queryFn: async () => {
      console.log('useDriverBookings - Загрузка заявок для водителя:', user?.id);
      
      if (!user) {
        console.log('useDriverBookings - Пользователь не найден');
        return [];
      }

      // Получаем заявки на поездки водителя
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          ride:rides!inner (
            from_city,
            to_city,
            departure_date,
            departure_time,
            driver_id
          ),
          passenger:profiles!bookings_passenger_id_fkey (
            name,
            phone,
            rating,
            total_rides
          )
        `)
        .eq('rides.driver_id', user.id)
        .in('status', ['pending'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useDriverBookings - Ошибка загрузки заявок:', error);
        throw error;
      }

      console.log('useDriverBookings - Загружено заявок:', data?.length || 0);
      console.log('useDriverBookings - Данные заявок:', data);

      return data.map(booking => ({
        ...booking,
        ride: Array.isArray(booking.ride) ? booking.ride[0] : booking.ride,
        passenger: Array.isArray(booking.passenger) ? booking.passenger[0] : booking.passenger
      })) as DriverBooking[];
    },
    enabled: !!user,
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'confirmed' | 'cancelled' }) => {
      console.log('useDriverBookings - Обновление статуса заявки:', { id, status });
      
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('useDriverBookings - Ошибка обновления заявки:', error);
        throw error;
      }
      
      console.log('useDriverBookings - Заявка обновлена:', data);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['driver-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      if (variables.status === 'confirmed') {
        toast.success("Заявка принята");
      } else {
        toast.success("Заявка отклонена");
      }
    },
    onError: (error) => {
      console.error('Update booking error:', error);
      toast.error("Не удалось обновить заявку");
    },
  });

  return {
    bookings,
    isLoading,
    error,
    updateBooking: updateBookingMutation.mutate,
    isUpdating: updateBookingMutation.isPending,
  };
};
