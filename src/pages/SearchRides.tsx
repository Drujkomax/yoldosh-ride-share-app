
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, MapPin, Calendar, Users, Star, User, Filter } from 'lucide-react';

const SearchRides = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    date: '',
    maxPrice: '',
    sortBy: 'time'
  });

  const cities = [
    'Ташкент', 'Самарканд', 'Бухара', 'Андижан', 'Наманган', 
    'Фергана', 'Карши', 'Термез', 'Ургенч', 'Нукус'
  ];

  // Mock search results
  const searchResults = [
    {
      id: 1,
      driver: {
        name: 'Алишер',
        rating: 4.9,
        reviews: 24,
        isVerified: true
      },
      from: 'Ташкент',
      to: 'Самарканд',
      date: '25 декабря',
      time: '09:00',
      price: 50000,
      seats: 3,
      car: 'Chevrolet Lacetti',
      comfort: 'Комфорт',
      duration: '4ч 30м'
    },
    {
      id: 2,
      driver: {
        name: 'Жасур',
        rating: 4.7,
        reviews: 18,
        isVerified: true
      },
      from: 'Ташкент',
      to: 'Самарканд',
      date: '25 декабря',
      time: '14:30',
      price: 45000,
      seats: 2,
      car: 'Hyundai Accent',
      comfort: 'Эконом',
      duration: '4ч 45м'
    },
    {
      id: 3,
      driver: {
        name: 'Дильшод',
        rating: 4.8,
        reviews: 31,
        isVerified: true
      },
      from: 'Ташкент',
      to: 'Самарканд',
      date: '26 декабря',
      time: '08:00',
      price: 55000,
      seats: 4,
      car: 'Toyota Camry',
      comfort: 'Бизнес',
      duration: '4ч 15м'
    }
  ];

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const getComfortColor = (comfort: string) => {
    switch (comfort) {
      case 'Эконом': return 'bg-blue-100 text-blue-800';
      case 'Комфорт': return 'bg-green-100 text-green-800';
      case 'Бизнес': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <h1 className="text-xl font-bold">Поиск поездок</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Search Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Фильтры
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Откуда</label>
                <Select value={filters.from} onValueChange={(value) => handleFilterChange('from', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите город" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Куда</label>
                <Select value={filters.to} onValueChange={(value) => handleFilterChange('to', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите город" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Дата</label>
                <Input
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Макс. цена (сум)</label>
                <Input
                  type="number"
                  placeholder="100000"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Сортировка</label>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time">По времени</SelectItem>
                    <SelectItem value="price">По цене</SelectItem>
                    <SelectItem value="rating">По рейтингу</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button className="w-full bg-yoldosh-blue hover:bg-blue-700">
              <Search className="h-4 w-4 mr-2" />
              Применить фильтры
            </Button>
          </CardContent>
        </Card>

        {/* Search Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Найдено {searchResults.length} поездок</h2>
          </div>
          
          {searchResults.map((ride) => (
            <Card key={ride.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{ride.driver.name}</span>
                        {ride.driver.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            ✓ Проверен
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span>{ride.driver.rating}</span>
                        <span className="text-gray-500">({ride.driver.reviews})</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-xl text-yoldosh-green">
                      {ride.price.toLocaleString()} сум
                    </div>
                    <Badge className={getComfortColor(ride.comfort)}>
                      {ride.comfort}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{ride.from} → {ride.to}</span>
                    <span className="text-sm text-gray-500">({ride.duration})</span>
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
                
                <div className="flex space-x-3 mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                  >
                    Подробнее
                  </Button>
                  <Button 
                    className="flex-1 bg-yoldosh-green hover:bg-green-700"
                  >
                    Забронировать
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchRides;
