import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, MapPin, Calendar, Users, Star, User, Clock, Search, Edit2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const SearchRides = () => {
  const navigate = useNavigate();
  const { t } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchCriteria, setSearchCriteria] = useState({
    from: '',
    to: '',
    date: '',
    seats: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setSearchCriteria({
      from: searchParams.get('from') || '',
      to: searchParams.get('to') || '',
      date: searchParams.get('date') || '',
      seats: searchParams.get('seats') || ''
    });
  }, [searchParams]);

  // Mock driver rides data
  const driverRides = [
    {
      id: 1,
      driver: {
        name: 'Бахтиёр',
        rating: 4.8,
        reviews: 45,
        isVerified: true
      },
      from: 'Ташкент',
      to: 'Самарканд',
      date: '25 декабря',
      time: '09:00',
      availableSeats: 3,
      totalSeats: 4,
      price: 50000,
      car: 'Chevrolet Lacetti',
      features: ['Кондиционер', 'Музыка', 'Некурящий']
    },
    {
      id: 2,
      driver: {
        name: 'Азиз',
        rating: 4.6,
        reviews: 28,
        isVerified: true
      },
      from: 'Ташкент',
      to: 'Самарканд',
      date: '25 декабря',
      time: '14:30',
      availableSeats: 2,
      totalSeats: 4,
      price: 45000,
      car: 'Daewoo Nexia',
      features: ['Кондиционер', 'Некурящий']
    },
    {
      id: 3,
      driver: {
        name: 'Фарход',
        rating: 4.9,
        reviews: 67,
        isVerified: false
      },
      from: 'Ташкент',
      to: 'Бухара',
      date: '26 декабря',
      time: '08:00',
      availableSeats: 1,
      totalSeats: 4,
      price: 65000,
      car: 'Toyota Camry',
      features: ['Кондиционер', 'Wi-Fi', 'Премиум', 'Некурящий']
    }
  ];

  const handleBookRide = (rideId: number) => {
    navigate(`/book-ride/${rideId}`);
  };

  const handleUpdateSearch = () => {
    const params = new URLSearchParams();
    if (searchCriteria.from) params.set('from', searchCriteria.from);
    if (searchCriteria.to) params.set('to', searchCriteria.to);
    if (searchCriteria.date) params.set('date', searchCriteria.date);
    if (searchCriteria.seats) params.set('seats', searchCriteria.seats);
    
    setSearchParams(params);
    setIsEditing(false);
  };

  // Filter rides based on search criteria
  const filteredRides = driverRides.filter(ride => {
    const matchesFrom = !searchCriteria.from || ride.from.toLowerCase().includes(searchCriteria.from.toLowerCase());
    const matchesTo = !searchCriteria.to || ride.to.toLowerCase().includes(searchCriteria.to.toLowerCase());
    const matchesSeats = !searchCriteria.seats || ride.availableSeats >= parseInt(searchCriteria.seats);
    return matchesFrom && matchesTo && matchesSeats;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-lg border-b border-white/20 dark:border-slate-700/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="hover:bg-yoldosh-primary/10 hover:scale-105 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back')}
            </Button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">{t('search_rides')}</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Search Criteria Display */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Параметры поиска</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="hover:scale-105 transition-all duration-300"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                {isEditing ? 'Отмена' : 'Изменить'}
              </Button>
            </div>
            
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Откуда</label>
                    <Input
                      placeholder="Город отправления"
                      value={searchCriteria.from}
                      onChange={(e) => setSearchCriteria(prev => ({ ...prev, from: e.target.value }))}
                      className="h-10 rounded-xl border-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Куда</label>
                    <Input
                      placeholder="Город прибытия"
                      value={searchCriteria.to}
                      onChange={(e) => setSearchCriteria(prev => ({ ...prev, to: e.target.value }))}
                      className="h-10 rounded-xl border-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Дата</label>
                    <Input
                      type="date"
                      value={searchCriteria.date}
                      onChange={(e) => setSearchCriteria(prev => ({ ...prev, date: e.target.value }))}
                      className="h-10 rounded-xl border-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Пассажиров</label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Количество"
                      value={searchCriteria.seats}
                      onChange={(e) => setSearchCriteria(prev => ({ ...prev, seats: e.target.value }))}
                      className="h-10 rounded-xl border-2"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleUpdateSearch}
                  className="w-full bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-xl"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Обновить поиск
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {searchCriteria.from && (
                  <Badge className="bg-yoldosh-primary/10 text-yoldosh-primary border-0 hover:scale-105 transition-all duration-300">
                    Откуда: {searchCriteria.from}
                  </Badge>
                )}
                {searchCriteria.to && (
                  <Badge className="bg-yoldosh-primary/10 text-yoldosh-primary border-0 hover:scale-105 transition-all duration-300">
                    Куда: {searchCriteria.to}
                  </Badge>
                )}
                {searchCriteria.date && (
                  <Badge className="bg-yoldosh-primary/10 text-yoldosh-primary border-0 hover:scale-105 transition-all duration-300">
                    Дата: {new Date(searchCriteria.date).toLocaleDateString('ru-RU')}
                  </Badge>
                )}
                {searchCriteria.seats && (
                  <Badge className="bg-yoldosh-primary/10 text-yoldosh-primary border-0 hover:scale-105 transition-all duration-300">
                    Мест: {searchCriteria.seats}
                  </Badge>
                )}
                {!searchCriteria.from && !searchCriteria.to && !searchCriteria.date && !searchCriteria.seats && (
                  <span className="text-slate-500">Все поездки</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              {t('found_rides')}: {filteredRides.length}
            </h2>
          </div>
          
          {filteredRides.map((ride) => (
            <Card key={ride.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{ride.driver.name}</span>
                        {ride.driver.isVerified && (
                          <Badge variant="secondary" className="text-xs bg-yoldosh-success/20 text-yoldosh-success">
                            ✓ {t('verified')}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-slate-600 dark:text-slate-400">{ride.driver.rating}</span>
                        <span className="text-gray-500">({ride.driver.reviews} {t('reviews')})</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{ride.car}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-2xl text-yoldosh-success">
                      {ride.price.toLocaleString()} {t('sum')}
                    </div>
                    <div className="text-sm text-slate-500">{ride.availableSeats} из {ride.totalSeats} мест</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{ride.from} → {ride.to}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{ride.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{ride.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{ride.availableSeats} мест</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {ride.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-slate-100 dark:bg-slate-700">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-4 pt-4 border-t dark:border-slate-600">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-105 transition-all duration-300"
                    onClick={() => navigate(`/ride-details/${ride.id}`)}
                  >
                    {t('details')}
                  </Button>
                  <Button 
                    onClick={() => handleBookRide(ride.id)}
                    className="flex-1 bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-xl"
                  >
                    {t('book')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredRides.length === 0 && (
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
              <CardContent className="p-12 text-center">
                <div className="text-slate-400 text-lg mb-2">Поездки не найдены</div>
                <div className="text-slate-500 text-sm">Попробуйте изменить параметры поиска</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchRides;
