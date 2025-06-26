import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { useEffect } from 'react';

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
      console.log('useBookings - Загрузка бронирований для пользователя:', user?.id);
      
      if (!user) {
        console.log('useBookings - Пользователь не найден');
        return [];
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          rides!bookings_ride_id_fkey (
            from_city,
            to_city,
            departure_date,
            departure_time,
            profiles!rides_driver_id_fkey (
              name,
              rating
            )
          )
        `)
        .eq('passenger_id', user.id)
        .order('created_at', { ascending: false });

      console.log('useBookings - Результат запроса:', { data, error });

      if (error) {
        console.error('useBookings - Ошибка загрузки бронирований:', error);
        throw error;
      }

      const mappedBookings = (data || []).map(booking => ({
        ...booking,
        ride: booking.rides ? {
          from_city: booking.rides.from_city,
          to_city: booking.rides.to_city,
          departure_date: booking.rides.departure_date,
          departure_time: booking.rides.departure_time,
          driver: {
            name: booking.rides.profiles?.name || 'Неизвестный водитель',
            rating: booking.rides.profiles?.rating,
          },
        } : undefined,
      })) as Booking[];

      console.log('useBookings - Обработанные бронирования:', mappedBookings);
      return mappedBookings;
    },
    enabled: !!user,
    retry: 1,
  });

  // Realtime подписка на обновления бронирований
  useEffect(() => {
    if (!user) return;

    console.log('useBookings - Подписка на realtime обновления бронирований');

    const channel = supabase
      .channel('bookings-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `passenger_id=eq.${user.id}`
        },
        (payload) => {
          console.log('useBookings - Обновление бронирования:', payload);
          queryClient.invalidateQueries({ queryKey: ['bookings'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const createBookingMutation = useMutation({
    mutationFn: async (newBooking: Omit<Booking, 'id' | 'created_at' | 'ride'>) => {
      console.log('=== СОЗДАНИЕ БРОНИРОВАНИЯ В БАЗЕ ДАННЫХ ===');
      console.log('useBookings - Создание бронирования:', newBooking);
      
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

      console.log('useBookings - Данные для вставки:', cleanBooking);
      
      const { data, error } = await supabase
        .from('bookings')
        .insert([cleanBooking])
        .select()
        .single();

      if (error) {
        console.error('useBookings - Ошибка создания бронирования:', error);
        throw error;
      }
      
      console.log('useBookings - Бронирование создано успешно:', data);
      return data;
    },
    onSuccess: () => {
      console.log('useBookings - Бронирование создано успешно, обновляем кэш');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['driver-bookings'] });
      toast.success("Ваша заявка отправлена водителю");
    },
    onError: (error: any) => {
      console.error('useBookings - Ошибка мутации создания бронирования:', error);
      
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
      console.log('useBookings - Обновление бронирования:', { id, updates });
      
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('useBookings - Ошибка обновления бронирования:', error);
        throw error;
      }
      
      console.log('useBookings - Бронирование обновлено:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success("Изменения сохранены");
    },
    onError: (error) => {
      console.error('Ошибка обновления бронирования:', error);
      toast.error("Не удалось обновить бронирование");
    },
  });

  // Фильтрация бронирований по статусу
  const getBookingsByStatus = (status?: string) => {
    if (!status) return bookings;
    return bookings.filter(booking => booking.status === status);
  };

  // Получение активных бронирований
  const activeBookings = getBookingsByStatus('confirmed');
  
  // Получение ожидающих бронирований
  const pendingBookings = getBookingsByStatus('pending');
  
  // Получение завершенных бронирований
  const completedBookings = getBookingsByStatus('completed');
  
  // Получение отмененных бронирований
  const cancelledBookings = getBookingsByStatus('cancelled');

  return {
    bookings,
    isLoading,
    error,
    createBooking: createBookingMutation.mutateAsync,
    updateBooking: updateBookingMutation.mutate,
    isCreating: createBookingMutation.isPending,
    isUpdating: updateBookingMutation.isPending,
    // Фильтрованные списки
    activeBookings,
    pendingBookings,
    completedBookings,
    cancelledBookings,
    getBookingsByStatus,
  };
};
