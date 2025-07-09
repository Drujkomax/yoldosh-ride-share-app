import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Car, MapPin, Route, Clock, Users, DollarSign, MessageSquare, Check } from 'lucide-react';
import GoogleMapsApiKeyInput from '@/components/GoogleMapsApiKeyInput';
import UzbekistanCitySelector from '@/components/UzbekistanCitySelector';
import GoogleMapPicker from '@/components/GoogleMapPicker';
import RouteCalculator from '@/components/RouteCalculator';
import EnhancedLocationSearch from '@/components/EnhancedLocationSearch';
import IntermediateStopsManager from '@/components/IntermediateStopsManager';
import AddressSearchPage from '@/components/AddressSearchPage';
import MapSelectionPage from '@/components/MapSelectionPage';
import FullScreenCalendar from '@/components/FullScreenCalendar';
import TimePickerPage from '@/components/TimePickerPage';
import PassengerCountPage from '@/components/PassengerCountPage';
import PriceSettingPage from '@/components/PriceSettingPage';

interface StopLocation {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number];
  selected: boolean;
}

interface RideFormData {
  departure_date: string;
  departure_time: string;
  from_city: string;
  to_city: string;
  available_seats: number;
  price_per_seat: number;
  description: string;
  car_model: string;
  car_color: string;
  pickup_coordinates: [number, number];
  pickup_address: string;
  dropoff_coordinates: [number, number];
  dropoff_address: string;
  route_info: RouteInfo | null;
  departure_flexibility: number;
  pickup_instructions: string;
  dropoff_instructions: string;
  comfort_settings: ComfortSettings;
  intermediate_stops: StopLocation[];
}

interface ComfortSettings {
  music_allowed: boolean;
  smoking_allowed: boolean;
  pets_allowed: boolean;
  air_conditioning: boolean;
}

interface RouteInfo {
  id: string;
  summary: string;
  distance: string;
  duration: string;
  distanceValue: number;
  durationValue: number;
  polyline: string;
  hasTolls: boolean;
  tollInfo?: {
    currency: string;
    cost: number;
  };
}

const CreateRideWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  
  // New flow states
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const [showMapSelection, setShowMapSelection] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showPassengerCount, setShowPassengerCount] = useState(false);
  const [showPriceSetting, setShowPriceSetting] = useState(false);
  const [currentAddressType, setCurrentAddressType] = useState<'from' | 'to' | 'pickup' | 'dropoff'>('from');
  const [tempAddress, setTempAddress] = useState('');
  const [tempCoordinates, setTempCoordinates] = useState<[number, number]>([0, 0]);
  // Доступные промежуточные остановки (будут загружаться из API)
  const [availableStops] = useState<StopLocation[]>([
    { id: '1', name: 'Метро Чорсу', description: 'Станция метро Чорсу, Ташкент', coordinates: [41.3264, 69.2401], selected: false },
    { id: '2', name: 'Аэропорт Ташкент', description: 'Международный аэропорт им. Ислама Каримова', coordinates: [41.2579, 69.2811], selected: false },
    { id: '3', name: 'Ташкент Сити', description: 'Международный бизнес-центр, Ташкент', coordinates: [41.3111, 69.2797], selected: false },
    { id: '4', name: 'Железнодорожный вокзал', description: 'Центральный ж/д вокзал, Ташкент', coordinates: [41.2975, 69.2727], selected: false },
    { id: '5', name: 'Мега Плянет', description: 'Торговый центр Мега Плянет, Ташкент', coordinates: [41.2849, 69.2035], selected: false },
  ]);

  const [rideData, setRideData] = useState<RideFormData>({
    departure_date: '',
    departure_time: '',
    from_city: '',
    to_city: '',
    available_seats: 1,
    price_per_seat: 0,
    description: '',
    car_model: '',
    car_color: '',
    pickup_coordinates: [0, 0],
    pickup_address: '',
    dropoff_coordinates: [0, 0],
    dropoff_address: '',
    route_info: null,
    departure_flexibility: 0,
    pickup_instructions: '',
    dropoff_instructions: '',
    comfort_settings: {
      music_allowed: true,
      smoking_allowed: false,
      pets_allowed: false,
      air_conditioning: true
    },
    intermediate_stops: []
  });

  // Автоматически устанавливаем API ключ при загрузке
  useEffect(() => {
    const apiKey = 'AIzaSyCJSjDFNJvtX9BS2UGQ1QAFq7yLiid7d68';
    const savedKey = localStorage.getItem('google_maps_api_key');
    
    if (!savedKey) {
      localStorage.setItem('google_maps_api_key', apiKey);
      console.log('Google Maps API ключ автоматически установлен');
    }
  }, []);

  const handleInputChange = (step: number, field: string, value: any) => {
    setRideData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };


  const handleStopsChange = (stops: StopLocation[]) => {
    setRideData(prevData => ({
      ...prevData,
      intermediate_stops: stops
    }));
  };

  const handleLocationSelect = (step: number, coordinates: [number, number], address: string) => {
    if (step === 5) {
      setRideData(prevData => ({
        ...prevData,
        pickup_coordinates: coordinates,
        pickup_address: address
      }));
    } else if (step === 6) {
      setRideData(prevData => ({
        ...prevData,
        dropoff_coordinates: coordinates,
        dropoff_address: address
      }));
    }
  };

  const handleRouteSelect = (route: RouteInfo) => {
    setRideData(prevData => ({
      ...prevData,
      route_info: route
    }));
  };

  const handleComfortSettingsChange = (field: string, value: boolean) => {
    setRideData(prevData => ({
      ...prevData,
      comfort_settings: {
        ...prevData.comfort_settings,
        [field]: value
      }
    }));
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return rideData.departure_date !== '' && rideData.departure_time !== '';
      case 3:
        return rideData.from_city !== '' && rideData.to_city !== '';
      case 4:
        return rideData.pickup_address !== '';
      case 5:
        return rideData.dropoff_address !== '';
      case 6:
        return true; // Промежуточные остановки опциональны
      case 7:
        return rideData.available_seats > 0 && rideData.price_per_seat >= 0;
      case 8:
        return rideData.route_info !== null;
      case 9:
        return true;
      default:
        return false;
    }
  };

  const handlePublishClick = () => {
    setCurrentAddressType('from');
    setShowAddressSearch(true);
  };

  const handleAddressSelect = (address: string, coordinates: [number, number]) => {
    setTempAddress(address);
    setTempCoordinates(coordinates);
    setShowAddressSearch(false);
    setShowMapSelection(true);
  };

  const handleMapLocationSelect = (coordinates: [number, number], address: string) => {
    // Update ride data based on current address type
    if (currentAddressType === 'from') {
      setRideData(prev => ({
        ...prev,
        from_city: address,
        pickup_coordinates: coordinates,
        pickup_address: address
      }));
      setCurrentAddressType('to');
      setShowMapSelection(false);
      setShowAddressSearch(true);
    } else if (currentAddressType === 'to') {
      setRideData(prev => ({
        ...prev,
        to_city: address,
        dropoff_coordinates: coordinates,
        dropoff_address: address
      }));
      setShowMapSelection(false);
      setShowCalendar(true);
    }
  };

  const handleDateSelect = (date: Date) => {
    setRideData(prev => ({
      ...prev,
      departure_date: date.toISOString().split('T')[0]
    }));
    setShowCalendar(false);
    setShowTimePicker(true);
  };

  const handleTimeSelect = (time: string) => {
    setRideData(prev => ({
      ...prev,
      departure_time: time
    }));
    setShowTimePicker(false);
    setShowPassengerCount(true);
  };

  const handlePassengerCountSelect = (count: number) => {
    setRideData(prev => ({
      ...prev,
      available_seats: count
    }));
    setShowPassengerCount(false);
    setShowPriceSetting(true);
  };

  const handlePriceSelect = (price: number) => {
    setRideData(prev => ({
      ...prev,
      price_per_seat: price
    }));
    setShowPriceSetting(false);
    // Jump to wizard step 7 for additional options
    setCurrentStep(7);
  };

  const handleCreateRide = async () => {
    // Отправка данных на сервер
    console.log('Создание поездки:', rideData);
    navigate('/driver-home');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <GoogleMapsApiKeyInput autoSetKey="AIzaSyCJSjDFNJvtX9BS2UGQ1QAFq7yLiid7d68" />
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                <Car className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Создание поездки</h2>
              <p className="text-gray-600">
                Добро пожаловать в мастер создания поездки. Мы поможем вам опубликовать поездку для пассажиров.
              </p>
              <div className="bg-blue-50 rounded-xl p-4 text-left">
                <h3 className="font-semibold text-blue-800 mb-2">Что вас ждет:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Выбор маршрута поездки</li>
                  <li>• Точное указание мест посадки и высадки</li>
                  <li>• Расчет оптимального маршрута</li>
                  <li>• Настройка деталей поездки</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800">
                Дата и время отправления
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="departure_date" className="block text-sm font-medium text-gray-700">
                    Дата отправления
                  </label>
                  <input
                    type="date"
                    id="departure_date"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={rideData.departure_date}
                    onChange={(e) => handleInputChange(currentStep, 'departure_date', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="departure_time" className="block text-sm font-medium text-gray-700">
                    Время отправления
                  </label>
                  <input
                    type="time"
                    id="departure_time"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={rideData.departure_time}
                    onChange={(e) => handleInputChange(currentStep, 'departure_time', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Откуда вы едете?</h2>
              <div className="bg-gray-100 rounded-2xl p-4 text-gray-500 text-left flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="flex-1 cursor-pointer">
                  {rideData.from_city || 'Введите полный адрес'}
                </span>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start text-left p-4 h-auto hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-blue-600 font-medium">
                    Использовать текущее местоположение
                  </span>
                </div>
              </Button>
              {rideData.from_city && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{rideData.from_city}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Где вы хотите забрать пассажиров?</h2>
              <div className="bg-blue-50 rounded-xl p-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-blue-100 rounded-full mt-1">
                    <span className="text-blue-600 text-xs">?</span>
                  </div>
                  <div>
                    <p className="text-blue-800 font-medium">Зачем точное местоположение?</p>
                    <p className="text-blue-700 text-sm mt-1">
                      Это поможет пассажирам легче найти вас
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-2xl p-4 text-gray-500 text-left flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="flex-1 cursor-pointer">
                  {rideData.pickup_address || 'Введите полный адрес'}
                </span>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Куда вы едете?</h2>
              <div className="bg-gray-100 rounded-2xl p-4 text-gray-500 text-left flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="flex-1 cursor-pointer">
                  {rideData.to_city || 'Введите полный адрес'}
                </span>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start text-left p-4 h-auto hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-blue-600 font-medium">
                    Использовать текущее местоположение
                  </span>
                </div>
              </Button>
              {rideData.to_city && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{rideData.to_city}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Где вы хотите высадить пассажиров?</h2>
              <div className="bg-blue-50 rounded-xl p-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-blue-100 rounded-full mt-1">
                    <span className="text-blue-600 text-xs">?</span>
                  </div>
                  <div>
                    <p className="text-blue-800 font-medium">Зачем точное местоположение?</p>
                    <p className="text-blue-700 text-sm mt-1">
                      Это поможет пассажирам точно знать место высадки
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-2xl p-4 text-gray-500 text-left flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="flex-1 cursor-pointer">
                  {rideData.dropoff_address || 'Введите полный адрес'}
                </span>
              </div>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Добавьте остановки для привлечения большего количества пассажиров</h2>
              <Button
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl"
              >
                <MapPin className="h-5 w-5 mr-2" />
                Управление остановками {rideData.intermediate_stops.length > 0 && `(${rideData.intermediate_stops.length})`}
              </Button>
              {rideData.intermediate_stops.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600">Выбранные остановки:</h3>
                  {rideData.intermediate_stops.map((stop) => (
                    <div key={stop.id} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">{stop.name}</div>
                        <div className="text-sm text-gray-500">{stop.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800">
                Детали поездки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="available_seats" className="block text-sm font-medium text-gray-700">
                  Количество мест
                </label>
                <input
                  type="number"
                  id="available_seats"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={rideData.available_seats}
                  onChange={(e) => handleInputChange(currentStep, 'available_seats', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label htmlFor="price_per_seat" className="block text-sm font-medium text-gray-700">
                  Цена за место (UZS)
                </label>
                <input
                  type="number"
                  id="price_per_seat"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={rideData.price_per_seat}
                  onChange={(e) => handleInputChange(currentStep, 'price_per_seat', parseFloat(e.target.value))}
                />
              </div>
            </CardContent>
          </div>
        );
      case 9:
        return (
          <div className="space-y-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800">
                Маршрут
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rideData.pickup_coordinates[0] === 0 || rideData.dropoff_coordinates[0] === 0 ? (
                <div className="text-center p-6 text-gray-500">
                  <MapPin className="h-10 w-10 mx-auto mb-4" />
                  <p>Пожалуйста, выберите места посадки и высадки, чтобы рассчитать маршрут.</p>
                </div>
              ) : (
                <RouteCalculator
                  startPoint={rideData.pickup_coordinates}
                  endPoint={rideData.dropoff_coordinates}
                  startAddress={rideData.pickup_address}
                  endAddress={rideData.dropoff_address}
                  onRouteSelect={handleRouteSelect}
                />
              )}
            </CardContent>
          </div>
        );
      case 10:
        return (
          <div className="space-y-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800">
                Дополнительная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Описание поездки
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={rideData.description}
                  onChange={(e) => handleInputChange(currentStep, 'description', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="car_model" className="block text-sm font-medium text-gray-700">
                    Модель автомобиля
                  </label>
                  <input
                    type="text"
                    id="car_model"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={rideData.car_model}
                    onChange={(e) => handleInputChange(currentStep, 'car_model', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="car_color" className="block text-sm font-medium text-gray-700">
                    Цвет автомобиля
                  </label>
                  <input
                    type="text"
                    id="car_color"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={rideData.car_color}
                    onChange={(e) => handleInputChange(currentStep, 'car_color', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-md font-semibold text-gray-700">Настройки комфорта:</h4>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded text-blue-500 focus:ring-blue-500"
                      checked={rideData.comfort_settings.music_allowed}
                      onChange={(e) => handleComfortSettingsChange('music_allowed', e.target.checked)}
                    />
                    <span>Музыка разрешена</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded text-blue-500 focus:ring-blue-500"
                      checked={rideData.comfort_settings.smoking_allowed}
                      onChange={(e) => handleComfortSettingsChange('smoking_allowed', e.target.checked)}
                    />
                    <span>Курение разрешено</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded text-blue-500 focus:ring-blue-500"
                      checked={rideData.comfort_settings.pets_allowed}
                      onChange={(e) => handleComfortSettingsChange('pets_allowed', e.target.checked)}
                    />
                    <span>Животные разрешены</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded text-blue-500 focus:ring-blue-500"
                      checked={rideData.comfort_settings.air_conditioning}
                      onChange={(e) => handleComfortSettingsChange('air_conditioning', e.target.checked)}
                    />
                    <span>Кондиционер</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/driver-home')}
              className="rounded-xl hover:bg-blue-50 p-3"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад
            </Button>
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Создание поездки
              </h1>
              <p className="text-slate-600 mt-1">Шаг {currentStep} из 8</p>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={(currentStep / 8) * 100} className="h-3 bg-gray-200" />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Начало</span>
            <span>Завершение</span>
          </div>
        </div>

        {/* Main Content */}
        <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 mt-8 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="px-6 py-3 rounded-xl"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
              
              {currentStep === 1 ? (
                <Button
                  onClick={handlePublishClick}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Опубликовать
                </Button>
              ) : currentStep < 8 ? (
                <Button
                  onClick={() => setCurrentStep(Math.min(8, currentStep + 1))}
                  disabled={!canProceedToNextStep()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Далее
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCreateRide}
                  disabled={!canProceedToNextStep()}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Опубликовать поездку
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>


      {/* New Flow Modals */}
      {showAddressSearch && (
        <AddressSearchPage
          title={currentAddressType === 'from' ? 'Откуда вы едете?' : 'Куда вы едете?'}
          placeholder={currentAddressType === 'from' ? 'Введите адрес отправления' : 'Введите адрес назначения'}
          onAddressSelect={handleAddressSelect}
          onBack={() => setShowAddressSearch(false)}
        />
      )}

      {showMapSelection && (
        <MapSelectionPage
          title={currentAddressType === 'from' ? 'Выберите точку отправления' : 'Выберите точку назначения'}
          initialAddress={tempAddress}
          initialCoordinates={tempCoordinates}
          onLocationSelect={handleMapLocationSelect}
          onBack={() => {
            setShowMapSelection(false);
            setShowAddressSearch(true);
          }}
        />
      )}

      {showCalendar && (
        <FullScreenCalendar
          selectedDate={rideData.departure_date ? new Date(rideData.departure_date) : undefined}
          onDateSelect={handleDateSelect}
          onBack={() => {
            setShowCalendar(false);
            setCurrentAddressType('to');
            setShowAddressSearch(true);
          }}
        />
      )}

      {showTimePicker && (
        <TimePickerPage
          selectedTime={rideData.departure_time}
          onTimeSelect={handleTimeSelect}
          onBack={() => {
            setShowTimePicker(false);
            setShowCalendar(true);
          }}
        />
      )}

      {showPassengerCount && (
        <PassengerCountPage
          selectedCount={rideData.available_seats}
          onCountSelect={handlePassengerCountSelect}
          onBack={() => {
            setShowPassengerCount(false);
            setShowTimePicker(true);
          }}
        />
      )}

      {showPriceSetting && (
        <PriceSettingPage
          selectedPrice={rideData.price_per_seat}
          onPriceSelect={handlePriceSelect}
          onBack={() => {
            setShowPriceSetting(false);
            setShowPassengerCount(true);
          }}
        />
      )}
    </div>
  );
};

export default CreateRideWizard;
