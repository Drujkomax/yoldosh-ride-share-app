
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Users, ArrowRight, Clock } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useRides } from '@/hooks/useRides';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { supabase } from '@/integrations/supabase/client';
import { standardizeCityName } from '@/lib/cityNormalizer';
import AddressAutocomplete from '@/components/AddressAutocomplete';


import BottomNavigation from '@/components/BottomNavigation';
import { format, startOfToday } from 'date-fns';
import { ru } from 'date-fns/locale';

const PassengerSearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  const { searchRides } = useRides();
  const { searchHistory, addToHistory } = useSearchHistory();
  
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [date, setDate] = useState<Date>();
  const [passengers, setPassengers] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  
  // Modal states
  const [showFromSelector, setShowFromSelector] = useState(false);
  const [showToSelector, setShowToSelector] = useState(false);
  
  const [showNotificationPermission, setShowNotificationPermission] = useState(false);

  // Restore state from URL parameters when returning from other pages
  useEffect(() => {
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const dateParam = searchParams.get('date');
    const seatsParam = searchParams.get('seats');
    const passengersParam = searchParams.get('passengers');
    
    if (fromParam) setFromCity(fromParam);
    if (toParam) setToCity(toParam);
    
    // Восстанавливаем дату из URL
    if (dateParam) {
      const parsedDate = new Date(dateParam);
      if (!isNaN(parsedDate.getTime())) {
        setDate(parsedDate);
      }
    }
    
    // Проверяем оба возможных параметра для количества пассажиров
    const seatsCount = seatsParam ? parseInt(seatsParam) : null;
    const passengersCount = passengersParam ? parseInt(passengersParam) : null;
    const finalCount = seatsCount || passengersCount;
    
    if (finalCount && !isNaN(finalCount) && finalCount >= 1 && finalCount <= 8) {
      setPassengers(finalCount);
    }
  }, []);

  // Handle passenger count selection
  useEffect(() => {
    const passengerCountParam = searchParams.get('passengerCount');
    if (passengerCountParam) {
      const count = parseInt(passengerCountParam);
      if (!isNaN(count) && count >= 1 && count <= 8) {
        setPassengers(count);
      }
    }
  }, [searchParams]);

  // Handle date selection from calendar
  useEffect(() => {
    const selectedDateParam = searchParams.get('selectedDate');
    if (selectedDateParam) {
      try {
        const parsedDate = new Date(selectedDateParam);
        if (!isNaN(parsedDate.getTime())) {
          setDate(parsedDate);
          
          // Clear the selectedDate param from URL without affecting other data
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('selectedDate');
          
          // Only navigate if we actually have the selectedDate param to avoid loops
          if (newParams.toString() !== searchParams.toString()) {
            const newUrl = newParams.toString() ? `/passenger-search?${newParams.toString()}` : '/passenger-search';
            navigate(newUrl, { replace: true });
          }
        }
      } catch (error) {
        console.log('Could not parse date from URL:', error);
      }
    }
  }, [searchParams, navigate]);

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      setShowNotificationPermission(true);
    }
  }, []);

  const handleNotificationPermission = (allow: boolean) => {
    if (allow && 'Notification' in window) {
      Notification.requestPermission();
    }
    setShowNotificationPermission(false);
  };

  const handleSearch = async () => {
    if (fromCity && toCity) {
      setIsSearching(true);
      try {
        // Если дата не выбрана, используем сегодняшнюю дату
        const searchDate = date || startOfToday();
        
        // Нормализуем названия городов для поиска и сохранения
        const normalizedFromCity = standardizeCityName(fromCity);
        const normalizedToCity = standardizeCityName(toCity);
        
        const searchData = {
          from_city: normalizedFromCity,
          to_city: normalizedToCity,
          departure_date: format(searchDate, 'yyyy-MM-dd'),
          passengers_count: passengers
        };
        
        // Add to search history
        await addToHistory(searchData);
        
        // Navigate to search results with parameters
        const params = new URLSearchParams({
          from: normalizedFromCity,
          to: normalizedToCity,
          date: format(searchDate, 'yyyy-MM-dd'),
          seats: passengers.toString()
        });
        navigate(`/search-rides?${params.toString()}`);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleSearchHistoryClick = (historyItem: any) => {
    setFromCity(historyItem.from_city);
    setToCity(historyItem.to_city);
    setPassengers(historyItem.passengers_count || 1);
    
    if (historyItem.departure_date) {
      try {
        const parsedDate = new Date(historyItem.departure_date);
        if (!isNaN(parsedDate.getTime())) {
          setDate(parsedDate);
        }
      } catch (error) {
        console.log('Could not parse date from history:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-300 to-emerald-200 pb-24">
      {/* Notification Permission Modal */}
      {showNotificationPermission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              "Yoldosh" хочет отправлять вам уведомления
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Уведомления могут включать оповещения, звуки и значки. Это можно настроить в Настройках.
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={() => handleNotificationPermission(false)}
                variant="outline"
                className="flex-1"
              >
                Не разрешать
              </Button>
              <Button
                onClick={() => handleNotificationPermission(true)}
                className="flex-1 bg-blue-500 hover:bg-blue-600"
              >
                Разрешить
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Illustration */}
      <div className="px-4 pt-12 pb-4">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-white mb-1">
            Поездки на ваш выбор
          </h1>
        </div>
        
        {/* Transportation Illustration - Compact */}
        <div className="flex justify-center items-center mb-4">
          <div className="relative scale-75">
            {/* Car */}
            <div className="w-16 h-10 bg-teal-600 rounded-lg mr-3 relative">
              <div className="absolute bottom-0 left-1 w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="absolute bottom-0 right-1 w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="absolute top-1 left-1 right-1 flex justify-between">
                <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full"></div>
              </div>
            </div>
            
            {/* Bus */}
            <div className="w-24 h-12 bg-red-500 rounded-lg relative inline-block">
              <div className="absolute top-1 left-1 right-1 flex justify-between">
                <div className="w-3 h-3 bg-yellow-300 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-300 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-300 rounded-full"></div>
              </div>
              <div className="absolute bottom-0 left-2 w-3 h-3 bg-gray-300 rounded-full"></div>
              <div className="absolute bottom-0 right-2 w-3 h-3 bg-gray-300 rounded-full"></div>
              {/* Passengers silhouettes */}
              <div className="absolute top-4 left-1 right-1 flex justify-around">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-2 h-3 bg-gray-800 rounded-t-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="px-4 mb-4">
        <Card className="bg-white shadow-xl rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="space-y-0">
              {/* From Location */}
              <div className="p-3 border-b border-gray-100">
                <Button
                  onClick={() => setShowFromSelector(true)}
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto text-left hover:bg-transparent"
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="w-2.5 h-2.5 bg-gray-400 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-500 text-xs">Откуда</div>
                      <div className="text-gray-900 font-medium truncate text-sm">
                        {fromCity || 'Выберите место отправления'}
                      </div>
                    </div>
                  </div>
                </Button>
              </div>
              
              {/* To Location */}
              <div className="p-3 border-b border-gray-100">
                <Button
                  onClick={() => setShowToSelector(true)}
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto text-left hover:bg-transparent"
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="w-2.5 h-2.5 bg-gray-400 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-500 text-xs">Куда</div>
                      <div className="text-gray-900 font-medium truncate text-sm">
                        {toCity || 'Выберите место назначения'}
                      </div>
                    </div>
                  </div>
                </Button>
              </div>

              {/* Date */}
              <div className="p-3 border-b border-gray-100">
                <Button
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (fromCity) params.set('from', fromCity);
                    if (toCity) params.set('to', toCity);
                    if (passengers) params.set('passengers', passengers.toString());
                    params.set('returnTo', '/passenger-search');
                    navigate(`/full-screen-calendar?${params.toString()}`);
                  }}
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto text-left hover:bg-transparent"
                >
                  <div className="flex items-center space-x-3 w-full">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 font-medium text-sm">
                        {date ? format(date, 'EEE dd MMM', { locale: ru }) : 'Сегодня'}
                      </div>
                    </div>
                  </div>
                </Button>
              </div>

              <div className="p-3">
                <Button
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (fromCity) params.set('from', fromCity);
                    if (toCity) params.set('to', toCity);
                    params.set('returnTo', '/passenger-search');
                    params.set('currentCount', passengers.toString());
                    navigate(`/passenger-count?${params.toString()}`);
                  }}
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto text-left hover:bg-transparent"
                >
                  <div className="flex items-center space-x-3 w-full">
                    <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 font-medium text-sm">
                        {passengers}
                      </div>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Button */}
      <div className="px-4 mb-4">
        <Button
          onClick={handleSearch}
          disabled={!fromCity || !toCity || isSearching}
          className="w-full h-12 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold"
        >
          {isSearching ? 'Поиск...' : 'Поиск'}
        </Button>
      </div>

      {/* Recent Searches */}
      {searchHistory.length > 0 && (
        <div className="px-4 mb-4">
          <div className="space-y-2">
            {searchHistory.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSearchHistoryClick(item)}
              >
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-gray-900 font-medium text-sm">
                      {item.from_city} → {item.to_city}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {item.departure_date ? format(new Date(item.departure_date), 'dd MMM', { locale: ru }) : ''} • {item.passengers_count || 1} пас.
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddressAutocomplete
        isOpen={showFromSelector}
        onClose={() => setShowFromSelector(false)}
        onSelect={(address) => setFromCity(address)}
        title="Откуда"
        currentValue={fromCity}
        placeholder="Откуда вы едете?"
      />

      <AddressAutocomplete
        isOpen={showToSelector}
        onClose={() => setShowToSelector(false)}
        onSelect={(address) => setToCity(address)}
        title="Куда"
        currentValue={toCity}
        placeholder="Куда вы едете?"
      />



      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default PassengerSearchPage;
