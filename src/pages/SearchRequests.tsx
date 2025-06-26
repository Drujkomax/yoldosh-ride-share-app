
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, MapPin, Calendar, Users, Star, User, Filter, MessageCircle, Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { DatePicker } from '@/components/ui/datepicker';
import { useRideRequests } from '@/hooks/useRideRequests';

const SearchRequests = () => {
  const navigate = useNavigate();
  const { t } = useTheme();
  const { requests, isLoading, respondToRequest, isResponding } = useRideRequests();
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

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleViewDetails = (requestId: string) => {
    navigate(`/request-details/${requestId}`);
  };

  const handleRespondToRequest = async (requestId: string) => {
    const message = "Здравствуйте! Я готов взять вас в поездку. Давайте обсудим детали.";
    try {
      await respondToRequest({ requestId, message });
    } catch (error) {
      console.error('Ошибка отклика на заявку:', error);
    }
  };

  // Исправленная фильтрация заявок с использованием useMemo
  const filteredRequests = useMemo(() => {
    console.log('SearchRequests - Применение фильтров:', filters);
    console.log('SearchRequests - Общее количество заявок:', requests.length);
    
    return requests.filter(request => {
      // Фильтр по городу отправления
      if (filters.from && request.from_city !== filters.from) {
        return false;
      }
      
      // Фильтр по городу назначения
      if (filters.to && request.to_city !== filters.to) {
        return false;
      }
      
      // Фильтр по дате
      if (filters.date) {
        const requestDate = new Date(request.preferred_date);
        const filterDate = new Date(filters.date);
        // Сравниваем только даты, игнорируя время
        if (requestDate.toDateString() !== filterDate.toDateString()) {
          return false;
        }
      }
      
      // Фильтр по минимальной цене
      if (filters.maxPrice) {
        const minPrice = Number(filters.maxPrice);
        if (isNaN(minPrice) || request.max_price_per_seat < minPrice) {
          return false;
        }
      }
      
      return true;
    }).sort((a, b) => {
      // Сортировка результатов
      switch (filters.sortBy) {
        case 'price':
          return b.max_price_per_seat - a.max_price_per_seat;
        case 'rating':
          return (b.passenger?.rating || 0) - (a.passenger?.rating || 0);
        case 'time':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [requests, filters]);

  const clearFilters = () => {
    setFilters({
      from: '',
      to: '',
      date: undefined,
      maxPrice: '',
      sortBy: 'time'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">Заявки пассажиров</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Search Filters */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
                <Filter className="h-5 w-5 mr-2" />
                {t('filters')}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                Очистить
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">{t('from')}</label>
                <Select value={filters.from} onValueChange={(value) => handleFilterChange('from', value === 'all' ? '' : value)}>
                  <SelectTrigger className="h-12 rounded-xl border-2 bg-white/80 dark:bg-slate-700/80">
                    <SelectValue placeholder={t('select_city')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg">
                    <SelectItem value="all">Все города</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">{t('to')}</label>
                <Select value={filters.to} onValueChange={(value) => handleFilterChange('to', value === 'all' ? '' : value)}>
                  <SelectTrigger className="h-12 rounded-xl border-2 bg-white/80 dark:bg-slate-700/80">
                    <SelectValue placeholder={t('select_city')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg">
                    <SelectItem value="all">Все города</SelectItem>
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
          </CardContent>
        </Card>

        {/* Search Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              Найдено заявок: {filteredRequests.length}
              {filteredRequests.length !== requests.length && (
                <span className="text-sm text-slate-500 ml-2">
                  (из {requests.length} всего)
                </span>
              )}
            </h2>
          </div>
          
          {filteredRequests.length === 0 ? (
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
              <CardContent className="p-8 text-center">
                <p className="text-slate-600 dark:text-slate-400">
                  {requests.length === 0 
                    ? "Заявки не найдены."
                    : "Заявки не найдены. Попробуйте изменить фильтры поиска."
                  }
                </p>
                {filteredRequests.length === 0 && requests.length > 0 && (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="mt-4"
                  >
                    Сбросить фильтры
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-accent rounded-2xl flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-slate-800 dark:text-slate-200">{request.passenger?.name || 'Пассажир'}</span>
                          {request.passenger?.is_verified && (
                            <Badge variant="secondary" className="text-xs bg-yoldosh-success/20 text-yoldosh-success">
                              ✓ {t('verified')}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 text-sm">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-slate-600 dark:text-slate-400">{request.passenger?.rating || 0}</span>
                          <span className="text-gray-500">({request.passenger?.total_rides || 0} поездок)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-xl text-yoldosh-success">
                        до {request.max_price_per_seat.toLocaleString()} {t('sum')}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(request.created_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{request.from_city} → {request.to_city}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(request.preferred_date).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{request.passengers_count} чел.</span>
                        </div>
                      </div>
                    </div>
                    
                    {request.description && (
                      <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-2xl flex items-start space-x-2">
                        <MessageCircle className="h-4 w-4 text-gray-400 mt-0.5" />
                        <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{request.description}"</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-3 mt-4 pt-4 border-t dark:border-slate-600">
                    <Button 
                      variant="outline" 
                      className="flex-1 rounded-xl border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                      onClick={() => handleViewDetails(request.id)}
                    >
                      Подробнее
                    </Button>
                    <Button 
                      onClick={() => handleRespondToRequest(request.id)}
                      disabled={isResponding}
                      className="flex-1 bg-gradient-accent hover:scale-105 transition-all duration-300 rounded-xl"
                    >
                      {isResponding ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Отправка...
                        </>
                      ) : (
                        'Откликнуться'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchRequests;
