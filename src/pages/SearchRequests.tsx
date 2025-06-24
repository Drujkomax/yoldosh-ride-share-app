
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, MapPin, Calendar, Users, Star, User, Filter, MessageCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { DatePicker } from '@/components/ui/datepicker';

const SearchRequests = () => {
  const navigate = useNavigate();
  const { t } = useTheme();
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    date: undefined as Date | undefined,
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

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleViewDetails = (requestId: number) => {
    navigate(`/request-details/${requestId}`);
  };

  const handleRespondToRequest = (requestId: number) => {
    navigate(`/request-details/${requestId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-lg border-b border-white/20 dark:border-slate-700/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="hover:bg-yoldosh-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back')}
            </Button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">{t('search_passenger_requests')}</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Search Filters */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
              <Filter className="h-5 w-5 mr-2" />
              {t('filters')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">{t('from')}</label>
                <Select value={filters.from} onValueChange={(value) => handleFilterChange('from', value)}>
                  <SelectTrigger className="h-12 rounded-xl border-2 bg-white/80 dark:bg-slate-700/80">
                    <SelectValue placeholder={t('select_city')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg">
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">{t('to')}</label>
                <Select value={filters.to} onValueChange={(value) => handleFilterChange('to', value)}>
                  <SelectTrigger className="h-12 rounded-xl border-2 bg-white/80 dark:bg-slate-700/80">
                    <SelectValue placeholder={t('select_city')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg">
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">{t('date')}</label>
                <DatePicker
                  value={filters.date}
                  onChange={(date) => handleFilterChange('date', date)}
                  placeholder={t('select_date')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">{t('min_price')} ({t('sum')})</label>
                <Input
                  type="number"
                  placeholder="30000"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="h-12 rounded-xl border-2 bg-white/80 dark:bg-slate-700/80"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">{t('sort_by')}</label>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger className="h-12 rounded-xl border-2 bg-white/80 dark:bg-slate-700/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg">
                    <SelectItem value="time">{t('by_time')}</SelectItem>
                    <SelectItem value="price">{t('by_price')}</SelectItem>
                    <SelectItem value="rating">{t('by_rating')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button className="w-full bg-yoldosh-blue hover:bg-blue-700 h-12 rounded-xl">
              <Search className="h-4 w-4 mr-2" />
              {t('apply_filters')}
            </Button>
          </CardContent>
        </Card>

        {/* Search Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t('found_requests')}: {passengerRequests.length}</h2>
          </div>
          
          {passengerRequests.map((request) => (
            <Card key={request.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-accent rounded-2xl flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{request.passenger.name}</span>
                        {request.passenger.isVerified && (
                          <Badge variant="secondary" className="text-xs bg-yoldosh-success/20 text-yoldosh-success">
                            ✓ {t('verified')}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-slate-600 dark:text-slate-400">{request.passenger.rating}</span>
                        <span className="text-gray-500">({request.passenger.reviews} {t('reviews')})</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-xl text-yoldosh-success">
                      до {request.maxPrice.toLocaleString()} {t('sum')}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{request.createdAt}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{request.from} → {request.to}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{request.date} ({request.preferredTime})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{request.passengers} {t('passengers')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {request.comment && (
                    <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-2xl flex items-start space-x-2">
                      <MessageCircle className="h-4 w-4 text-gray-400 mt-0.5" />
                      <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{request.comment}"</p>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-3 mt-4 pt-4 border-t dark:border-slate-600">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                    onClick={() => handleViewDetails(request.id)}
                  >
                    {t('details')}
                  </Button>
                  <Button 
                    onClick={() => handleRespondToRequest(request.id)}
                    className="flex-1 bg-gradient-accent hover:scale-105 transition-all duration-300 rounded-xl"
                  >
                    {t('respond')}
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
