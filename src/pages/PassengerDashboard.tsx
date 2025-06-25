import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Users, Search, Clock, ArrowRight, Car, UserCheck, RefreshCw } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useRideRequests } from '@/hooks/useRides';
import BottomNavigation from '@/components/BottomNavigation';
import CityMapSelector from '@/components/CityMapSelector';
import FullScreenDatePicker from '@/components/FullScreenDatePicker';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

const PassengerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { createRequest } = useRideRequests();
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [date, setDate] = useState<Date>();
  const [passengers, setPassengers] = useState(1);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  
  // Modal states
  const [showFromCitySelector, setShowFromCitySelector] = useState(false);
  const [showToCitySelector, setShowToCitySelector] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    // Load search history from localStorage
    const savedHistory = localStorage.getItem(`searchHistory_${user?.id}`);
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, [user]);

  const saveSearchToHistory = (searchData: any) => {
    const newHistory = [searchData, ...searchHistory.slice(0, 4)]; // Keep only last 5 searches
    setSearchHistory(newHistory);
    localStorage.setItem(`searchHistory_${user?.id}`, JSON.stringify(newHistory));
  };

  const handleSearch = async () => {
    if (fromCity && toCity && date) {
      try {
        const searchData = {
          id: Date.now(),
          from: fromCity,
          to: toCity,
          date: format(date, 'dd MMMM', { locale: ru }),
          passengers,
          searchTime: 'Только что'
        };

        // Save to history
        saveSearchToHistory(searchData);

        // Create ride request in database
        await createRequest({
          from_city: fromCity,
          to_city: toCity,
          preferred_date: format(date, 'yyyy-MM-dd'),
          passengers_count: passengers,
          status: 'active'
        });

        toast({
          title: "Заявка создана",
          description: "Ваша заявка на поездку отправлена водителям",
        });

        navigate('/search-rides');
      } catch (error: any) {
        toast({
          title: "Ошибка",
          description: error.message || "Не удалось создать заявку",
          variant: "destructive"
        });
      }
    }
  };

  const handleSwapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const handleSearchHistoryClick = (historyItem: any) => {
    setFromCity(historyItem.from);
    setToCity(historyItem.to);
    setPassengers(historyItem.passengers);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20">
      {/* Animated Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Animated Cars */}
        <div className="absolute inset-0">
          <div className="animate-pulse absolute top-8 left-10 opacity-30">
            <Car className="h-8 w-8 text-white transform rotate-45" />
          </div>
          <div className="animate-bounce absolute top-16 right-20 opacity-40 animation-delay-300">
            <UserCheck className="h-6 w-6 text-white" />
          </div>
          <div className="animate-pulse absolute bottom-8 left-1/4 opacity-30 animation-delay-500">
            <Car className="h-6 w-6 text-white transform -rotate-45" />
          </div>
        </div>

        <div className="relative px-6 py-12 text-center">
          <div className="mb-4">
            <h1 className="text-3xl font-bold mb-2 animate-fade-in">
              Добро пожаловать, {user?.name || 'Пассажир'}!
            </h1>
            <p className="text-blue-100 text-lg animate-fade-in animation-delay-200">
              Найдите попутчиков и экономьте на поездках
            </p>
          </div>
          
          {/* Animated Rideshare Concept */}
          <div className="flex justify-center items-center space-x-4 mt-8 animate-fade-in animation-delay-400">
            <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
              <MapPin className="h-5 w-5" />
              <span className="text-sm font-medium">Откуда</span>
            </div>
            <ArrowRight className="h-6 w-6 animate-pulse" />
            <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
              <MapPin className="h-5 w-5" />
              <span className="text-sm font-medium">Куда</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="px-6 -mt-8 relative z-10">
        <Card className="bg-white/90 backdrop-blur-lg shadow-xl rounded-2xl border-0">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">
              Найти поездку
            </h2>
            
            <div className="space-y-4">
              {/* Cities with Swap Button */}
              <div className="relative">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                      Откуда
                    </label>
                    <Button
                      variant="outline"
                      onClick={() => setShowFromCitySelector(true)}
                      className="w-full h-12 justify-start text-left rounded-xl border-2 bg-white/80 backdrop-blur-sm"
                    >
                      <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                      {fromCity || 'Выберите город отправления'}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                      Куда
                    </label>
                    <Button
                      variant="outline"
                      onClick={() => setShowToCitySelector(true)}
                      className="w-full h-12 justify-start text-left rounded-xl border-2 bg-white/80 backdrop-blur-sm"
                    >
                      <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                      {toCity || 'Выберите город назначения'}
                    </Button>
                  </div>
                </div>
                
                {/* Swap Button */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSwapCities}
                  disabled={!fromCity || !toCity}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-md hover:shadow-lg rounded-full w-10 h-10"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {/* Date and Passengers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-green-600" />
                    Дата поездки
                  </label>
                  <Button
                    variant="outline"
                    onClick={() => setShowDatePicker(true)}
                    className="w-full h-12 justify-start text-left rounded-xl border-2 bg-white/80 backdrop-blur-sm"
                  >
                    <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                    {date ? format(date, 'dd MMMM yyyy', { locale: ru }) : 'Выберите дату'}
                  </Button>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-orange-600" />
                    Пассажиры
                  </label>
                  <div className="flex items-center space-x-3 h-12">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPassengers(Math.max(1, passengers - 1))}
                      className="h-10 w-10 rounded-full p-0"
                    >
                      -
                    </Button>
                    <span className="text-lg font-semibold min-w-[2rem] text-center">
                      {passengers}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPassengers(Math.min(8, passengers + 1))}
                      className="h-10 w-10 rounded-full p-0"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSearch}
                disabled={!fromCity || !toCity || !date}
                className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-medium"
              >
                <Search className="h-5 w-5 mr-2" />
                Найти поездку
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="px-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              История поиска
            </h3>
            <Clock className="h-5 w-5 text-slate-400" />
          </div>
          
          <div className="space-y-3">
            {searchHistory.map((item) => (
              <Card
                key={item.id}
                className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 cursor-pointer"
                onClick={() => handleSearchHistoryClick(item)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-slate-900">{item.from}</span>
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-slate-900">{item.to}</span>
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-600">{item.date}</div>
                      <div className="text-xs text-slate-400">
                        {item.passengers} пас. • {item.searchTime}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* City Selectors */}
      <CityMapSelector
        isOpen={showFromCitySelector}
        onClose={() => setShowFromCitySelector(false)}
        onCitySelect={setFromCity}
        title="Откуда вы едете?"
        currentCity={fromCity}
      />

      <CityMapSelector
        isOpen={showToCitySelector}
        onClose={() => setShowToCitySelector(false)}
        onCitySelect={setToCity}
        title="Куда вы едете?"
        currentCity={toCity}
      />

      {/* Date Picker */}
      <FullScreenDatePicker
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={setDate}
        selectedDate={date}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default PassengerDashboard;
