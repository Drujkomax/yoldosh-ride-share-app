import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Users, Clock, ArrowRight } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useRides } from '@/hooks/useRides';
import BottomNavigation from '@/components/BottomNavigation';
import LocationSelector from '@/components/LocationSelector';
import DateSelector from '@/components/DateSelector';
import PassengerSelector from '@/components/PassengerSelector';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const PassengerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { searchRides } = useRides();
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [date, setDate] = useState<Date>();
  const [passengers, setPassengers] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  
  // Modal states
  const [showFromCitySelector, setShowFromCitySelector] = useState(false);
  const [showToCitySelector, setShowToCitySelector] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassengerSelector, setShowPassengerSelector] = useState(false);

  // Search history from localStorage
  const getSearchHistory = () => {
    try {
      const history = localStorage.getItem('searchHistory');
      return history ? JSON.parse(history) : [
        {
          id: 1,
          from: 'Москва',
          to: 'Санкт-Петербург',
          date: '23 декабря',
          passengers: 2,
          searchTime: '2 часа назад'
        },
        {
          id: 2,
          from: 'Дениса Давыдова, Московская обл.',
          to: 'Санкт-Петербург',
          date: '20 декабря',
          passengers: 1,
          searchTime: '1 день назад'
        }
      ];
    } catch {
      return [];
    }
  };

  const searchHistory = getSearchHistory();

  const saveToSearchHistory = (searchData: any) => {
    try {
      const newEntry = {
        id: Date.now(),
        from: searchData.from_city,
        to: searchData.to_city,
        date: searchData.departure_date ? format(new Date(searchData.departure_date), 'dd MMMM', { locale: ru }) : 'Любая дата',
        passengers: passengers,
        searchTime: 'Только что'
      };
      
      const history = getSearchHistory();
      const updatedHistory = [newEntry, ...history.slice(0, 4)];
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  const handleSearch = async () => {
    if (fromCity && toCity && date) {
      setIsSearching(true);
      try {
        const searchData = {
          from_city: fromCity,
          to_city: toCity,
          departure_date: format(date, 'yyyy-MM-dd')
        };
        
        const results = await searchRides(searchData);
        console.log('Search results:', results);
        
        saveToSearchHistory(searchData);
        
        const params = new URLSearchParams({
          from: fromCity,
          to: toCity,
          date: format(date, 'yyyy-MM-dd'),
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
    setFromCity(historyItem.from);
    setToCity(historyItem.to);
    setPassengers(historyItem.passengers);
    try {
      if (historyItem.date !== 'Любая дата') {
        const currentYear = new Date().getFullYear();
        const parsedDate = new Date(`${historyItem.date} ${currentYear}`);
        if (!isNaN(parsedDate.getTime())) {
          setDate(parsedDate);
        }
      }
    } catch (error) {
      console.log('Could not parse date from history:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      {/* Header with Illustration */}
      <div className="relative bg-gray-900 px-6 pt-16 pb-32">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Поездки на ваш выбор по самым низким ценам
          </h1>
        </div>
        
        {/* Bus Illustration */}
        <div className="flex justify-center items-center mb-8">
          <div className="relative">
            {/* Car */}
            <div className="w-20 h-12 bg-blue-500 rounded-lg mr-4 relative">
              <div className="absolute bottom-0 left-2 w-3 h-3 bg-gray-400 rounded-full"></div>
              <div className="absolute bottom-0 right-2 w-3 h-3 bg-gray-400 rounded-full"></div>
            </div>
            
            {/* Bus */}
            <div className="w-32 h-16 bg-red-500 rounded-lg relative inline-block">
              <div className="absolute top-2 left-2 right-2 flex justify-between">
                <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                </div>
                <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                </div>
                <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                </div>
                <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                </div>
              </div>
              <div className="absolute bottom-0 left-3 w-4 h-4 bg-gray-400 rounded-full"></div>
              <div className="absolute bottom-0 right-3 w-4 h-4 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="px-6 -mt-24 relative z-10">
        <Card className="bg-gray-800 border-gray-700 shadow-xl rounded-2xl">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* From City */}
              <div className="relative">
                <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-xl">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <Button
                    variant="ghost"
                    onClick={() => setShowFromCitySelector(true)}
                    className="flex-1 justify-start text-left text-white hover:bg-gray-600 p-0"
                  >
                    {fromCity || 'Откуда'}
                  </Button>
                </div>
              </div>
              
              {/* To City */}
              <div className="relative">
                <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-xl">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <Button
                    variant="ghost"
                    onClick={() => setShowToCitySelector(true)}
                    className="flex-1 justify-start text-left text-white hover:bg-gray-600 p-0"
                  >
                    {toCity || 'Куда'}
                  </Button>
                </div>
              </div>

              {/* Date */}
              <div className="relative">
                <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-xl">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <Button
                    variant="ghost"
                    onClick={() => setShowDatePicker(true)}
                    className="flex-1 justify-start text-left text-white hover:bg-gray-600 p-0"
                  >
                    {date ? format(date, 'dd MMMM yyyy', { locale: ru }) : 'Сегодня'}
                  </Button>
                </div>
              </div>

              {/* Passengers */}
              <div className="relative">
                <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-xl">
                  <Users className="w-5 h-5 text-gray-400" />
                  <Button
                    variant="ghost"
                    onClick={() => setShowPassengerSelector(true)}
                    className="flex-1 justify-start text-left text-white hover:bg-gray-600 p-0"
                  >
                    {passengers} пассажир{passengers === 1 ? '' : passengers < 5 ? 'а' : 'ов'}
                  </Button>
                </div>
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                disabled={!fromCity || !toCity || !date || isSearching}
                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 rounded-xl font-medium text-white"
              >
                {isSearching ? 'Поиск...' : 'Поиск'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="px-6 mt-6">
          <div className="space-y-3">
            {searchHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => handleSearchHistoryClick(item)}
              >
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-white font-medium">
                      {item.from} → {item.to}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {item.date} • {item.passengers} пас.
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selectors */}
      <LocationSelector
        isOpen={showFromCitySelector}
        onClose={() => setShowFromCitySelector(false)}
        onLocationSelect={setFromCity}
        title="Откуда вы едете?"
        currentLocation={fromCity}
      />

      <LocationSelector
        isOpen={showToCitySelector}
        onClose={() => setShowToCitySelector(false)}
        onLocationSelect={setToCity}
        title="Куда вы едете?"
        currentLocation={toCity}
      />

      <DateSelector
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={setDate}
        selectedDate={date}
      />

      <PassengerSelector
        isOpen={showPassengerSelector}
        onClose={() => setShowPassengerSelector(false)}
        onPassengerSelect={setPassengers}
        currentCount={passengers}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default PassengerDashboard;
