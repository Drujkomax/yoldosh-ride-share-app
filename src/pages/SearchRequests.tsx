
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, MapPin, Calendar, Users, DollarSign, MessageCircle, Loader2, Filter } from 'lucide-react';
import { useRideRequests } from '@/hooks/useRideRequests';
import { useUser } from '@/contexts/UserContext';
import { createChat } from '@/hooks/useChats';
import { toast } from 'sonner';
import DriverBottomNavigation from '@/components/DriverBottomNavigation';
import UzbekistanCitySelector from '@/components/UzbekistanCitySelector';
import EnhancedCalendar from '@/components/EnhancedCalendar';
import { format, startOfToday, addYears } from 'date-fns';
import { ru } from 'date-fns/locale';

const SearchRequests = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { requests, isLoading } = useRideRequests();
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [searchDate, setSearchDate] = useState<Date>();
  const [showFromSelector, setShowFromSelector] = useState(false);
  const [showToSelector, setShowToSelector] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filteredRequests = requests.filter(request => {
    const fromMatch = !searchFrom || request.from_city.toLowerCase().includes(searchFrom.toLowerCase());
    const toMatch = !searchTo || request.to_city.toLowerCase().includes(searchTo.toLowerCase());
    const dateMatch = !searchDate || format(new Date(request.preferred_date), 'yyyy-MM-dd') === format(searchDate, 'yyyy-MM-dd');
    return fromMatch && toMatch && dateMatch;
  });

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const handleContactPassenger = async (request: any) => {
    if (!user?.id) {
      toast.error('Необходимо войти в систему');
      return;
    }

    try {
      const chatId = await createChat('', user.id, request.passenger_id);
      const passengerName = request.passenger?.name || 'Пассажир';
      navigate(`/chat/${encodeURIComponent(passengerName)}?chatId=${chatId}&type=passenger&from=${request.from_city}&to=${request.to_city}&date=${new Date(request.preferred_date).toLocaleDateString('ru-RU')}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Ошибка при создании чата');
    }
  };

  const clearFilters = () => {
    setSearchFrom('');
    setSearchTo('');
    setSearchDate(undefined);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-slate-600">Загрузка заявок...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/driver-home')}
              className="rounded-xl hover:bg-yoldosh-primary/10 p-3"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад
            </Button>
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Заявки пассажиров
              </h1>
              <p className="text-slate-600 mt-1">Найдите пассажиров для своих поездок</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-xl hover:bg-blue-50 p-3"
            >
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Enhanced Search Form */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setShowFromSelector(true)}
                  className="w-full h-12 justify-start border-2 border-slate-200 hover:border-blue-400 bg-white/80 backdrop-blur-sm rounded-xl"
                >
                  <MapPin className="h-5 w-5 mr-2 text-slate-400" />
                  {searchFrom || 'Откуда'}
                </Button>
              </div>
              
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setShowToSelector(true)}
                  className="w-full h-12 justify-start border-2 border-slate-200 hover:border-blue-400 bg-white/80 backdrop-blur-sm rounded-xl"
                >
                  <MapPin className="h-5 w-5 mr-2 text-slate-400" />
                  {searchTo || 'Куда'}
                </Button>
              </div>

              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setShowDatePicker(true)}
                  className="w-full h-12 justify-start border-2 border-slate-200 hover:border-blue-400 bg-white/80 backdrop-blur-sm rounded-xl"
                >
                  <Calendar className="h-5 w-5 mr-2 text-slate-400" />
                  {searchDate ? format(searchDate, 'dd MMM', { locale: ru }) : 'Дата'}
                </Button>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={clearFilters}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl"
                >
                  Сбросить
                </Button>
                <Button className="flex-1 h-12 bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-xl">
                  <Search className="h-5 w-5 mr-2" />
                  Найти
                </Button>
              </div>
            </div>

            {/* Active Filters */}
            {(searchFrom || searchTo || searchDate) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {searchFrom && (
                  <Badge variant="secondary" className="px-3 py-1">
                    Откуда: {searchFrom}
                  </Badge>
                )}
                {searchTo && (
                  <Badge variant="secondary" className="px-3 py-1">
                    Куда: {searchTo}
                  </Badge>
                )}
                {searchDate && (
                  <Badge variant="secondary" className="px-3 py-1">
                    Дата: {format(searchDate, 'dd MMMM', { locale: ru })}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Requests List */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">
              Активные заявки ({filteredRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Заявки не найдены</p>
                {searchFrom || searchTo || searchDate ? (
                  <p className="text-sm">Попробуйте изменить параметры поиска</p>
                ) : (
                  <p className="text-sm">Пока нет активных заявок пассажиров</p>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredRequests.map(request => (
                  <div key={request.id} className="p-6 hover:bg-gray-50 cursor-pointer transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-lg text-slate-800 truncate">
                              {request.passenger?.name || 'Пассажир'}
                            </span>
                            {request.passenger?.is_verified && (
                              <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                                ✓
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-slate-500">
                            {formatDate(request.preferred_date)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-slate-600 mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{request.from_city} → {request.to_city}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-slate-600 mb-2">
                          <Users className="h-4 w-4" />
                          <span>{request.passengers_count} пассажира</span>
                        </div>
                        {request.max_price_per_seat && (
                          <div className="flex items-center space-x-3 text-sm text-slate-600 mb-2">
                            <DollarSign className="h-4 w-4" />
                            <span>до {request.max_price_per_seat} UZS</span>
                          </div>
                        )}
                        <p className="text-slate-700 truncate">{request.description || 'Нет описания'}</p>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="mt-4 bg-blue-50 text-blue-600 hover:bg-blue-100"
                          onClick={() => handleContactPassenger(request)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Связаться
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selectors */}
      <UzbekistanCitySelector
        isOpen={showFromSelector}
        onClose={() => setShowFromSelector(false)}
        onCitySelect={setSearchFrom}
        title="Откуда ищем пассажиров?"
        currentCity={searchFrom}
      />

      <UzbekistanCitySelector
        isOpen={showToSelector}
        onClose={() => setShowToSelector(false)}
        onCitySelect={setSearchTo}
        title="Куда ищем пассажиров?"
        currentCity={searchTo}
      />

      <EnhancedCalendar
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={setSearchDate}
        selectedDate={searchDate}
        minDate={startOfToday()}
        maxDate={addYears(startOfToday(), 1)}
        title="Выберите дату поездки"
      />

      <DriverBottomNavigation />
    </div>
  );
};

export default SearchRequests;
