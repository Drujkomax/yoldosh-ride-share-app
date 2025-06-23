
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Calendar, Users, Settings, User, Star, Plus } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import CitySelect from '@/components/CitySelect';

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
      bookedSeats: 1,
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
      bookedSeats: 0,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Поиск поездок
              </h1>
              <p className="text-slate-600 mt-1">Найдите идеального попутчика</p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="rounded-xl hover:bg-yoldosh-primary/10 p-3"
              >
                <User className="h-5 w-5 text-yoldosh-primary" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="rounded-xl hover:bg-yoldosh-primary/10 p-3"
              >
                <Settings className="h-5 w-5 text-yoldosh-primary" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => navigate('/search-rides')}
            className="h-16 bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-2xl shadow-lg"
          >
            <div className="flex items-center">
              <Search className="h-5 w-5 mr-3" />
              <span className="font-semibold">Найти поездку</span>
            </div>
          </Button>
          <Button
            onClick={() => navigate('/create-ride')}
            variant="outline"
            className="h-16 border-2 border-yoldosh-secondary text-yoldosh-secondary hover:bg-yoldosh-secondary/10 hover:scale-105 transition-all duration-300 rounded-2xl"
          >
            <div className="flex items-center">
              <Plus className="h-5 w-5 mr-3" />
              <span className="font-semibold">Создать заявку</span>
            </div>
          </Button>
        </div>

        {/* Search Form */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">Быстрый поиск</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CitySelect
                value={searchFrom}
                onValueChange={setSearchFrom}
                placeholder="Город отправления"
                label="Откуда"
              />
              <CitySelect
                value={searchTo}
                onValueChange={setSearchTo}
                placeholder="Город назначения"
                label="Куда"
              />
            </div>
            <Button 
              onClick={() => navigate('/search-rides')}
              className="w-full h-14 text-lg bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-2xl shadow-lg"
            >
              <Search className="h-5 w-5 mr-3" />
              Найти поездки
            </Button>
          </CardContent>
        </Card>

        {/* Popular Routes */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl animate-slide-up">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">Популярные маршруты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularRoutes.map((route, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-yoldosh-primary/5 to-yoldosh-secondary/5 rounded-2xl hover:from-yoldosh-primary/10 hover:to-yoldosh-secondary/10 cursor-pointer transition-all duration-300 hover:scale-105"
                  onClick={() => navigate('/search-rides')}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-slate-800">{route.from} → {route.to}</span>
                  </div>
                  <span className="text-sm text-slate-600 bg-white/60 px-3 py-1 rounded-full">
                    {route.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Available Rides */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">Доступные поездки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {availableRides.map((ride) => (
              <div key={ride.id} className="bg-gradient-to-r from-white to-slate-50 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center">
                      <User className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-lg">{ride.driver.name}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Star className="h-4 w-4 text-amber-400 fill-current" />
                        <span className="font-medium">{ride.driver.rating}</span>
                        <span className="text-slate-500 text-sm">({ride.driver.reviews})</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-2xl text-yoldosh-success">
                      {ride.price.toLocaleString()} сум
                    </div>
                    <Badge className="mt-1 bg-yoldosh-primary/10 text-yoldosh-primary border-0">
                      {ride.comfort}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-slate-400" />
                    <span className="font-semibold text-slate-800">{ride.from} → {ride.to}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{ride.date} в {ride.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{ride.seats - ride.bookedSeats} из {ride.seats} мест</span>
                      </div>
                    </div>
                    <span className="font-medium bg-slate-100 px-2 py-1 rounded-lg">{ride.car}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl border-yoldosh-primary text-yoldosh-primary hover:bg-yoldosh-primary/10"
                  >
                    Подробнее
                  </Button>
                  <Button 
                    className="flex-1 bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-xl"
                  >
                    Забронировать
                  </Button>
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
