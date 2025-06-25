
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Clock, Star, User } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';

const MyTripsPage = () => {
  const navigate = useNavigate();

  // Mock trips data
  const trips = [
    {
      id: 1,
      from: 'Ташкент',
      to: 'Самарканд',
      date: '20 декабря 2024',
      time: '09:00',
      status: 'completed',
      driver: 'Бахтиёр',
      rating: 4.8,
      price: 50000,
      passengers: 2
    },
    {
      id: 2,
      from: 'Самарканд',
      to: 'Ташкент',
      date: '22 декабря 2024',
      time: '15:30',
      status: 'upcoming',
      driver: 'Азиз',
      rating: 4.6,
      price: 45000,
      passengers: 1
    },
    {
      id: 3,
      from: 'Ташкент',
      to: 'Бухара',
      date: '15 декабря 2024',
      time: '10:00',
      status: 'cancelled',
      driver: 'Шерзод',
      rating: 4.5,
      price: 60000,
      passengers: 3
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Завершена</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800">Предстоящая</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Отменена</Badge>;
      default:
        return <Badge variant="outline">Неизвестно</Badge>;
    }
  };

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
          {trips.map((trip) => (
            <Card key={trip.id} className="bg-white/80 backdrop-blur-lg border-0 rounded-2xl shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-slate-900">{trip.driver}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-slate-600">{trip.rating}</span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">Водитель</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {getStatusBadge(trip.status)}
                    <div className="font-bold text-lg text-slate-900 mt-1">
                      {trip.price.toLocaleString()} сум
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-slate-900">{trip.from} → {trip.to}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{trip.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{trip.time}</span>
                      </div>
                    </div>
                    <div className="text-slate-600">
                      {trip.passengers} пассажир{trip.passengers > 1 ? 'а' : ''}
                    </div>
                  </div>
                </div>

                {trip.status === 'completed' && (
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
                
                {trip.status === 'upcoming' && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/chat/${trip.driver}`)}
                    >
                      Связаться с водителем
                    </Button>
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
          ))}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default MyTripsPage;
