
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Calendar, Users, Settings, User, Star } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const PassengerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  // Mock data for available rides
  const availableRides = [
    {
      id: 1,
      driver: {
        name: 'Алишер',
        rating: 4.9,
        reviews: 24,
        photo: '/placeholder.svg'
      },
      from: 'Ташкент',
      to: 'Самарканд',
      date: '25 декабря',
      time: '09:00',
      price: 50000,
      seats: 3,
      car: 'Chevrolet Lacetti',
      comfort: 'Комфорт'
    },
    {
      id: 2,
      driver: {
        name: 'Жасур',
        rating: 4.7,
        reviews: 18,
        photo: '/placeholder.svg'
      },
      from: 'Ташкент',
      to: 'Самарканд',
      date: '25 декабря',
      time: '14:30',
      price: 45000,
      seats: 2,
      car: 'Hyundai Accent',
      comfort: 'Эконом'
    }
  ];

  const popularRoutes = [
    { from: 'Ташкент', to: 'Самарканд', count: '12 поездок' },
    { from: 'Ташкент', to: 'Бухара', count: '8 поездок' },
    { from: 'Самарканд', to: 'Бухара', count: '6 поездок' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Поиск поездок</h1>
              <p className="text-gray-600">Найдите попутчика</p>
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
        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle>Поиск поездки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Откуда</label>
                <Input
                  placeholder="Город отправления"
                  value={searchFrom}
                  onChange={(e) => setSearchFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Куда</label>
                <Input
                  placeholder="Город назначения"
                  value={searchTo}
                  onChange={(e) => setSearchTo(e.target.value)}
                />
              </div>
            </div>
            <Button 
              onClick={() => navigate('/search-rides')}
              className="w-full bg-yoldosh-blue hover:bg-blue-700"
            >
              <Search className="h-4 w-4 mr-2" />
              Найти поездки
            </Button>
          </CardContent>
        </Card>

        {/* Popular Routes */}
        <Card>
          <CardHeader>
            <CardTitle>Популярные маршруты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popularRoutes.map((route, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{route.from} → {route.to}</span>
                  </div>
                  <span className="text-sm text-gray-600">{route.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Rides */}
        <Card>
          <CardHeader>
            <CardTitle>Доступные поездки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableRides.map((ride) => (
              <div key={ride.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium">{ride.driver.name}</div>
                      <div className="flex items-center space-x-1 text-sm">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span>{ride.driver.rating}</span>
                        <span className="text-gray-500">({ride.driver.reviews})</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-yoldosh-green">
                      {ride.price.toLocaleString()} сум
                    </div>
                    <Badge variant="outline">{ride.comfort}</Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{ride.from} → {ride.to}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{ride.date} в {ride.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{ride.seats} мест</span>
                      </div>
                    </div>
                    <span className="font-medium">{ride.car}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PassengerDashboard;
