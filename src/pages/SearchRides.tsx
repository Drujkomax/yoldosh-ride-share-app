
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, MapPin, Calendar, Users, Star, User, Clock, Search, Edit2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useRides } from '@/hooks/useRides';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const SearchRides = () => {
  const navigate = useNavigate();
  const { t } = useTheme();
  const { searchRides } = useRides();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchCriteria, setSearchCriteria] = useState({
    from: '',
    to: '',
    date: '',
    seats: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const criteria = {
      from: searchParams.get('from') || '',
      to: searchParams.get('to') || '',
      date: searchParams.get('date') || '',
      seats: searchParams.get('seats') || ''
    };
    setSearchCriteria(criteria);
    
    // Auto search if we have from, to, and date
    if (criteria.from && criteria.to && criteria.date) {
      performSearch(criteria);
    }
  }, [searchParams]);

  const performSearch = async (criteria = searchCriteria) => {
    if (!criteria.from || !criteria.to) return;
    
    setIsLoading(true);
    setHasSearched(true);
    try {
      const searchData = {
        from_city: criteria.from,
        to_city: criteria.to,
        departure_date: criteria.date || undefined
      };
      
      const results = await searchRides(searchData);
      console.log('Search results:', results);
      
      // Filter by available seats if specified
      let filteredResults = results;
      if (criteria.seats) {
        const requiredSeats = parseInt(criteria.seats);
        filteredResults = results.filter(ride => ride.available_seats >= requiredSeats);
      }
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSearch = () => {
    const params = new URLSearchParams();
    if (searchCriteria.from) params.set('from', searchCriteria.from);
    if (searchCriteria.to) params.set('to', searchCriteria.to);
    if (searchCriteria.date) params.set('date', searchCriteria.date);
    if (searchCriteria.seats) params.set('seats', searchCriteria.seats);
    
    setSearchParams(params);
    setIsEditing(false);
    performSearch();
  };

  const handleBookRide = (rideId: string) => {
    navigate(`/book-ride/${rideId}`);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMMM', { locale: ru });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      return timeStr.slice(0, 5); // Get HH:MM format
    } catch {
      return timeStr;
    }
  };

  const getTabCounts = () => {
    const all = searchResults.length;
    const carpool = searchResults.filter(ride => ride.available_seats <= 4).length;
    const bus = searchResults.filter(ride => ride.available_seats > 4).length;
    return { all, carpool, bus };
  };

  const getFilteredResults = () => {
    if (activeTab === 'carpool') {
      return searchResults.filter(ride => ride.available_seats <= 4);
    }
    if (activeTab === 'bus') {
      return searchResults.filter(ride => ride.available_seats > 4);
    }
    return searchResults;
  };

  const { all, carpool, bus } = getTabCounts();
  const filteredResults = getFilteredResults();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search Summary */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-gray-900 text-lg">
              {searchCriteria.from} → {searchCriteria.to}
            </h1>
            <p className="text-sm text-gray-500">
              {searchCriteria.date && new Date(searchCriteria.date).toLocaleDateString('ru-RU', { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short' 
              })}, {searchCriteria.seats || '1'} пассажир{searchCriteria.seats === '1' ? '' : 'а'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-600 hover:bg-blue-50"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Изменить
          </Button>
        </div>
        
        {isEditing && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Откуда"
                value={searchCriteria.from}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, from: e.target.value }))}
                className="text-sm"
              />
              <Input
                placeholder="Куда"
                value={searchCriteria.to}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, to: e.target.value }))}
                className="text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                value={searchCriteria.date}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, date: e.target.value }))}
                className="text-sm"
              />
              <Input
                type="number"
                min="1"
                placeholder="Пассажиров"
                value={searchCriteria.seats}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, seats: e.target.value }))}
                className="text-sm"
              />
            </div>
            <Button 
              onClick={handleUpdateSearch}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Обновить поиск
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-4 px-4 text-center font-medium ${
              activeTab === 'all' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div>Все</div>
            <div className="text-sm font-normal">{all}</div>
          </button>
          <button
            onClick={() => setActiveTab('carpool')}
            className={`flex-1 py-4 px-4 text-center font-medium ${
              activeTab === 'carpool' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div>Попутчики</div>
            <div className="text-sm font-normal">{carpool}</div>
          </button>
          <button
            onClick={() => setActiveTab('bus')}
            className={`flex-1 py-4 px-4 text-center font-medium ${
              activeTab === 'bus' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div>Автобус</div>
            <div className="text-sm font-normal">{bus}</div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Поиск поездок...</div>
          </div>
        ) : hasSearched && filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">
              {activeTab === 'bus' ? 'Нет автобусных поездок на этот день' : 'Поездки не найдены'}
            </div>
            <div className="text-gray-500 text-sm">
              Попробуйте изменить параметры поиска
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Date Section */}
            {filteredResults.length > 0 && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  {searchCriteria.date && formatDate(searchCriteria.date)}
                </h2>
              </div>
            )}

            {filteredResults.map((ride) => (
              <Card key={ride.id} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {/* Time and Route */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-900">
                            {formatTime(ride.departure_time)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.floor(ride.duration_hours || 2)}ч{((ride.duration_hours || 2) % 1 * 60).toFixed(0).padStart(2, '0')}
                          </div>
                        </div>
                        
                        <div className="flex-1 relative">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="flex-1 h-px bg-gray-300 mx-2"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-600">{ride.from_city}</span>
                            <span className="text-gray-600">{ride.to_city}</span>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-900">
                            {formatTime(ride.estimated_arrival_time?.split('T')[1] || '00:00')}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-xl font-bold text-gray-900">
                        £{ride.price_per_seat}
                        <span className="text-sm font-normal text-gray-500">.{String(ride.price_per_seat % 1).split('.')[1]?.padEnd(2, '0') || '00'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Driver Info */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">
                            {ride.driver?.name || 'Водитель'}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">
                              {ride.driver?.rating || '5'}
                            </span>
                          </div>
                        </div>
                        {ride.car_model && (
                          <div className="text-xs text-gray-500">
                            {ride.car_model} {ride.car_color && `• ${ride.car_color}`}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{ride.available_seats}</span>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <div className="mt-4">
                    <Button 
                      onClick={() => navigate(`/ride-details/${ride.id}`)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Подробнее
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Alert Button */}
      {hasSearched && filteredResults.length === 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
          <Button 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg"
            onClick={() => navigate('/create-request')}
          >
            Создать уведомление о поездке
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchRides;
