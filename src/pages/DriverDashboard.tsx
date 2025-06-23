
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Calendar, Users, Settings, User, Car } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  // Mock data for driver's rides
  const myRides = [
    {
      id: 1,
      from: 'Ташкент',
      to: 'Самарканд',
      date: '25 декабря',
      time: '09:00',
      price: 50000,
      seats: 3,
      bookedSeats: 1,
      status: 'active'
    },
    {
      id: 2,
      from: 'Самарканд',
      to: 'Бухара',
      date: '27 декабря',
      time: '14:00',
      price: 40000,
      seats: 4,
      bookedSeats: 2,
      status: 'active'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user?.isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="container mx-auto max-w-md">
          <Card className="mt-20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Car className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle>Требуется верификация</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Для создания поездок необходимо пройти верификацию водителя
              </p>
              <Button 
                onClick={() => navigate('/verification')}
                className="w-full bg-yoldosh-blue hover:bg-blue-700"
              >
                Пройти верификацию
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Панель водителя</h1>
              <p className="text-gray-600">Добро пожаловать, {user?.phone}</p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
              >
                <User className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => navigate('/create-ride')}
                className="h-20 bg-yoldosh-green hover:bg-green-700"
              >
                <div className="flex flex-col items-center">
                  <Plus className="h-6 w-6 mb-2" />
                  <span>Создать поездку</span>
                </div>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/search-rides')}
                className="h-20 border-yoldosh-blue text-yoldosh-blue hover:bg-blue-50"
              >
                <div className="flex flex-col items-center">
                  <MapPin className="h-6 w-6 mb-2" />
                  <span>Найти поездку</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* My Rides */}
        <Card>
          <CardHeader>
            <CardTitle>Мои поездки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myRides.map((ride) => (
              <div key={ride.id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{ride.from} → {ride.to}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{ride.date} в {ride.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{ride.bookedSeats}/{ride.seats} мест</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-yoldosh-green">
                      {ride.price.toLocaleString()} сум
                    </div>
                    <Badge className={getStatusColor(ride.status)}>
                      Активна
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yoldosh-blue">12</div>
              <div className="text-sm text-gray-600">Поездок</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yoldosh-green">4.8</div>
              <div className="text-sm text-gray-600">Рейтинг</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yoldosh-orange">42</div>
              <div className="text-sm text-gray-600">Пассажиров</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
