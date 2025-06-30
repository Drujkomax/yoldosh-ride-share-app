
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';

export interface UserTrip {
  trip_id: string;
  trip_type: 'driver' | 'passenger';
  from_city: string;
  to_city: string;
  departure_date: string;
  departure_time: string;
  status: string;
  price_per_seat: number;
  seats_count: number;
  other_user_id?: string;
  other_user_name?: string;
  other_user_rating?: number;
  other_user_avatar?: string;
  created_at: string;
}

export const useMyTrips = () => {
  const { user } = useUser();

  const { data: trips = [], isLoading, error } = useQuery({
    queryKey: ['my-trips', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('useMyTrips - Пользователь не найден');
        return [];
      }

      console.log('useMyTrips - Загрузка всех поездок пользователя:', user.id);

      // Используем созданную функцию для получения объединенной истории поездок
      const { data, error } = await supabase.rpc('get_user_all_trips', {
        user_uuid: user.id
      });

      if (error) {
        console.error('useMyTrips - Ошибка загрузки поездок:', error);
        throw error;
      }

      console.log('useMyTrips - Загружено поездок:', data?.length || 0);
      return (data || []) as UserTrip[];
    },
    enabled: !!user?.id,
  });

  // Фильтры для разных типов поездок
  const driverTrips = trips.filter(trip => trip.trip_type === 'driver');
  const passengerTrips = trips.filter(trip => trip.trip_type === 'passenger');
  const activeTrips = trips.filter(trip => 
    trip.status === 'active' || trip.status === 'confirmed' || trip.status === 'pending'
  );
  const completedTrips = trips.filter(trip => 
    trip.status === 'completed'
  );

  return {
    trips,
    driverTrips,
    passengerTrips,
    activeTrips,
    completedTrips,
    isLoading,
    error,
  };
};
