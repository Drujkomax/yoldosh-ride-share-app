import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Car, Users, MapPin, Clock, Star, TrendingUp } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useRides } from '@/hooks/useRides';
import { useProfile } from '@/hooks/useProfile';
import DriverBottomNavigation from '@/components/DriverBottomNavigation';

const DriverHomePage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { rides } = useRides();
  const { profile } = useProfile();

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
      });
    } catch {
      return dateStr;
    }
  };

  const myActiveRides = rides.filter(ride => ride.driver_id === user?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Добро пожаловать, {profile?.name || user?.name || 'Водитель'}!
              </h1>
              <p className="text-slate-600 mt-1">Управляйте своими поездками</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                <Star className="h-4 w-4 mr-1" />
                {profile?.rating?.toFixed(1) || '0.0'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/create-ride')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-2">Создать поездку</h3>
              <p className="text-slate-600">Опубликуйте новую поездку</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/search-requests')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-2">Найти пассажиров</h3>
              <p className="text-slate-600">Просмотрите заявки пассажиров</p>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-800 flex items-center">
              <TrendingUp className="h-6 w-6 mr-3 text-yoldosh-primary" />
              Ваша статистика
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                <div className="text-3xl font-bold text-yoldosh-primary mb-2">{myActiveRides.length}</div>
                <div className="text-sm text-slate-600 font-medium">Активных поездок</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
                <div className="text-3xl font-bold text-yoldosh-accent mb-2">{profile?.total_rides || 0}</div>
                <div className="text-sm text-slate-600 font-medium">Всего поездок</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                <div className="text-3xl font-bold text-yoldosh-secondary mb-2">{profile?.rating?.toFixed(1) || '0.0'}</div>
                <div className="text-sm text-slate-600 font-medium">Рейтинг</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Rides */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-800 flex items-center">
              <Car className="h-6 w-6 mr-3 text-yoldosh-primary" />
              Ваши активные поездки ({myActiveRides.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myActiveRides.length === 0 ? (
              <div className="text-center py-6">
                <Car className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-lg text-gray-500">У вас пока нет активных поездок</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myActiveRides.map((ride) => (
                  <Card key={ride.id} className="bg-white/90 border rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <MapPin className="h-5 w-5 text-blue-500" />
                        <div>
                          <h3 className="text-lg font-semibold">{ride.from_city} → {ride.to_city}</h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(ride.departure_date)} в {ride.departure_time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        <Users className="h-5 w-5 text-purple-500" />
                        <p className="text-sm text-gray-600">
                          {ride.available_seats} мест
                        </p>
                        <Clock className="h-5 w-5 text-green-500" />
                        <p className="text-sm text-gray-600">
                          {ride.duration_hours} ч
                        </p>
                      </div>
                    </CardContent>
                  </Card>
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

export default DriverHomePage;
