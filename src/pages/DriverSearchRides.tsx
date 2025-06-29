
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Search, MapPin, Calendar, Users, DollarSign, Plus } from 'lucide-react';
import { useRides } from '@/hooks/useRides';
import DriverBottomNavigation from '@/components/DriverBottomNavigation';

const DriverSearchRides = () => {
  const navigate = useNavigate();
  const { rides, isLoading } = useRides();

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      return timeStr.slice(0, 5); // Показываем только HH:MM
    } catch {
      return timeStr;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-slate-600">Загрузка поездок...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/driver-home')}
              className="rounded-xl hover:bg-blue-50 p-3"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад
            </Button>
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Опубликованные поездки
              </h1>
              <p className="text-slate-600 mt-1">Все активные поездки водителей</p>
            </div>
            <Button
              onClick={() => navigate('/create-driver-ride')}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 p-3"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Rides List */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
              <Search className="h-6 w-6 mr-2" />
              Активные поездки ({rides.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rides.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Поездки не найдены</p>
                <p className="text-sm">Пока нет активных поездок от водителей</p>
                <Button
                  onClick={() => navigate('/create-driver-ride')}
                  className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Опубликовать поездку
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {rides.map(ride => (
                  <div key={ride.id} className="p-6 hover:bg-gray-50 cursor-pointer transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-lg text-slate-800 truncate">
                              {ride.driver?.name || 'Водитель'}
                            </span>
                            <span className="text-sm text-slate-500">
                              {formatDate(ride.departure_date)} в {formatTime(ride.departure_time)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-slate-600 mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{ride.from_city} → {ride.to_city}</span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-slate-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{ride.available_seats} мест</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{ride.price_per_seat} UZS</span>
                          </div>
                        </div>
                        {ride.description && (
                          <p className="text-slate-700 text-sm truncate">{ride.description}</p>
                        )}
                        {ride.car_model && (
                          <p className="text-slate-600 text-sm">
                            {ride.car_model} {ride.car_color && `• ${ride.car_color}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DriverBottomNavigation />
    </div>
  );
};

export default DriverSearchRides;
