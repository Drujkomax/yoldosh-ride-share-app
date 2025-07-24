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
import FullScreenCalendar from '@/components/FullScreenCalendar';
import TimePickerPage from '@/components/TimePickerPage';
import PassengerCountPage from '@/components/PassengerCountPage';
import PriceSettingPage from '@/components/PriceSettingPage';
import DriverBottomNavigation from '@/components/DriverBottomNavigation';

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
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showPassengerCount, setShowPassengerCount] = useState(false);
  const [showPriceSetting, setShowPriceSetting] = useState(false);
  const [currentAddressType, setCurrentAddressType] = useState<'from' | 'to'>('from');

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

  // API keys are now managed securely - no hardcoded keys
  useEffect(() => {
    const savedKey = localStorage.getItem('google_maps_api_key');
    
    if (!savedKey) {
      console.warn('Google Maps API key not configured. Please set up API keys in settings.');
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
    // Directly update ride data without map confirmation
    if (currentAddressType === 'from') {
      setRideData(prev => ({
        ...prev,
        from_city: address,
        pickup_coordinates: coordinates,
        pickup_address: address
      }));
      setCurrentAddressType('to');
      setShowAddressSearch(true);
    } else if (currentAddressType === 'to') {
      setRideData(prev => ({
        ...prev,
        to_city: address,
        dropoff_coordinates: coordinates,
        dropoff_address: address
      }));
      setShowAddressSearch(false);
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
            <GoogleMapsApiKeyInput />
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
                  <li>• Выбор городов отправления и назначения</li>
                  <li>• Выбор даты и времени поездки</li>
                  <li>• Настройка количества мест и цены</li>
                  <li>• Дополнительные настройки комфорта</li>
                </ul>
              </div>
            </div>
          </div>
        );
        
      case 7:
        return (
          <div className="space-y-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                <Car className="h-6 w-6 mr-2 text-blue-600" />
                Информация о машине
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="car_model" className="block text-sm font-medium text-gray-700">
                    Модель автомобиля
                  </label>
                  <input
                    type="text"
                    id="car_model"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Например: Toyota Camry"
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
                    placeholder="Например: белый"
                    value={rideData.car_color}
                    onChange={(e) => handleInputChange(currentStep, 'car_color', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Дополнительная информация
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Расскажите пассажирам о своей поездке..."
                  value={rideData.description}
                  onChange={(e) => handleInputChange(currentStep, 'description', e.target.value)}
                />
              </div>
            </CardContent>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                <MessageSquare className="h-6 w-6 mr-2 text-blue-600" />
                Настройки комфорта
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={rideData.comfort_settings.music_allowed}
                    onChange={(e) => handleComfortSettingsChange('music_allowed', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Музыка разрешена</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={rideData.comfort_settings.smoking_allowed}
                    onChange={(e) => handleComfortSettingsChange('smoking_allowed', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Курение разрешено</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={rideData.comfort_settings.pets_allowed}
                    onChange={(e) => handleComfortSettingsChange('pets_allowed', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Животные разрешены</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={rideData.comfort_settings.air_conditioning}
                    onChange={(e) => handleComfortSettingsChange('air_conditioning', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Кондиционер</span>
                </label>
              </div>

              {/* Сводка поездки */}
              <div className="bg-blue-50 rounded-xl p-4 mt-6">
                <h3 className="font-semibold text-blue-800 mb-3">Сводка поездки</h3>
                <div className="space-y-2 text-sm text-blue-700">
                  <div><strong>Маршрут:</strong> {rideData.from_city} → {rideData.to_city}</div>
                  <div><strong>Дата:</strong> {rideData.departure_date} в {rideData.departure_time}</div>
                  <div><strong>Места:</strong> {rideData.available_seats} пассажир(а)</div>
                  <div><strong>Цена:</strong> {rideData.price_per_seat} сум за место</div>
                  {rideData.car_model && <div><strong>Автомобиль:</strong> {rideData.car_model} ({rideData.car_color})</div>}
                </div>
              </div>
            </CardContent>
          </div>
        );

      default:
        return null;
    }
  };

  // New flow rendering
  if (showAddressSearch) {
    return (
      <div className="min-h-screen bg-white relative">
        <AddressSearchPage
          title={currentAddressType === 'from' ? "Откуда едете?" : "Куда едете?"}
          onAddressSelect={handleAddressSelect}
          onBack={() => setShowAddressSearch(false)}
          placeholder={currentAddressType === 'from' ? "Город отправления" : "Город назначения"}
          previousSelection={currentAddressType === 'to' ? rideData.from_city : undefined}
        />
        <div className="pb-20">
          <DriverBottomNavigation />
        </div>
      </div>
    );
  }

  if (showCalendar) {
    return (
      <FullScreenCalendar
        selectedDate={rideData.departure_date ? new Date(rideData.departure_date) : undefined}
        onDateSelect={handleDateSelect}
        onBack={() => {
          setShowCalendar(false);
          setCurrentAddressType('to');
          setShowAddressSearch(true);
        }}
      />
    );
  }

  if (showTimePicker) {
    return (
      <TimePickerPage
        selectedTime={rideData.departure_time}
        onTimeSelect={handleTimeSelect}
        onBack={() => {
          setShowTimePicker(false);
          setShowCalendar(true);
        }}
      />
    );
  }

  if (showPassengerCount) {
    return (
      <PassengerCountPage
        selectedCount={rideData.available_seats}
        onCountSelect={handlePassengerCountSelect}
        onBack={() => {
          setShowPassengerCount(false);
          setShowTimePicker(true);
        }}
      />
    );
  }

  if (showPriceSetting) {
    return (
      <PriceSettingPage
        selectedPrice={rideData.price_per_seat}
        onPriceSelect={handlePriceSelect}
        onBack={() => {
          setShowPriceSetting(false);
          setShowPassengerCount(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
    </div>
  );
};

export default CreateRideWizard;