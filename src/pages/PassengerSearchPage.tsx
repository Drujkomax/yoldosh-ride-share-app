
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Users, ArrowRight, Clock } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useRides } from '@/hooks/useRides';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import DatePickerModal from '@/components/DatePickerModal';
import PassengerCountModal from '@/components/PassengerCountModal';
import { format, startOfToday } from 'date-fns';
import { ru } from 'date-fns/locale';

const PassengerSearchPage = () => {
  const navigate = useNavigate();
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassengerSelector, setShowPassengerSelector] = useState(false);
  const [showNotificationPermission, setShowNotificationPermission] = useState(false);

  // Request notification permission on component mount
  React.useEffect(() => {
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
    if (fromCity && toCity && date) {
      setIsSearching(true);
      try {
        const searchData = {
          from_city: fromCity,
          to_city: toCity,
          departure_date: format(date, 'yyyy-MM-dd'),
          passengers_count: passengers
        };
        
        // Add to search history
        await addToHistory(searchData);
        
        const results = await searchRides({
          from_city: fromCity,
          to_city: toCity,
          departure_date: format(date, 'yyyy-MM-dd')
        });
        console.log('Search results:', results);
        
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
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-200">
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
      <div className="px-6 pt-16 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Поездки на ваш выбор по самым низким ценам
          </h1>
        </div>
        
        {/* Transportation Illustration */}
        <div className="flex justify-center items-center mb-8">
          <div className="relative">
            {/* Car */}
            <div className="w-20 h-12 bg-teal-600 rounded-lg mr-4 relative">
              <div className="absolute bottom-0 left-2 w-3 h-3 bg-gray-300 rounded-full"></div>
              <div className="absolute bottom-0 right-2 w-3 h-3 bg-gray-300 rounded-full"></div>
              <div className="absolute top-2 left-2 right-2 flex justify-between">
                <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
              </div>
            </div>
            
            {/* Bus */}
            <div className="w-32 h-16 bg-red-500 rounded-lg relative inline-block">
              <div className="absolute top-2 left-2 right-2 flex justify-between">
                <div className="w-4 h-4 bg-yellow-300 rounded-full"></div>
                <div className="w-4 h-4 bg-yellow-300 rounded-full"></div>
                <div className="w-4 h-4 bg-yellow-300 rounded-full"></div>
                <div className="w-4 h-4 bg-yellow-300 rounded-full"></div>
              </div>
              <div className="absolute bottom-0 left-3 w-4 h-4 bg-gray-300 rounded-full"></div>
              <div className="absolute bottom-0 right-3 w-4 h-4 bg-gray-300 rounded-full"></div>
              {/* Passengers silhouettes */}
              <div className="absolute top-6 left-2 right-2 flex justify-around">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-3 h-4 bg-gray-800 rounded-t-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="px-6 mb-6">
        <Card className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="space-y-0">
              {/* From Location */}
              <div className="p-4 border-b border-gray-100">
                <Button
                  onClick={() => setShowFromSelector(true)}
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto text-left hover:bg-transparent"
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="w-3 h-3 bg-gray-400 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-500 text-sm">Откуда</div>
                      <div className="text-gray-900 font-medium truncate">
                        {fromCity || 'Выберите место отправления'}
                      </div>
                    </div>
                  </div>
                </Button>
              </div>
              
              {/* To Location */}
              <div className="p-4 border-b border-gray-100">
                <Button
                  onClick={() => setShowToSelector(true)}
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto text-left hover:bg-transparent"
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="w-3 h-3 bg-gray-400 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-500 text-sm">Куда</div>
                      <div className="text-gray-900 font-medium truncate">
                        {toCity || 'Выберите место назначения'}
                      </div>
                    </div>
                  </div>
                </Button>
              </div>

              {/* Date */}
              <div className="p-4 border-b border-gray-100">
                <Button
                  onClick={() => setShowDatePicker(true)}
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto text-left hover:bg-transparent"
                >
                  <div className="flex items-center space-x-3 w-full">
                    <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 font-medium">
                        {date ? format(date, 'EEE dd MMM', { locale: ru }) : 'Сегодня'}
                      </div>
                    </div>
                  </div>
                </Button>
              </div>

              {/* Passengers */}
              <div className="p-4">
                <Button
                  onClick={() => setShowPassengerSelector(true)}
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto text-left hover:bg-transparent"
                >
                  <div className="flex items-center space-x-3 w-full">
                    <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 font-medium">
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
      <div className="px-6 mb-6">
        <Button
          onClick={handleSearch}
          disabled={!fromCity || !toCity || !date || isSearching}
          className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-semibold text-lg"
        >
          {isSearching ? 'Поиск...' : 'Поиск'}
        </Button>
      </div>

      {/* Recent Searches */}
      {searchHistory.length > 0 && (
        <div className="px-6 mb-6">
          <div className="space-y-3">
            {searchHistory.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-white rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSearchHistoryClick(item)}
              >
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-gray-900 font-medium">
                      {item.from_city} → {item.to_city}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {item.departure_date ? format(new Date(item.departure_date), 'EEE dd MMM', { locale: ru }) : ''} • {item.passengers_count || 1} пас.
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
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

      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={setDate}
        selectedDate={date}
        title="Когда вы едете?"
      />

      <PassengerCountModal
        isOpen={showPassengerSelector}
        onClose={() => setShowPassengerSelector(false)}
        onSelect={setPassengers}
        currentCount={passengers}
      />
    </div>
  );
};

export default PassengerSearchPage;
