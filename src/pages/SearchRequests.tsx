
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, MapPin, Calendar, Users, Star, User, Filter, MessageCircle } from 'lucide-react';

const SearchRequests = () => {
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

  // Mock passenger requests
  const passengerRequests = [
    {
      id: 1,
      passenger: {
        name: 'Азиз',
        rating: 4.6,
        reviews: 12,
        isVerified: true
      },
      from: 'Ташкент',
      to: 'Самарканд',
      date: '25 декабря',
      preferredTime: 'Утром',
      passengers: 2,
      maxPrice: 45000,
      comment: 'Предпочитаю ехать утром, готов подождать',
      createdAt: '2 часа назад'
    },
    {
      id: 2,
      passenger: {
        name: 'Нодира',
        rating: 4.9,
        reviews: 28,
        isVerified: true
      },
      from: 'Ташкент',
      to: 'Бухара',
      date: '26 декабря',
      preferredTime: 'Вечером',
      passengers: 1,
      maxPrice: 60000,
      comment: 'Могу подождать до вечера, багажа мало',
      createdAt: '4 часа назад'
    },
    {
      id: 3,
      passenger: {
        name: 'Жамшид',
        rating: 4.3,
        reviews: 8,
        isVerified: false
      },
      from: 'Ташкент',
      to: 'Самарканд',
      date: '27 декабря',
      preferredTime: 'Любое время',
      passengers: 3,
      maxPrice: 40000,
      comment: 'Семьей едем, есть дети',
      createdAt: '1 день назад'
    }
  ];

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleRespondToRequest = (requestId: number) => {
    alert(`Отклик на заявку ${requestId} отправлен!`);
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
            <h1 className="text-xl font-bold">Заявки пассажиров</h1>
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
                <label className="block text-sm font-medium mb-2">Мин. цена (сум)</label>
                <Input
                  type="number"
                  placeholder="30000"
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
            <h2 className="text-lg font-semibold">Найдено {passengerRequests.length} заявок</h2>
          </div>
          
          {passengerRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{request.passenger.name}</span>
                        {request.passenger.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            ✓ Проверен
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span>{request.passenger.rating}</span>
                        <span className="text-gray-500">({request.passenger.reviews})</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-xl text-yoldosh-green">
                      до {request.maxPrice.toLocaleString()} сум
                    </div>
                    <div className="text-sm text-gray-500">{request.createdAt}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{request.from} → {request.to}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{request.date} ({request.preferredTime})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{request.passengers} пассажир(ов)</span>
                      </div>
                    </div>
                  </div>
                  
                  {request.comment && (
                    <div className="bg-gray-50 p-3 rounded-lg flex items-start space-x-2">
                      <MessageCircle className="h-4 w-4 text-gray-400 mt-0.5" />
                      <p className="text-sm text-gray-700 italic">"{request.comment}"</p>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-3 mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                  >
                    Подробнее
                  </Button>
                  <Button 
                    onClick={() => handleRespondToRequest(request.id)}
                    className="flex-1 bg-yoldosh-green hover:bg-green-700"
                  >
                    Откликнуться
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

export default SearchRequests;
