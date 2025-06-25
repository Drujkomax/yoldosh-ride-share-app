
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/datepicker';
import CitySelect from '@/components/CitySelect';
import { MapPin, Calendar, Users, Search, Clock, ArrowRight, Car, UserCheck } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import BottomNavigation from '@/components/BottomNavigation';

const PassengerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [date, setDate] = useState<Date>();
  const [passengers, setPassengers] = useState(1);

  // Mock search history
  const searchHistory = [
    {
      id: 1,
      from: 'Ташкент',
      to: 'Самарканд',
      date: '23 декабря',
      passengers: 2,
      searchTime: '2 часа назад'
    },
    {
      id: 2,
      from: 'Ташкент',
      to: 'Бухара',
      date: '20 декабря',
      passengers: 1,
      searchTime: '1 день назад'
    },
    {
      id: 3,
      from: 'Самарканд',
      to: 'Ташкент',
      date: '18 декабря',
      passengers: 3,
      searchTime: '3 дня назад'
    }
  ];

  const handleSearch = () => {
    if (fromCity && toCity && date) {
      navigate('/search-rides');
    }
  };

  const handleSearchHistoryClick = (historyItem: any) => {
    setFromCity(historyItem.from);
    setToCity(historyItem.to);
    setPassengers(historyItem.passengers);
    // Note: date would need to be parsed properly in real implementation
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
              {/* Cities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    Откуда
                  </label>
                  <CitySelect
                    value={fromCity}
                    onValueChange={setFromCity}
                    placeholder="Выберите город"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                    Куда
                  </label>
                  <CitySelect
                    value={toCity}
                    onValueChange={setToCity}
                    placeholder="Выберите город"
                  />
                </div>
              </div>

              {/* Date and Passengers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-green-600" />
                    Дата поездки
                  </label>
                  <DatePicker
                    value={date}
                    onChange={setDate}
                    placeholder="Выберите дату"
                  />
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

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default PassengerDashboard;
