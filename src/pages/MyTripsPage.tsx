
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Clock, Star, User } from 'lucide-react';
import { useRides } from '@/hooks/useRides';
import { useUser } from '@/contexts/UserContext';
import BottomNavigation from '@/components/BottomNavigation';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const MyTripsPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getUserRides } = useRides();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTrips();
    }
  }, [user]);

  const loadTrips = async () => {
    try {
      const data = await getUserRides();
      setTrips(data);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Завершена</Badge>;
      case 'pending':
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800">Предстоящая</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Отменена</Badge>;
      default:
        return <Badge variant="outline">Неизвестно</Badge>;
    }
  };

  const formatTripData = (trip: any) => {
    if (user?.role === 'driver') {
      return {
        from: trip.from_city,
        to: trip.to_city,
        date: format(new Date(trip.departure_date), 'dd MMMM yyyy', { locale: ru }),
        time: trip.departure_time,
        status: trip.status,
        price: trip.price_per_seat,
        passengers: trip.available_seats
      };
    } else {
      return {
        from: trip.ride?.from_city,
        to: trip.ride?.to_city,
        date: format(new Date(trip.ride?.departure_date), 'dd MMMM yyyy', { locale: ru }),
        time: trip.ride?.departure_time,
        status: trip.status,
        driver: trip.ride?.driver?.name,
        price: trip.total_price,
        passengers: trip.seats_booked
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Загружаем ваши поездки...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 pb-24">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/passenger')}
              className="rounded-xl hover:bg-slate-100 p-3"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад
            </Button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900">
                Мои поездки
              </h1>
              <p className="text-slate-600 mt-1">История ваших поездок</p>
            </div>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {trips.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Поездок пока нет</h3>
            <p className="text-slate-600 mb-6">Начните свое первое путешествие с нами!</p>
            <Button
              onClick={() => navigate('/passenger')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Найти поездку
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip, index) => {
              const tripData = formatTripData(trip);
              return (
                <Card key={trip.id || index} className="bg-white/80 backdrop-blur-lg border-0 rounded-2xl shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      {user?.role === 'passenger' && tripData.driver && (
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-slate-900">{tripData.driver}</span>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="text-xs text-slate-600">4.8</span>
                              </div>
                            </div>
                            <div className="text-xs text-slate-500">Водитель</div>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-right">
                        {getStatusBadge(tripData.status)}
                        <div className="font-bold text-lg text-slate-900 mt-1">
                          {tripData.price?.toLocaleString()} сум
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-slate-900">{tripData.from} → {tripData.to}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{tripData.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{tripData.time}</span>
                          </div>
                        </div>
                        <div className="text-slate-600">
                          {tripData.passengers} {user?.role === 'driver' ? 'мест' : 'пассажир'}
                        </div>
                      </div>
                    </div>

                    {tripData.status === 'completed' && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => navigate(`/ride-details/${trip.id}`)}
                        >
                          Оставить отзыв
                        </Button>
                      </div>
                    )}
                    
                    {(tripData.status === 'pending' || tripData.status === 'confirmed') && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex space-x-2">
                        {user?.role === 'passenger' && tripData.driver && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => navigate(`/chat/${tripData.driver}`)}
                          >
                            Связаться с водителем
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          Отменить поездку
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default MyTripsPage;
