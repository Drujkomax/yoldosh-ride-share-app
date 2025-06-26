
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MapPin, Calendar, Users, Star, User, Car, Phone, MessageCircle, Minus, Plus } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useRides } from '@/hooks/useRides';
import { useBookings } from '@/hooks/useBookings';
import { toast } from 'sonner';

const BookRide = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const { rides } = useRides();
  const { createBooking, isCreating } = useBookings();
  
  const [seatsCount, setSeatsCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');

  // Находим поездку по ID
  const ride = rides.find(r => r.id === id);

  if (!ride) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Поездка не найдена</h2>
          <Button onClick={() => navigate('/search-rides')}>
            Вернуться к поиску
          </Button>
        </div>
      </div>
    );
  }

  const totalPrice = ride.price_per_seat * seatsCount;

  const handleBooking = async () => {
    if (!user) {
      toast.error("Необходимо войти в систему");
      return;
    }

    if (seatsCount <= 0 || seatsCount > ride.available_seats) {
      toast.error("Некорректное количество мест");
      return;
    }

    try {
      console.log('BookRide - Создание бронирования:', {
        ride_id: ride.id,
        passenger_id: user.id,
        seats_booked: seatsCount,
        total_price: totalPrice,
        status: 'pending',
        notes: notes || undefined,
        pickup_location: pickupLocation || undefined
      });

      await createBooking({
        ride_id: ride.id,
        passenger_id: user.id,
        seats_booked: seatsCount,
        total_price: totalPrice,
        status: 'pending',
        notes: notes || undefined,
        pickup_location: pickupLocation || undefined
      });

      // Перенаправляем на страницу мои поездки
      navigate('/my-trips');
    } catch (error) {
      console.error('BookRide - Ошибка бронирования:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
      });
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <h1 className="text-xl font-bold">Бронирование поездки</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Route Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-yoldosh-blue rounded-xl flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-xl">{ride.from_city} → {ride.to_city}</div>
                    <div className="text-gray-500">Поездка</div>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(ride.departure_date)} в {formatTime(ride.departure_time)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{ride.available_seats} мест доступно</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-3xl text-yoldosh-green">
                  {ride.price_per_seat.toLocaleString()} сум
                </div>
                <div className="text-sm text-gray-500">за место</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver Info */}
        <Card>
          <CardHeader>
            <CardTitle>Водитель</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-bold text-lg">{ride.driver?.name || 'Водитель'}</span>
                  <Badge variant="secondary" className="text-xs">
                    ✓ Проверен
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{ride.driver?.rating || '0.0'}</span>
                  </div>
                  <span>{ride.driver?.total_rides || 0} поездок</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Car Info */}
        {(ride.car_model || ride.car_color) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Car className="h-5 w-5 mr-2" />
                Автомобиль
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {ride.car_model && (
                  <div>
                    <span className="font-medium">Модель:</span> {ride.car_model}
                  </div>
                )}
                {ride.car_color && (
                  <div>
                    <span className="font-medium">Цвет:</span> {ride.car_color}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Description */}
        {ride.description && (
          <Card>
            <CardHeader>
              <CardTitle>Описание поездки</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{ride.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle>Детали бронирования</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Seats Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Количество мест
              </label>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSeatsCount(Math.max(1, seatsCount - 1))}
                  disabled={seatsCount <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-bold w-8 text-center">{seatsCount}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSeatsCount(Math.min(ride.available_seats, seatsCount + 1))}
                  disabled={seatsCount >= ride.available_seats}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Pickup Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Место посадки (необязательно)
              </label>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Укажите удобное место посадки"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yoldosh-blue"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Комментарий (необязательно)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Дополнительная информация для водителя"
                rows={3}
              />
            </div>

            {/* Total Price */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Итого к оплате:</span>
                <span className="text-2xl font-bold text-yoldosh-green">
                  {totalPrice.toLocaleString()} сум
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {ride.price_per_seat.toLocaleString()} сум × {seatsCount} место
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <Button 
          onClick={handleBooking}
          disabled={isCreating || !user}
          className="w-full h-14 text-lg bg-yoldosh-green hover:bg-green-700"
        >
          {isCreating ? 'Отправка...' : 'Отправить запрос на бронирование'}
        </Button>
      </div>
    </div>
  );
};

export default BookRide;
