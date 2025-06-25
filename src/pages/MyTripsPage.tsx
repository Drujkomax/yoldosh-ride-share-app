
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MapPin, Calendar, Clock, Users, Car, MessageCircle, Star, Phone } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useRides } from '@/hooks/useRides';
import BottomNavigation from '@/components/BottomNavigation';
import { toast } from '@/hooks/use-toast';

const MyTripsPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getUserRides, loading } = useRides();
  const [trips, setTrips] = useState<any[]>([]);

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
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить поездки",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'active': { label: 'Активна', color: 'bg-green-100 text-green-800' },
      'pending': { label: 'Ожидает', color: 'bg-yellow-100 text-yellow-800' },
      'confirmed': { label: 'Подтверждена', color: 'bg-blue-100 text-blue-800' },
      'completed': { label: 'Завершена', color: 'bg-gray-100 text-gray-800' },
      'cancelled': { label: 'Отменена', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const renderDriverTrips = () => {
    if (!trips.length) {
      return (
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardContent className="p-12 text-center">
            <Car className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">Нет созданных поездок</h3>
            <p className="text-slate-500 mb-6">Создайте свою первую поездку, чтобы найти пассажиров</p>
            <Button 
              onClick={() => navigate('/create-ride')}
              className="bg-gradient-primary hover:scale-105 transition-all duration-300"
            >
              Создать поездку
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {trips.map((ride) => (
          <Card key={ride.id} className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-5 w-5 text-yoldosh-primary" />
                    <span className="font-semibold text-lg text-slate-800">
                      {ride.from_city} → {ride.to_city}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(ride.departure_date).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{ride.departure_time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{ride.available_seats} мест</span>
                    </div>
                  </div>
                  {ride.description && (
                    <p className="text-sm text-slate-600 mb-3">{ride.description}</p>
                  )}
                </div>
                <div className="text-right">
                  {getStatusBadge(ride.status)}
                  <div className="font-bold text-xl text-yoldosh-success mt-2">
                    {ride.price_per_seat.toLocaleString()} сум
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-xl hover:scale-105 transition-all duration-300"
                  onClick={() => navigate(`/driver-ride-details/${ride.id}`)}
                >
                  Управление
                </Button>
                {ride.status === 'active' && (
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl hover:scale-105 transition-all duration-300"
                    onClick={() => navigate(`/edit-ride/${ride.id}`)}
                  >
                    Редактировать
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderPassengerTrips = () => {
    if (!trips.length) {
      return (
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">Нет забронированных поездок</h3>
            <p className="text-slate-500 mb-6">Найдите поездку, чтобы добраться до места назначения</p>
            <Button 
              onClick={() => navigate('/passenger')}
              className="bg-gradient-primary hover:scale-105 transition-all duration-300"
            >
              Найти поездку
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {trips.map((booking) => {
          const ride = booking.ride;
          if (!ride) return null;
          
          return (
            <Card key={booking.id} className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-5 w-5 text-yoldosh-primary" />
                      <span className="font-semibold text-lg text-slate-800">
                        {ride.from_city} → {ride.to_city}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(ride.departure_date).toLocaleDateString('ru-RU')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{ride.departure_time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{booking.seats_booked} мест</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <span>Водитель:</span>
                      <span className="font-medium">{ride.driver?.name || 'Неизвестно'}</span>
                      {ride.driver?.is_verified && (
                        <Badge className="bg-green-100 text-green-800 text-xs">Проверен</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(booking.status)}
                    <div className="font-bold text-xl text-yoldosh-success mt-2">
                      {booking.total_price.toLocaleString()} сум
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl hover:scale-105 transition-all duration-300"
                    onClick={() => navigate(`/ride-details/${ride.id}`)}
                  >
                    Детали
                  </Button>
                  {ride.driver && (
                    <Button 
                      variant="outline" 
                      className="flex-1 rounded-xl hover:scale-105 transition-all duration-300"
                      onClick={() => navigate(`/chat/${ride.driver.name}`)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Чат
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl p-8">
          <CardContent className="text-center">
            <h2 className="text-xl font-semibold mb-4">Требуется авторизация</h2>
            <Button onClick={() => navigate('/')}>Войти</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="rounded-xl hover:bg-yoldosh-primary/10 p-3 hover:scale-105 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Мои поездки
            </h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue={user.role === 'driver' ? 'driver' : 'passenger'} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-lg rounded-2xl p-2 shadow-lg">
            {user.role === 'driver' && (
              <TabsTrigger 
                value="driver" 
                className="rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-white transition-all duration-300"
              >
                <Car className="h-4 w-4 mr-2" />
                Мои поездки
              </TabsTrigger>
            )}
            {user.role === 'passenger' && (
              <TabsTrigger 
                value="passenger" 
                className="rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-white transition-all duration-300"
              >
                <Users className="h-4 w-4 mr-2" />
                Забронированные
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="history" 
              className="rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-white transition-all duration-300"
            >
              <Clock className="h-4 w-4 mr-2" />
              История
            </TabsTrigger>
          </TabsList>

          {user.role === 'driver' && (
            <TabsContent value="driver" className="space-y-6">
              {loading ? (
                <div className="text-center py-8">Загрузка...</div>
              ) : (
                renderDriverTrips()
              )}
            </TabsContent>
          )}

          {user.role === 'passenger' && (
            <TabsContent value="passenger" className="space-y-6">
              {loading ? (
                <div className="text-center py-8">Загрузка...</div>
              ) : (
                renderPassengerTrips()
              )}
            </TabsContent>
          )}

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
              <CardContent className="p-12 text-center">
                <Clock className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">История пуста</h3>
                <p className="text-slate-500">Завершенные поездки будут отображаться здесь</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default MyTripsPage;
