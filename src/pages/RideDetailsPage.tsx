
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Users, Star, User, Car, MessageCircle, ChevronLeft, Wifi, Wind, Music, Heart, CheckCircle, Share, Flag, Calendar as CalendarIcon, Ban, Cigarette } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';
import { useGoogleGeocoding } from '@/hooks/useGoogleGeocoding';

const RideDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [loadingRouteInfo, setLoadingRouteInfo] = useState(false);
  const [passengers, setPassengers] = useState<any[]>([]);
  const { getRouteInfo } = useGoogleGeocoding();

  useEffect(() => {
    if (id) {
      fetchRideDetails();
    }
  }, [id]);

  const fetchRideDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          profiles:driver_id (
            id,
            name,
            rating,
            total_rides,
            phone,
            avatar_url
          ),
          user_cars (
            make,
            model,
            year,
            color,
            license_plate
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setRide(data);
      
      // Загружаем реальную информацию о маршруте
      if (data.pickup_address && data.dropoff_address) {
        fetchRouteInfo(data.pickup_address, data.dropoff_address);
      }
      
      // Загружаем пассажиров
      fetchPassengers(data.id);
    } catch (error) {
      console.error('Error fetching ride details:', error);
      toast.error('Ошибка при загрузке деталей поездки');
    } finally {
      setLoading(false);
    }
  };

  const fetchRouteInfo = async (origin: string, destination: string) => {
    setLoadingRouteInfo(true);
    try {
      const route = await getRouteInfo(origin, destination);
      if (route) {
        setRouteInfo(route);
      }
    } catch (error) {
      console.error('Error fetching route info:', error);
    } finally {
      setLoadingRouteInfo(false);
    }
  };

  const fetchPassengers = async (rideId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles:passenger_id (
            id,
            name,
            avatar_url
          )
        `)
        .eq('ride_id', rideId)
        .eq('status', 'confirmed');

      if (error) throw error;
      setPassengers(data || []);
    } catch (error) {
      console.error('Error fetching passengers:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const day = format(date, 'EEEE', { locale: ru });
      const dayNumber = format(date, 'd', { locale: ru });
      const month = format(date, 'MMMM', { locale: ru });
      
      // Делаем первую букву дня недели заглавной
      const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
      
      return `${capitalizedDay}, ${dayNumber} ${month}`;
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      return timeStr.slice(0, 5);
    } catch {
      return timeStr;
    }
  };

  const handleBookRide = async () => {
    console.log('User object:', user);
    console.log('User ID:', user?.id);
    console.log('Ride driver ID:', ride?.driver_id);
    
    if (!user || !user.id) {
      toast.error('Необходимо войти в систему для бронирования');
      return;
    }

    if (user.id === ride.driver_id) {
      toast.error('Нельзя забронировать свою собственную поездку');
      return;
    }

    setBookingLoading(true);
    try {
      if (ride.instant_booking_enabled) {
        // Мгновенное бронирование - создаем подтвержденное бронирование
        const { error } = await supabase
          .from('bookings')
          .insert({
            ride_id: ride.id,
            passenger_id: user.id,
            seats_booked: 1,
            total_price: ride.price_per_seat,
            status: 'confirmed'
          });

        if (error) throw error;
        
        toast.success('Поездка забронирована! Вы можете связаться с водителем.');
        navigate('/my-trips');
      } else {
        // Обычное бронирование - создаем запрос на бронирование
        await createBookingRequest();
      }
    } catch (error) {
      console.error('Error booking ride:', error);
      toast.error('Ошибка при бронировании поездки');
    } finally {
      setBookingLoading(false);
    }
  };

  const createBookingRequest = async () => {
    try {
      console.log('createBookingRequest - Создание запроса на бронирование');
      
      // Проверяем, есть ли уже активный запрос от этого пользователя для этой поездки
      const { data: existingBooking } = await supabase
        .from('bookings')
        .select('id, status')
        .eq('ride_id', ride.id)
        .eq('passenger_id', user.id)
        .in('status', ['pending', 'confirmed'])
        .maybeSingle();

      if (existingBooking) {
        if (existingBooking.status === 'confirmed') {
          toast.error('Вы уже забронировали места в этой поездке');
        } else {
          toast.error('Ваш запрос на бронирование уже отправлен и ожидает подтверждения');
        }
        return;
      }

      // Создаем запрос на бронирование со статусом pending
      const { data: newBooking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          ride_id: ride.id,
          passenger_id: user.id,
          seats_booked: 1,
          total_price: ride.price_per_seat,
          status: 'pending'
        })
        .select('id')
        .single();

      if (bookingError) {
        console.error('Ошибка создания бронирования:', bookingError);
        throw bookingError;
      }

      console.log('Бронирование создано:', newBooking);

      // Проверяем, существует ли уже чат между пассажиром и водителем для этой поездки
      const { data: existingChat, error: searchError } = await supabase
        .from('chats')
        .select('id')
        .eq('ride_id', ride.id)
        .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${ride.driver_id}),and(participant1_id.eq.${ride.driver_id},participant2_id.eq.${user.id})`)
        .maybeSingle();

      if (searchError) {
        console.error('Error searching for existing chat:', searchError);
        toast.error('Ошибка при поиске чата');
        return;
      }

      let chatId;

      if (existingChat) {
        // Чат уже существует, используем его ID
        chatId = existingChat.id;
        console.log('Используем существующий чат:', chatId);
      } else {
        // Создаем новый чат
        const { data: newChat, error: createError } = await supabase
          .from('chats')
          .insert({
            ride_id: ride.id,
            participant1_id: user.id,
            participant2_id: ride.driver_id,
            last_message_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating chat:', createError);
          toast.error('Ошибка при создании чата');
          return;
        }

        chatId = newChat.id;
        console.log('Создан новый чат:', chatId);
      }

      // Отправляем системное сообщение с запросом на бронирование
      const requestContent = `🚗 Новый запрос на бронирование!\n\nМаршрут: ${ride.from_city} → ${ride.to_city}\nДата: ${formatDate(ride.departure_date)}\nВремя: ${formatTime(ride.departure_time)}\nКоличество мест: 1\nОбщая стоимость: ${Math.floor(ride.price_per_seat).toLocaleString('ru-RU')} сум\n\nПожалуйста, подтвердите или отклоните запрос.`;
      
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id, // ID отправителя (пассажира)
          content: requestContent,
          sender_type: 'system',
          system_action_type: 'booking_request',
          booking_request_id: newBooking.id,
          action_data: {
            seats: 1,
            totalPrice: ride.price_per_seat
          }
        });

      if (messageError) {
        console.error('Error sending system message:', messageError);
        toast.error('Ошибка при отправке сообщения');
        return;
      }

      // Обновляем время последнего сообщения в чате
      await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', chatId);

      console.log('Запрос на бронирование отправлен успешно');
      toast.success('Запрос на бронирование отправлен водителю');
      
      // Переходим в чат
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error('Error creating booking request:', error);
      toast.error('Ошибка при создании запроса на бронирование');
    }
  };

  const createChatWithDriver = async () => {
    try {
      // Проверяем, существует ли уже чат между пассажиром и водителем для этой поездки
      const { data: existingChat, error: searchError } = await supabase
        .from('chats')
        .select('id')
        .eq('ride_id', ride.id)
        .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${ride.driver_id}),and(participant1_id.eq.${ride.driver_id},participant2_id.eq.${user.id})`)
        .maybeSingle();

      if (searchError) {
        console.error('Error searching for existing chat:', searchError);
        toast.error('Ошибка при поиске чата');
        return;
      }

      let chatId;

      if (existingChat) {
        // Чат уже существует, используем его ID
        chatId = existingChat.id;
      } else {
        // Создаем новый чат
        const { data: newChat, error: createError } = await supabase
          .from('chats')
          .insert({
            ride_id: ride.id,
            participant1_id: user.id,
            participant2_id: ride.driver_id,
            last_message_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating chat:', createError);
          toast.error('Ошибка при создании чата');
          return;
        }

        chatId = newChat.id;
      }

      toast.success('Чат создан');
      
      // Переходим в чат
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error('Error creating chat with driver:', error);
      toast.error('Ошибка при создании чата');
    }
  };

  const handleChatWithDriver = async () => {
    if (!user?.id) {
      toast.error('Необходимо войти в систему для отправки сообщения');
      return;
    }

    if (user.id === ride.driver_id) {
      toast.error('Нельзя создать чат с самим собой');
      return;
    }

    await createChatWithDriver();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-4">Поездка не найдена</div>
          <Button onClick={() => navigate(-1)}>Назад</Button>
        </div>
      </div>
    );
  }

  const isOwnRide = user?.id === ride.driver_id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100"
            >
              <ChevronLeft className="h-6 w-6 text-teal-600" />
            </Button>
            <div className="w-10" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* No Available Seats Message */}
        {ride?.available_seats === 0 && (
          <div className="flex items-center space-x-2 text-gray-500 text-sm bg-gray-100 p-3 rounded-lg">
            <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
              <span className="text-xs">!</span>
            </div>
            <span>Нет свободных мест</span>
          </div>
        )}

        {/* Date Header */}
        <div className="pt-4">
          <h2 className="text-2xl font-bold text-teal-900">
            {formatDate(ride.departure_date)}
          </h2>
        </div>

        {/* Route Timeline */}
        <div className="space-y-4">
          {/* Departure */}
          <div className="flex items-start space-x-3">
            <div className="text-lg font-bold text-gray-900 w-12">
              {formatTime(ride.departure_time)}
            </div>
            <div className="w-2 h-2 bg-teal-600 rounded-full mt-2"></div>
            <div>
              <div className="text-base font-medium text-gray-900">{ride.from_city}</div>
              {ride.pickup_address && (
                <div className="text-sm text-gray-500">{ride.pickup_address}</div>
              )}
            </div>
          </div>
          
          {/* Duration Line */}
          <div className="flex items-center space-x-3">
            <div className="text-xs text-gray-500 w-12">
              {loadingRouteInfo ? '...' : routeInfo?.duration || `${ride.duration_hours}ч${ride.estimated_duration_minutes ? Math.round(ride.estimated_duration_minutes % 60) : ''}мин`}
            </div>
            <div className="w-0.5 h-8 bg-teal-600 ml-[7px]"></div>
          </div>
          
          {/* Arrival */}
          <div className="flex items-start space-x-3">
            <div className="text-lg font-bold text-gray-900 w-12">
              {(() => {
                if (loadingRouteInfo) return '...';
                if (routeInfo?.duration) {
                  const [hours, minutes] = ride.departure_time.split(':').map(Number);
                  const durationText = routeInfo.duration;
                  const hoursMatch = durationText.match(/(\d+)\s*ч/);
                  const minutesMatch = durationText.match(/(\d+)\s*мин/);
                  
                  const durationHours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
                  const durationMinutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
                  
                  const totalMinutes = hours * 60 + minutes + durationHours * 60 + durationMinutes;
                  const arrivalHours = Math.floor(totalMinutes / 60);
                  const arrivalMins = totalMinutes % 60;
                  
                  return `${String(arrivalHours).padStart(2, '0')}:${String(arrivalMins).padStart(2, '0')}`;
                }
                return formatTime(ride.estimated_arrival_time?.split('T')[1] || '00:00');
              })()}
            </div>
            <div className="w-2 h-2 bg-teal-600 rounded-full mt-2"></div>
            <div>
              <div className="text-base font-medium text-gray-900">{ride.to_city}</div>
              {ride.dropoff_address && (
                <div className="text-sm text-gray-500">{ride.dropoff_address}</div>
              )}
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between py-4 border-y border-gray-200">
          <span className="text-gray-600">1 пассажир</span>
          <span className="text-2xl font-bold text-teal-900">
            {Math.floor(ride.price_per_seat).toLocaleString('ru-RU')} сум
          </span>
        </div>

        {/* Driver Info */}
        <div className="flex items-center space-x-4 py-4 cursor-pointer" onClick={() => navigate(`/driver-reviews/${ride.driver_id}`)}>
          <div className="relative">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center border-2 border-teal-400">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <div className="text-lg font-bold text-gray-900">{ride.profiles?.name || 'Водитель'}</div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span>{ride.profiles?.rating || 5.0}/5</span>
              <span>-{ride.profiles?.total_rides || 0} отзывов</span>
            </div>
          </div>
          <ChevronLeft className="h-5 w-5 text-gray-400 rotate-180" />
        </div>

        {/* Driver Features */}
        <div className="space-y-4 pt-4">
          {/* Verified Profile */}
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-teal-400" />
            <span className="text-gray-700">Профиль подтвержден</span>
          </div>
          
          {/* Sometimes Cancels */}
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <span className="text-gray-700">Иногда отменяет поездки</span>
          </div>
          
          {/* Separator */}
          <div className="border-t border-gray-200 pt-4">
            {/* Booking Confirmation */}
            {!ride.instant_booking_enabled && (
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">Ваше бронирование будет подтверждено только после одобрения водителя</span>
              </div>
            )}
          </div>
          
          {/* No Smoking */}
          <div className="flex items-center space-x-3">
            <Ban className="h-5 w-5 text-red-500" />
            <span className="text-gray-700">В моей машине не курят</span>
          </div>
          
          {/* No Pets */}
          <div className="flex items-center space-x-3">
            <Ban className="h-5 w-5 text-red-500" />
            <span className="text-gray-700">Предпочитаю поездки без питомцев</span>
          </div>
          
          {/* Max 2 in back */}
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-gray-400" />
            <span className="text-gray-700">Максимум двое сзади</span>
          </div>
          
          {/* Car Info */}
          {ride.user_cars && (
            <div className="flex items-center space-x-3">
              <Car className="h-5 w-5 text-gray-400" />
              <span className="text-gray-700">
                {ride.user_cars.make} {ride.user_cars.model} - {ride.user_cars.color || 'черный'}
              </span>
            </div>
          )}
        </div>

        {/* Passengers Section */}
        {passengers.length > 0 && (
          <div className="pt-8">
            <h3 className="text-xl font-bold text-teal-900 mb-4">Пассажиры</h3>
            <div className="space-y-4">
              {passengers.map((passenger) => (
                <div key={passenger.id} className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{passenger.profiles?.name || 'Пассажир'}</div>
                    <div className="text-sm text-gray-500">{ride.from_city} → {ride.to_city}</div>
                  </div>
                  <ChevronLeft className="h-5 w-5 text-gray-400 rotate-180" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-8">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-blue-500 hover:bg-blue-50"
            onClick={() => toast.info('Функция пожаловаться будет добавлена')}
          >
            <Flag className="h-5 w-5 mr-3" />
            Пожаловаться на поездку
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-blue-500 hover:bg-blue-50"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Поездка',
                  text: `Поездка ${ride.from_city} → ${ride.to_city}`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Ссылка скопирована');
              }
            }}
          >
            <Share className="h-5 w-5 mr-3" />
            Поделиться поездкой
          </Button>
        </div>

        {/* Action Button */}
        {!isOwnRide && (
          <Button 
            onClick={handleBookRide}
            disabled={bookingLoading || ride?.available_seats === 0}
            className="w-full h-14 text-lg bg-blue-500 hover:bg-blue-600"
          >
            {bookingLoading ? 'Обработка...' : 
              ride?.instant_booking_enabled ? 'Забронировать сейчас' : 'Отправить заявку водителю'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default RideDetailsPage;
