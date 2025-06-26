import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Users, Star, User, Phone, MessageCircle, Car, Clock, Shield, Loader2 } from 'lucide-react';
import { useRides } from '@/hooks/useRides';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const DriverRideDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { rides } = useRides();

  // Находим поездку по ID
  const ride = rides.find(r => r.id === id);

  // Получаем пассажиров для этой поездки
  const { data: passengers = [], isLoading: passengersLoading } = useQuery({
    queryKey: ['ride-passengers', id],
    queryFn: async () => {
      if (!id) return [];
      
      console.log('DriverRideDetails - Загрузка пассажиров для поездки:', id);
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles!bookings_passenger_id_fkey (
            name,
            phone,
            rating,
            total_rides,
            created_at
          )
        `)
        .eq('ride_id', id)
        .eq('status', 'confirmed');

      if (error) {
        console.error('DriverRideDetails - Ошибка загрузки пассажиров:', error);
        throw error;
      }

      console.log('DriverRideDetails - Загружено пассажиров:', data?.length || 0);
      
      return data.map(booking => ({
        id: booking.id,
        seats_booked: booking.seats_booked,
        total_price: booking.total_price,
        notes: booking.notes,
        created_at: booking.created_at,
        passenger: {
          name: booking.profiles?.name || 'Неизвестен',
          phone: booking.profiles?.phone || '',
          rating: booking.profiles?.rating || 0,
          total_rides: booking.profiles?.total_rides || 0,
          joinDate: booking.profiles?.created_at ? new Date(booking.profiles.created_at).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' }) : 'Неизвестно'
        }
      }));
    },
    enabled: !!id,
  });

  const handleCallPassenger = (phone: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleMessagePassenger = (passengerName: string) => {
    navigate(`/chat/${passengerName}`);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
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

  if (!ride) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Поездка не найдена</h2>
            <Button onClick={() => navigate('/driver')} className="bg-gradient-secondary">
              Вернуться к поездкам
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const totalBookedSeats = passengers.reduce((sum, p) => sum + p.seats_booked, 0);
  const totalEarnings = passengers.reduce((sum, p) => sum + p.total_price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/driver')}
              className="hover:bg-yoldosh-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <h1 className="text-xl font-bold text-slate-800">Детали поездки</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Route Info */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-800">
              <MapPin className="h-6 w-6 mr-3 text-yoldosh-primary" />
              Информация о поездке
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-5 w-5 text-yoldosh-primary" />
                    <span className="font-semibold text-slate-800">Маршрут</span>
                  </div>
                  <div className="text-lg font-bold text-slate-800">
                    {ride.from_city} → {ride.to_city}
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-2xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-5 w-5 text-yoldosh-success" />
                    <span className="font-semibold text-slate-800">Дата и время</span>
                  </div>
                  <div className="text-lg font-bold text-slate-800">{formatDate(ride.departure_date)}</div>
                  <div className="text-sm text-slate-600">Отправление в {formatTime(ride.departure_time)}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-5 w-5 text-yoldosh-accent" />
                    <span className="font-semibold text-slate-800">Места</span>
                  </div>
                  <div className="text-lg font-bold text-slate-800">
                    {totalBookedSeats} из {ride.available_seats} забронировано
                  </div>
                  <div className="text-sm text-slate-600">
                    {ride.available_seats - totalBookedSeats} свободных мест
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">💰</span>
                    <span className="font-semibold text-slate-800">Доходы</span>
                  </div>
                  <div className="text-xl font-bold text-yoldosh-success">
                    {totalEarnings.toLocaleString()} сум
                  </div>
                  <div className="text-xs text-slate-500">
                    Цена за место: {ride.price_per_seat.toLocaleString()} сум
                  </div>
                </div>
              </div>
            </div>

            {/* Car and Description Info */}
            {(ride.car_model || ride.description) && (
              <div className="mt-6 space-y-4">
                {ride.car_model && (
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <h4 className="font-semibold mb-2 text-slate-800 flex items-center">
                      <Car className="h-4 w-4 mr-2" />
                      Автомобиль
                    </h4>
                    <div className="text-sm text-slate-600">
                      {ride.car_model} {ride.car_color && `• ${ride.car_color}`}
                    </div>
                  </div>
                )}
                
                {ride.description && (
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <h4 className="font-semibold mb-2 text-slate-800">Описание поездки</h4>
                    <p className="text-sm text-slate-600">{ride.description}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Passengers */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-800">
              <Users className="h-6 w-6 mr-3 text-yoldosh-secondary" />
              Пассажиры ({passengers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {passengersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : passengers.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Пока нет подтвержденных пассажиров
              </div>
            ) : (
              passengers.map((passengerBooking) => (
                <div key={passengerBooking.id} className="bg-gradient-to-r from-white to-slate-50 rounded-2xl p-6 shadow-md border border-slate-100">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-bold text-slate-800">{passengerBooking.passenger.name}</h3>
                        <Badge className="bg-yoldosh-success/20 text-yoldosh-success border-0">
                          <Shield className="h-3 w-3 mr-1" />
                          Подтвержден
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>{passengerBooking.passenger.rating}</span>
                          <span>({passengerBooking.passenger.total_rides} поездок)</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Car className="h-4 w-4" />
                          <span>{passengerBooking.seats_booked} место(а)</span>
                        </div>
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        Зарегистрирован: {passengerBooking.passenger.joinDate}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl text-yoldosh-success mb-2">
                        {passengerBooking.total_price.toLocaleString()} сум
                      </div>
                      <div className="flex space-x-2">
                        {passengerBooking.passenger.phone && (
                          <Button
                            onClick={() => handleCallPassenger(passengerBooking.passenger.phone)}
                            size="sm"
                            className="bg-yoldosh-success hover:bg-green-700 rounded-xl"
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          onClick={() => handleMessagePassenger(passengerBooking.passenger.name)}
                          size="sm"
                          variant="outline"
                          className="rounded-xl border-yoldosh-primary text-yoldosh-primary hover:bg-yoldosh-primary/10"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Special requests */}
                  {passengerBooking.notes && (
                    <div className="bg-blue-50 p-3 rounded-xl">
                      <h4 className="font-semibold mb-1 text-slate-800 text-sm">Комментарий пассажира</h4>
                      <p className="text-sm text-slate-700 italic">"{passengerBooking.notes}"</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => navigate(`/edit-ride/${ride.id}`)}
            variant="outline"
            className="h-14 rounded-2xl border-2 border-yoldosh-secondary text-yoldosh-secondary hover:bg-yoldosh-secondary/10"
          >
            Редактировать поездку
          </Button>
          <Button
            onClick={() => navigate('/driver')}
            className="h-14 bg-gradient-secondary hover:scale-105 transition-all duration-300 rounded-2xl"
          >
            Вернуться к поездкам
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DriverRideDetails;
