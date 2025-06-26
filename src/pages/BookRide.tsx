
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, User, Star, MapPin, Clock, Car, MessageSquare, Loader2 } from 'lucide-react';
import { useRides } from '@/hooks/useRides';
import { useBookings } from '@/hooks/useBookings';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Extended interface to include all driver properties
interface ExtendedRide {
  id: string;
  from_city: string;
  to_city: string;
  departure_date: string;
  departure_time: string;
  price_per_seat: number;
  available_seats: number;
  description?: string;
  car_model?: string;
  car_color?: string;
  driver_id: string;
  driver?: {
    name: string;
    phone?: string;
    rating?: number;
    total_rides: number;
    is_verified?: boolean;
  };
}

const BookRide = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const { rides, isLoading: ridesLoading } = useRides();
  const { createBooking, isCreating } = useBookings();
  
  const [seats, setSeats] = useState(1);
  const [pickupLocation, setPickupLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const ride = rides.find(r => r.id === id) as ExtendedRide | undefined;

  if (ridesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Поездка не найдена</h1>
          <Button onClick={() => navigate('/search-rides')}>
            Вернуться к поиску
          </Button>
        </div>
      </div>
    );
  }

  const handleBooking = async () => {
    if (!user) {
      toast.error('Необходимо войти в систему');
      return;
    }

    try {
      await createBooking({
        ride_id: ride.id,
        passenger_id: user.id,
        seats_booked: seats,
        total_price: ride.price_per_seat * seats,
        pickup_location: pickupLocation,
        notes: notes,
        status: 'pending',
      });
      
      toast.success('Заявка на бронирование отправлена!');
      navigate('/passenger');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Не удалось отправить заявку');
    }
  };

  const handleContactDriver = async () => {
    if (!user) {
      toast.error('Необходимо войти в систему');
      return;
    }

    setIsCreatingChat(true);
    try {
      // Проверяем, существует ли уже чат между пользователями для этой поездки
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .eq('ride_id', ride.id)
        .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${ride.driver_id}),and(participant1_id.eq.${ride.driver_id},participant2_id.eq.${user.id})`)
        .maybeSingle();

      let chatId = existingChat?.id;

      // Если чат не существует, создаем новый
      if (!chatId) {
        // Сначала убеждаемся, что профиль водителя существует
        const { data: driverProfile } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('id', ride.driver_id)
          .single();

        if (!driverProfile) {
          // Создаем профиль водителя, если его нет
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
              id: ride.driver_id,
              name: ride.driver?.name || 'Водитель',
              phone: ride.driver?.phone || '',
              role: 'driver',
              is_verified: ride.driver?.is_verified || false,
              total_rides: ride.driver?.total_rides || 0,
              rating: ride.driver?.rating || 0
            }]);

          if (profileError) {
            console.error('Ошибка создания профиля водителя:', profileError);
            toast.error('Не удалось создать чат с водителем');
            return;
          }
        }

        const { data: newChat, error } = await supabase
          .from('chats')
          .insert([{
            ride_id: ride.id,
            participant1_id: user.id,
            participant2_id: ride.driver_id,
          }])
          .select('id')
          .single();

        if (error) {
          console.error('Ошибка создания чата:', error);
          toast.error('Не удалось создать чат');
          return;
        }
        chatId = newChat.id;
      }

      // Получаем информацию о водителе
      const { data: driverProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', ride.driver_id)
        .single();

      // Переходим к чату
      const params = new URLSearchParams({
        chatId: chatId,
        type: 'driver',
        rideId: ride.id,
        from: ride.from_city,
        to: ride.to_city,
        date: new Date(ride.departure_date).toLocaleDateString('ru-RU'),
        time: ride.departure_time
      });
      
      navigate(`/chat/${driverProfile?.name || 'Водитель'}?${params.toString()}`);
    } catch (error) {
      console.error('Chat creation error:', error);
      toast.error('Не удалось создать чат');
    } finally {
      setIsCreatingChat(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/search-rides')}
              className="rounded-xl hover:bg-yoldosh-primary/10 p-3"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад
            </Button>
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Бронирование поездки
              </h1>
            </div>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ride Details */}
          <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-800">Детали поездки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-yoldosh-blue/10 to-blue-100 p-4 rounded-2xl">
                <div className="flex items-center space-x-3 mb-3">
                  <MapPin className="h-5 w-5 text-yoldosh-blue" />
                  <div className="text-lg font-semibold text-slate-800">
                    {ride.from_city} → {ride.to_city}
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(ride.departure_date)} в {formatTime(ride.departure_time)}</span>
                  </div>
                </div>
              </div>

              {/* Driver Info */}
              <div className="bg-slate-50 p-4 rounded-2xl">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Водитель
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800">{ride.driver?.name}</div>
                    <div className="text-sm text-slate-600">{ride.driver?.phone || 'Телефон не указан'}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm text-slate-600 ml-1">
                          {ride.driver?.rating || 0} ({ride.driver?.total_rides || 0} поездок)
                        </span>
                      </div>
                      {ride.driver?.is_verified && (
                        <Badge className="bg-green-100 text-green-800 text-xs">✓ Проверен</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={handleContactDriver}
                    disabled={isCreatingChat}
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                  >
                    {isCreatingChat ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <MessageSquare className="h-4 w-4 mr-2" />
                    )}
                    Связаться
                  </Button>
                </div>
              </div>

              {/* Car Info */}
              {(ride.car_model || ride.car_color) && (
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center">
                    <Car className="h-5 w-5 mr-2" />
                    Автомобиль
                  </h3>
                  <div className="text-slate-600">
                    {ride.car_model} {ride.car_color && `(${ride.car_color})`}
                  </div>
                </div>
              )}

              {/* Price & Seats */}
              <div className="bg-green-50 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-700">
                      {ride.price_per_seat.toLocaleString()} сум
                    </div>
                    <div className="text-sm text-green-600">за место</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-slate-800">
                      {ride.available_seats} мест
                    </div>
                    <div className="text-sm text-slate-600">доступно</div>
                  </div>
                </div>
              </div>

              {ride.description && (
                <div className="bg-blue-50 p-4 rounded-2xl">
                  <h3 className="font-semibold text-slate-800 mb-2">Описание</h3>
                  <p className="text-slate-600 text-sm">{ride.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-800">Забронировать поездку</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Количество мест
                </label>
                <Input
                  type="number"
                  min="1"
                  max={ride.available_seats}
                  value={seats}
                  onChange={(e) => setSeats(parseInt(e.target.value) || 1)}
                  className="rounded-xl border-2 border-slate-200 focus:border-yoldosh-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Место посадки (необязательно)
                </label>
                <Input
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="Укажите удобное место посадки"
                  className="rounded-xl border-2 border-slate-200 focus:border-yoldosh-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Комментарий (необязательно)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Дополнительная информация для водителя"
                  className="rounded-xl border-2 border-slate-200 focus:border-yoldosh-primary resize-none"
                  rows={3}
                />
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-700">Количество мест:</span>
                  <span className="font-semibold">{seats}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-700">Цена за место:</span>
                  <span className="font-semibold">{ride.price_per_seat.toLocaleString()} сум</span>
                </div>
                <div className="border-t border-green-200 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-800">Итого:</span>
                    <span className="text-2xl font-bold text-green-700">
                      {(ride.price_per_seat * seats).toLocaleString()} сум
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleBooking}
                disabled={isCreating || seats > ride.available_seats}
                className="w-full bg-gradient-to-r from-yoldosh-primary to-blue-600 hover:from-blue-600 hover:to-yoldosh-primary text-white rounded-xl py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Отправка заявки...
                  </>
                ) : (
                  'Забронировать поездку'
                )}
              </Button>

              <p className="text-xs text-slate-500 text-center">
                После отправки заявки водитель сможет принять или отклонить ваше бронирование
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookRide;
