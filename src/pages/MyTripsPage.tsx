
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Clock, Star, User } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { useUser } from '@/contexts/UserContext';
import BottomNavigation from '@/components/BottomNavigation';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const MyTripsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: userLoading } = useUser();
  const { bookings, isLoading, error } = useBookings();

  console.log('MyTripsPage - User:', user);
  console.log('MyTripsPage - isAuthenticated:', isAuthenticated);
  console.log('MyTripsPage - userLoading:', userLoading);
  console.log('MyTripsPage - bookings:', bookings);
  console.log('MyTripsPage - isLoading:', isLoading);
  console.log('MyTripsPage - error:', error);

  // Redirect to registration if not authenticated
  React.useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      console.log('Redirecting to registration - not authenticated');
      navigate('/registration');
    }
  }, [isAuthenticated, userLoading, navigate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Завершена</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800">Подтверждена</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Ожидает</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Отменена</Badge>;
      default:
        return <Badge variant="outline">Неизвестно</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMMM yyyy', { locale: ru });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      // Handle time format from database
      return timeStr.slice(0, 5); // Get HH:MM format
    } catch {
      return timeStr;
    }
  };

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 pb-24">
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
          <div className="flex justify-center items-center h-64">
            <div className="text-slate-500">Загрузка...</div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 pb-24">
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
          <div className="flex justify-center items-center h-64">
            <div className="text-slate-500">Загрузка поездок...</div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 pb-24">
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
          <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-2xl shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="text-red-500 text-lg mb-2">Ошибка загрузки</div>
              <div className="text-slate-500 text-sm mb-6">
                Не удалось загрузить поездки. Попробуйте обновить страницу.
              </div>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Обновить
              </Button>
            </CardContent>
          </Card>
        </div>
        <BottomNavigation />
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
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-2xl shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="text-slate-400 text-lg mb-2">Поездок пока нет</div>
                <div className="text-slate-500 text-sm mb-6">
                  Забронируйте свою первую поездку и она появится здесь
                </div>
                <Button 
                  onClick={() => navigate('/passenger')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Найти поездку
                </Button>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id} className="bg-white/80 backdrop-blur-lg border-0 rounded-2xl shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-slate-900">
                            {booking.ride?.driver?.name || 'Водитель'}
                          </span>
                          {booking.ride?.driver?.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-slate-600">
                                {booking.ride.driver.rating}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">Водитель</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {getStatusBadge(booking.status)}
                      <div className="font-bold text-lg text-slate-900 mt-1">
                        {booking.total_price.toLocaleString()} сум
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {booking.ride && (
                      <>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-slate-900">
                            {booking.ride.from_city} → {booking.ride.to_city}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(booking.ride.departure_date)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatTime(booking.ride.departure_time)}</span>
                            </div>
                          </div>
                          <div className="text-slate-600">
                            {booking.seats_booked} место{booking.seats_booked > 1 ? (booking.seats_booked > 4 ? 'мест' : 'а') : ''}
                          </div>
                        </div>
                      </>
                    )}

                    {booking.pickup_location && (
                      <div className="text-sm text-slate-600">
                        <span className="font-medium">Место посадки:</span> {booking.pickup_location}
                      </div>
                    )}

                    {booking.notes && (
                      <div className="text-sm text-slate-600">
                        <span className="font-medium">Заметки:</span> {booking.notes}
                      </div>
                    )}
                  </div>

                  {booking.status === 'completed' && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => navigate(`/ride-details/${booking.ride_id}`)}
                      >
                        Оставить отзыв
                      </Button>
                    </div>
                  )}
                  
                  {booking.status === 'confirmed' && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/chat/${booking.ride?.driver?.name || 'driver'}`)}
                      >
                        Связаться с водителем
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          // TODO: Implement booking cancellation
                          console.log('Cancel booking:', booking.id);
                        }}
                      >
                        Отменить поездку
                      </Button>
                    </div>
                  )}

                  {booking.status === 'pending' && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="text-sm text-slate-500 text-center">
                        Ожидает подтверждения от водителя
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default MyTripsPage;
