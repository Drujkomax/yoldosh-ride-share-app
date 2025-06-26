
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
      
      if (!user?.id) {
        console.log('useDriverBookings - Пользователь не найден');
        return [];
      }

      // Получаем заявки на поездки водителя - исправленный запрос
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          rides!bookings_ride_id_fkey!inner (
            from_city,
            to_city,
            departure_date,
            departure_time,
            driver_id
          ),
          profiles!bookings_passenger_id_fkey (
            name,
            phone,
            rating,
            total_rides
          )
        `)
        .eq('rides.driver_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useDriverBookings - Ошибка загрузки заявок:', error);
        throw error;
      }

      console.log('useDriverBookings - Данные из запроса:', data);
      console.log('useDriverBookings - Загружено заявок:', data?.length || 0);

      // Правильно маппим данные
      const mappedBookings = (data || []).map(booking => ({
        ...booking,
        ride: {
          from_city: booking.rides.from_city,
          to_city: booking.rides.to_city,
          departure_date: booking.rides.departure_date,
          departure_time: booking.rides.departure_time,
        },
        passenger: {
          name: booking.profiles?.name || 'Неизвестен',
          phone: booking.profiles?.phone || '',
          rating: booking.profiles?.rating || 0,
          total_rides: booking.profiles?.total_rides || 0,
        }
      })) as DriverBooking[];

      console.log('useDriverBookings - Обработанные заявки:', mappedBookings);
      return mappedBookings;
    },
    enabled: !!user?.id,
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
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      
      if (variables.status === 'confirmed') {
        toast.success("Заявка принята и чат создан");
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
