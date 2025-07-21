import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, CalendarDays, Clock, Users, LucideIcon, Loader2 } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import { createChat } from '@/hooks/useChats';
import { useUser } from '@/contexts/UserContext';
import { useUserRole } from '@/hooks/useUserRole';

interface Ride {
  id: string;
  driver_id: string;
  from_city: string;
  to_city: string;
  departure_date: string;
  departure_time: string;
  available_seats: number;
  price_per_seat: number;
  description: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_latitude: number;
  dropoff_longitude: number;
  instant_booking_enabled: boolean;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

const RideDetailsPage = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { role: currentUserRole } = useUserRole();
  const [ride, setRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRideDetails = async () => {
      if (!rideId) {
        toast.error('Ride ID is missing');
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('rides')
          .select('*')
          .eq('id', rideId)
          .single();

        if (error) {
          console.error('Error fetching ride details:', error);
          toast.error('Failed to load ride details');
          return;
        }

        setRide(data as Ride);
      } catch (error) {
        console.error('Error fetching ride details:', error);
        toast.error('Failed to load ride details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRideDetails();
  }, [rideId]);

  const Icon = ({ icon: LucideIcon }: { icon: LucideIcon }) => (
    <LucideIcon className="mr-2 h-4 w-4 text-gray-500" />
  );

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ru-RU');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatTime = (timeStr: string): string => {
    try {
      const [hours, minutes] = timeStr.split(':');
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid Time';
    }
  };

  const createBookingRequest = async () => {
    if (!user?.id || !ride) {
      toast.error('Необходимо войти в систему');
      return;
    }

    try {
      console.log('Создание запроса на бронирование:', { 
        rideId: ride.id, 
        passengerId: user.id,
        currentUserRole 
      });

      // Создаем запись бронирования со статусом pending
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          ride_id: ride.id,
          passenger_id: user.id,
          seats_booked: 1,
          total_price: ride.price_per_seat,
          status: 'pending'
        }])
        .select()
        .single();

      if (bookingError) {
        if (bookingError.code === '23505') { // unique violation
          toast.error('Вы уже отправили запрос на эту поездку');
          return;
        }
        throw bookingError;
      }

      console.log('Запрос бронирования создан:', booking);

      // Создаем или находим чат между пассажиром и водителем
      const chatId = await createChat(ride.id, user.id, ride.driver_id);
      console.log('Чат создан/найден:', chatId);

      // Отправляем системное сообщение о запросе бронирования
      const { error: messageError } = await supabase
        .from('messages')
        .insert([{
          chat_id: chatId,
          sender_id: user.id,
          content: `🚗 ${currentUserRole === 'driver' ? 'Водитель' : 'Пассажир'} ${user.name || 'Пользователь'} запрашивает бронирование этой поездки на 1 место за ${ride.price_per_seat}₸`,
          sender_type: 'system',
          system_action_type: 'booking_request',
          booking_request_id: booking.id,
          action_data: {
            seats_requested: 1,
            total_price: ride.price_per_seat,
            passenger_name: user.name || 'Пользователь',
            passenger_role: currentUserRole
          }
        }]);

      if (messageError) {
        console.error('Ошибка отправки системного сообщения:', messageError);
        throw messageError;
      }

      // Обновляем время последнего сообщения в чате
      await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', chatId);

      toast.success('Запрос на бронирование отправлен водителю!');
      
      // Переходим в чат
      navigate(`/chat/${chatId}`);

    } catch (error) {
      console.error('Ошибка создания запроса бронирования:', error);
      toast.error('Не удалось отправить запрос на бронирование');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Ride not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-lg rounded-lg">
          <CardHeader className="p-6">
            <CardTitle className="text-2xl font-semibold">{ride.from_city} → {ride.to_city}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="flex items-center text-gray-700">
                <Icon icon={MapPin} />
                {ride.pickup_address}
              </div>
              <div className="flex items-center text-gray-700">
                <Icon icon={MapPin} />
                {ride.dropoff_address}
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-center text-gray-700">
                <Icon icon={CalendarDays} />
                {formatDate(ride.departure_date)}
              </div>
              <div className="flex items-center text-gray-700">
                <Icon icon={Clock} />
                {formatTime(ride.departure_time)}
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-center text-gray-700">
                <Icon icon={Users} />
                {ride.available_seats} мест
              </div>
              <div className="flex items-center text-gray-700">
                <Badge variant="secondary">{ride.price_per_seat} ₸</Badge>
              </div>
            </div>
            {ride.description && (
              <div className="mb-4">
                <p className="text-gray-800">{ride.description}</p>
              </div>
            )}
            <Button onClick={createBookingRequest} className="w-full">
              Запросить бронирование
            </Button>
          </CardContent>
        </Card>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default RideDetailsPage;
