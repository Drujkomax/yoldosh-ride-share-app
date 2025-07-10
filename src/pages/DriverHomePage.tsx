import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Users, Clock, MoreVertical, Plus } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useRides } from '@/hooks/useRides';
import BottomNavigation from '@/components/BottomNavigation';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const DriverHomePage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { rides, isLoading } = useRides();
  const [myRides, setMyRides] = useState<any[]>([]);

  useEffect(() => {
    if (user && rides) {
      const driverRides = rides.filter(ride => ride.driver_id === user.id);
      setMyRides(driverRides);
    }
  }, [user, rides]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'full':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активная';
      case 'full':
        return 'Заполнена';
      case 'completed':
        return 'Завершена';
      case 'cancelled':
        return 'Отменена';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка поездок...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Мои поездки</h1>
            <p className="text-sm text-gray-500">
              {myRides.length} {myRides.length === 1 ? 'поездка' : 'поездок'}
            </p>
          </div>
          <Button
            onClick={() => navigate('/ride-creation-flow')}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Создать
          </Button>
        </div>
      </div>

      {/* Rides List */}
      <div className="px-6 py-4 space-y-4">
        {myRides.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              У вас пока нет поездок
            </h3>
            <p className="text-gray-500 mb-6">
              Создайте первую поездку и начните зарабатывать
            </p>
            <Button
              onClick={() => navigate('/ride-creation-flow')}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-6 py-3"
            >
              <Plus className="w-4 h-4 mr-2" />
              Создать поездку
            </Button>
          </div>
        ) : (
          myRides.map((ride) => (
            <Card key={ride.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {ride.from_city} → {ride.to_city}
                      </h3>
                      <Badge className={getStatusColor(ride.status)}>
                        {getStatusText(ride.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <CalendarDays className="w-4 h-4" />
                        <span>
                          {format(new Date(ride.departure_date), 'EEE dd MMM', { locale: ru })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{ride.departure_time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{ride.available_seats} мест</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-gray-900">
                        {ride.price_per_seat.toLocaleString()} сум
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/ride/${ride.id}`)}
                        className="rounded-lg"
                      >
                        Подробнее
                      </Button>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="ml-2">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default DriverHomePage;