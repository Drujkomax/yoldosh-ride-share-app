import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, Clock, DollarSign, MapPin, Zap, Users, Cigarette, PawPrint, CreditCard, ShieldCheck, Car, Bus } from 'lucide-react';
import { useRides } from '@/hooks/useRides';

const SearchFiltersPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { searchRides } = useRides();
  
  const [selectedSort, setSelectedSort] = useState('earliest');
  const [selectedTimeRanges, setSelectedTimeRanges] = useState<string[]>([]);
  const [selectedTrustOptions, setSelectedTrustOptions] = useState<string[]>(['verified']);
  const [selectedComforts, setSelectedComforts] = useState<string[]>([]);
  const [ridesData, setRidesData] = useState<any[]>([]);

  // Получаем данные поиска из URL параметров
  useEffect(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const date = searchParams.get('date');
    const seats = searchParams.get('seats');

    if (from && to && date) {
      const fetchRides = async () => {
        try {
          const results = await searchRides({
            from_city: from,
            to_city: to,
            departure_date: date,
          });
          setRidesData(results || []);
        } catch (error) {
          console.error('Error fetching rides:', error);
          setRidesData([]);
        }
      };

      fetchRides();
    }
  }, [searchParams, searchRides]);

  // Функция для подсчета рейсов по времени
  const countRidesByTime = (timeRange: string) => {
    if (!ridesData || ridesData.length === 0) return 0;
    
    return ridesData.filter(ride => {
      const departureTime = ride.departure_time;
      if (!departureTime) return false;
      
      const [hours] = departureTime.split(':').map(Number);
      
      switch (timeRange) {
        case 'morning':
          return hours >= 6 && hours < 12;
        case 'afternoon':
          return hours >= 12 && hours < 18;
        case 'evening':
          return hours >= 18;
        default:
          return false;
      }
    }).length;
  };

  // Функция для подсчета верифицированных водителей
  const countVerifiedDrivers = () => {
    if (!ridesData || ridesData.length === 0) return 0;
    return ridesData.filter(ride => ride.driver_verified || ride.is_verified).length;
  };

  // Функция для подсчета рейсов с определенными удобствами
  const countRidesByComfort = (comfortType: string) => {
    if (!ridesData || ridesData.length === 0) return 0;
    
    return ridesData.filter(ride => {
      const settings = ride.comfort_settings || {};
      switch (comfortType) {
        case 'max_two_back':
          return ride.available_seats <= 2;
        case 'instant_booking':
          return ride.instant_booking_enabled;
        case 'smoking':
          return settings.smoking_allowed;
        case 'pets':
          return settings.pets_allowed;
        case 'e_tickets':
          return true; // Предполагаем, что все рейсы поддерживают электронные билеты
        default:
          return false;
      }
    }).length;
  };

  // Функция для подсчета легковых машин
  const countCarRides = () => {
    if (!ridesData || ridesData.length === 0) return 0;
    return ridesData.filter(ride => {
      // Предполагаем, что легковые машины имеют до 4 мест
      return ride.available_seats <= 4;
    }).length;
  };

  // Функция для подсчета автобусов
  const countBusRides = () => {
    if (!ridesData || ridesData.length === 0) return 0;
    return ridesData.filter(ride => {
      // Предполагаем, что автобусы имеют больше 4 мест
      return ride.available_seats > 4;
    }).length;
  };

  const sortOptions = [
    { id: 'earliest', label: 'Самые ранние поездки', icon: Clock },
    { id: 'cheapest', label: 'Самые дешевые поездки', icon: DollarSign },
    { id: 'departure_close', label: 'Близко к месту отправления', icon: MapPin },
    { id: 'arrival_close', label: 'Близко к месту прибытия', icon: MapPin },
    { id: 'shortest', label: 'Самые короткие поездки', icon: Zap },
  ];

  const timeRanges = [
    { id: 'morning', label: '06:00-12:00', count: countRidesByTime('morning') },
    { id: 'afternoon', label: '12:01-18:00', count: countRidesByTime('afternoon') },
    { id: 'evening', label: 'После 18:00', count: countRidesByTime('evening') },
  ];

  const trustOptions = [
    { id: 'verified', label: 'Профиль подтвержден', count: countVerifiedDrivers() },
  ];

  const comfortOptions = [
    { id: 'max_two_back', label: 'Максимум двое сзади', count: countRidesByComfort('max_two_back'), icon: Users },
    { id: 'instant_booking', label: 'Мгновенное бронирование', count: countRidesByComfort('instant_booking'), icon: Zap },
    { id: 'smoking', label: 'Можно курить', count: countRidesByComfort('smoking'), icon: Cigarette },
    { id: 'pets', label: 'Можно с животными', count: countRidesByComfort('pets'), icon: PawPrint },
    { id: 'e_tickets', label: 'Электронные билеты', count: countRidesByComfort('e_tickets'), icon: CreditCard },
  ];

  const toggleTimeRange = (rangeId: string) => {
    setSelectedTimeRanges(prev => 
      prev.includes(rangeId) 
        ? prev.filter(id => id !== rangeId)
        : [...prev, rangeId]
    );
  };

  const toggleTrustOption = (optionId: string) => {
    setSelectedTrustOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const toggleComfort = (comfortId: string) => {
    setSelectedComforts(prev => 
      prev.includes(comfortId) 
        ? prev.filter(id => id !== comfortId)
        : [...prev, comfortId]
    );
  };

  const clearAllFilters = () => {
    setSelectedSort('earliest');
    setSelectedTimeRanges([]);
    setSelectedTrustOptions([]);
    setSelectedComforts([]);
  };

  const applyFilters = () => {
    // Получаем оригинальные параметры поиска
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const date = searchParams.get('date');
    const seats = searchParams.get('seats');

    // Создаем новые URL параметры с фильтрами
    const filterParams = new URLSearchParams();
    
    // Добавляем оригинальные параметры поиска
    if (from) filterParams.set('from', from);
    if (to) filterParams.set('to', to);
    if (date) filterParams.set('date', date);
    if (seats) filterParams.set('seats', seats);

    // Добавляем параметры фильтров
    if (selectedSort !== 'earliest') {
      filterParams.set('sort', selectedSort);
    }
    
    if (selectedTimeRanges.length > 0) {
      filterParams.set('timeRanges', selectedTimeRanges.join(','));
    }
    
    if (selectedTrustOptions.length > 0) {
      filterParams.set('trust', selectedTrustOptions.join(','));
    }
    
    if (selectedComforts.length > 0) {
      filterParams.set('comforts', selectedComforts.join(','));
    }

    // Переходим на страницу поиска поездок с фильтрами
    navigate(`/search-rides?${filterParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="p-0 hover:bg-transparent"
          >
            <X className="h-6 w-6 text-blue-500" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Фильтровать</h1>
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className="text-blue-500 hover:bg-transparent p-0"
          >
            Сбросить все
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-8">
        {/* Сортировать */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-6">Сортировать</h2>
          <div className="space-y-4">
            {sortOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <label
                  key={option.id}
                  className="flex items-center justify-between cursor-pointer py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center ${
                      selectedSort === option.id ? 'border-blue-500' : 'border-gray-300'
                    }`}>
                      {selectedSort === option.id && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <span className="text-gray-700 text-base">{option.label}</span>
                  </div>
                  <IconComponent className="h-5 w-5 text-gray-400" />
                  <input
                    type="radio"
                    name="sort"
                    value={option.id}
                    checked={selectedSort === option.id}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="hidden"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Время выезда */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-6">Время выезда</h2>
          <div className="space-y-4">
            {timeRanges.map((range) => (
              <label
                key={range.id}
                className="flex items-center justify-between cursor-pointer py-2"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 border-2 rounded flex items-center justify-center ${
                    selectedTimeRanges.includes(range.id) ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {selectedTimeRanges.includes(range.id) && (
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-gray-700 text-base">{range.label}</span>
                </div>
                <span className="text-gray-400 text-base">{range.count}</span>
                <input
                  type="checkbox"
                  checked={selectedTimeRanges.includes(range.id)}
                  onChange={() => toggleTimeRange(range.id)}
                  className="hidden"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Доверие и безопасность */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-6">Доверие и безопасность</h2>
          <div className="space-y-4">
            {trustOptions.map((option) => (
              <label
                key={option.id}
                className="flex items-center justify-between cursor-pointer py-2"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 border-2 rounded flex items-center justify-center ${
                    selectedTrustOptions.includes(option.id) ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {selectedTrustOptions.includes(option.id) && (
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-gray-700 text-base">{option.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-base">{option.count}</span>
                  <ShieldCheck className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  type="checkbox"
                  checked={selectedTrustOptions.includes(option.id)}
                  onChange={() => toggleTrustOption(option.id)}
                  className="hidden"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Удобства */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-6">Удобства</h2>
          <div className="space-y-4">
            {comfortOptions.map((comfort) => {
              const IconComponent = comfort.icon;
              return (
                <label
                  key={comfort.id}
                  className="flex items-center justify-between cursor-pointer py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 border-2 rounded flex items-center justify-center ${
                      selectedComforts.includes(comfort.id) ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {selectedComforts.includes(comfort.id) && (
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-gray-700 text-base">{comfort.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-base">{comfort.count}</span>
                    <IconComponent className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedComforts.includes(comfort.id)}
                    onChange={() => toggleComfort(comfort.id)}
                    className="hidden"
                  />
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="p-4">
          <div className="flex items-center justify-center gap-8 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-6 bg-gray-600 rounded-sm flex items-center justify-center">
                <Car className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold">{countCarRides()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-6 bg-blue-500 rounded-sm flex items-center justify-center">
                <Bus className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold">{countBusRides()}</span>
            </div>
          </div>
          <Button
            onClick={applyFilters}
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl"
          >
            Смотреть поездки
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchFiltersPage;