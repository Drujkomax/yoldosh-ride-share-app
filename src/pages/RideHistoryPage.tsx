
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Star, Users } from 'lucide-react';

const RideHistoryPage = () => {
  const navigate = useNavigate();

  const rideHistory = [
    {
      id: 1,
      from: 'Ташкент',
      to: 'Самарканд',
      date: '20 декабря 2024',
      time: '09:00',
      price: '120,000 сум',
      status: 'completed',
      rating: 5,
      driver: 'Шерзод Исламов',
      passengers: 3
    },
    {
      id: 2,
      from: 'Самарканд',
      to: 'Бухара',
      date: '18 декабря 2024',
      time: '14:30',
      price: '85,000 сум',
      status: 'completed',
      rating: 4,
      driver: 'Азиз Каримов',
      passengers: 2
    },
    {
      id: 3,
      from: 'Ташкент',
      to: 'Андижан',
      date: '15 декабря 2024',
      time: '07:00',
      price: '150,000 сум',
      status: 'cancelled',
      rating: null,
      driver: 'Жахонгир Усманов',
      passengers: 4
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Завершена</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Отменена</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Неизвестно</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="rounded-xl hover:bg-yoldosh-primary/10 p-3"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              История поездок
            </h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {rideHistory.map((ride) => (
            <Card key={ride.id} className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <MapPin className="h-5 w-5 text-yoldosh-primary" />
                      <span className="font-semibold text-lg">
                        {ride.from} → {ride.to}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-slate-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{ride.date}</span>
                      </div>
                      <span>{ride.time}</span>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{ride.passengers} пассажира</span>
                      </div>
                    </div>
                    <p className="text-slate-600">Водитель: {ride.driver}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(ride.status)}
                    <div className="text-xl font-bold text-yoldosh-primary mt-2">
                      {ride.price}
                    </div>
                  </div>
                </div>
                
                {ride.rating && (
                  <div className="flex items-center space-x-2 pt-4 border-t border-slate-200">
                    <span className="text-sm text-slate-600">Ваша оценка:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < ride.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RideHistoryPage;
