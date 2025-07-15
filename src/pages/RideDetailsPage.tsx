import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Users, Star, User, Car, MessageCircle, ChevronLeft } from 'lucide-react';
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

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMMM yyyy', { locale: ru });
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
    if (!user?.id) {
      toast.error('Необходимо войти в систему для бронирования');
      return;
    }

    if (user.id === ride.driver_id) {
      toast.error('Нельзя забронировать свою собственную поездку');
      return;
    }

    setBookingLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          ride_id: ride.id,
          passenger_id: user.id,
          seats_booked: 1,
          total_price: ride.price_per_seat,
          status: 'pending'
        });

      if (error) throw error;
      
      toast.success('Запрос на бронирование отправлен!');
      navigate('/my-trips');
    } catch (error) {
      console.error('Error booking ride:', error);
      toast.error('Ошибка при бронировании поездки');
    } finally {
      setBookingLoading(false);
    }
  };


  const handleChatWithDriver = () => {
    navigate(`/chat/${ride.profiles?.name}?type=driver&rideId=${id}&from=${ride.from_city}&to=${ride.to_city}&date=${ride.departure_date}&time=${ride.departure_time}`);
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
      <div className="bg-white border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </Button>
            <h1 className="text-lg font-bold">Детали поездки</h1>
            <div className="w-10" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Date Header */}
        <div className="text-center py-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {formatDate(ride.departure_date)}
          </h2>
        </div>

        {/* Route Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {formatTime(ride.departure_time)}
                    </div>
                  </div>
                  
                  <div className="flex-1 relative">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                      <div className="flex-1 h-px bg-gray-300 mx-2"></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1 text-gray-600">
                      <span>{ride.from_city}</span>
                      <span>{ride.to_city}</span>
                    </div>
                    <div className="text-center text-xs text-gray-500 mt-2">
                      {loadingRouteInfo ? 'Загрузка...' : routeInfo?.duration || `${ride.duration_hours}ч`}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {(() => {
                        if (loadingRouteInfo) return 'Загрузка...';
                        if (routeInfo?.duration) {
                          // Парсим время отправления
                          const [hours, minutes] = ride.departure_time.split(':').map(Number);
                          // Парсим длительность из API (например, "2 ч 30 мин")
                          const durationText = routeInfo.duration;
                          const hoursMatch = durationText.match(/(\d+)\s*ч/);
                          const minutesMatch = durationText.match(/(\d+)\s*мин/);
                          
                          const durationHours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
                          const durationMinutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
                          
                          // Рассчитываем время прибытия
                          const arrivalTime = new Date();
                          arrivalTime.setHours(hours + durationHours);
                          arrivalTime.setMinutes(minutes + durationMinutes);
                          
                          return formatTime(arrivalTime.toTimeString());
                        }
                        // Fallback к stored arrival time
                        return formatTime(ride.estimated_arrival_time?.split('T')[1] || '00:00');
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center py-4 border-t border-gray-100">
              <div className="text-2xl font-bold text-gray-900">
                {Math.floor(ride.price_per_seat).toLocaleString('ru-RU')} сум
              </div>
              <div className="text-sm text-gray-500">на человека</div>
            </div>
          </CardContent>
        </Card>

        {/* Driver Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-bold text-lg">{ride.profiles?.name || 'Водитель'}</span>
                  <Badge variant="secondary" className="text-xs">
                    ✓ Проверен
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div 
                    className="flex items-center space-x-1 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => navigate(`/driver-reviews/${ride.driver_id}`)}
                  >
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{ride.profiles?.rating || 5.0}</span>
                  </div>
                  <span>{ride.profiles?.total_rides || 0} поездок</span>
                </div>
              </div>
            </div>

            {!isOwnRide && (
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  className="w-full max-w-xs"
                  onClick={handleChatWithDriver}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Написать сообщение
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Car Info */}
        {ride.user_cars && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Car className="h-5 w-5 mr-2" />
                Автомобиль
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>{ride.user_cars.make} {ride.user_cars.model}</div>
                {ride.user_cars.year && <div>Год: {ride.user_cars.year}</div>}
                {ride.user_cars.color && <div>Цвет: {ride.user_cars.color}</div>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Info */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Доступно мест</span>
                <span className="font-medium">{ride.available_seats}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Подтверждение</span>
                <span className="text-sm text-gray-500">
                  Бронирование подтверждается водителем
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rules */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Максимум 2 сзади</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 flex items-center justify-center">🚭</div>
                <span className="text-sm">Курение запрещено</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        {!isOwnRide && (
          <Button 
            onClick={handleBookRide}
            disabled={bookingLoading || ride.available_seats === 0}
            className="w-full h-14 text-lg bg-blue-500 hover:bg-blue-600"
          >
            {bookingLoading ? 'Бронирование...' : 'Забронировать поездку'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default RideDetailsPage;