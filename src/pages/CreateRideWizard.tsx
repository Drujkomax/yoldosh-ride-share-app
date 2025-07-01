import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Check, Car, Clock, MapPin, Users, DollarSign, Settings } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useRides } from '@/hooks/useRides';
import { toast } from 'sonner';
import DriverBottomNavigation from '@/components/DriverBottomNavigation';
import CitySelect from '@/components/CitySelect';
import GoogleMapPicker from '@/components/GoogleMapPicker';
import RouteCalculator from '@/components/RouteCalculator';
import GoogleMapsApiKeyInput from '@/components/GoogleMapsApiKeyInput';

interface RideWizardData {
  // Города
  fromCity: string;
  toCity: string;
  
  // Точные координаты
  fromCoordinates?: [number, number];
  fromAddress?: string;
  toCoordinates?: [number, number];
  toAddress?: string;
  
  // Места посадки/высадки пассажиров
  pickupCoordinates?: [number, number];
  pickupAddress?: string;
  pickupInstructions?: string;
  dropoffCoordinates?: [number, number];
  dropoffAddress?: string;
  dropoffInstructions?: string;
  
  // Маршрут
  selectedRoute?: {
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
  };
  
  // Детали поездки
  departureDate: string;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  departureFlexibility: number;
  carModel: string;
  carColor: string;
  description: string;
  
  // Настройки комфорта
  comfortSettings: {
    music_allowed: boolean;
    smoking_allowed: boolean;
    pets_allowed: boolean;
    air_conditioning: boolean;
  };
}

const CreateRideWizard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { createRide, isCreating } = useRides();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<RideWizardData>({
    fromCity: '',
    toCity: '',
    departureDate: '',
    departureTime: '',
    availableSeats: 4,
    pricePerSeat: 0,
    departureFlexibility: 0,
    carModel: '',
    carColor: '',
    description: '',
    comfortSettings: {
      music_allowed: true,
      smoking_allowed: false,
      pets_allowed: false,
      air_conditioning: true,
    }
  });

  const steps = [
    { number: 1, title: 'Город отправления', icon: MapPin },
    { number: 2, title: 'Точка отправления', icon: MapPin },
    { number: 3, title: 'Место посадки', icon: Users },
    { number: 4, title: 'Город назначения', icon: MapPin },
    { number: 5, title: 'Точка назначения', icon: MapPin },
    { number: 6, title: 'Место высадки', icon: Users },
    { number: 7, title: 'Маршрут', icon: MapPin },
    { number: 8, title: 'Детали поездки', icon: Settings },
  ];

  const updateWizardData = (updates: Partial<RideWizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/driver-home');
    }
  };

  const handleFinish = async () => {
    if (!user?.id) {
      toast.error('Необходимо войти в систему');
      return;
    }

    // Валидация данных
    if (!wizardData.fromCity || !wizardData.toCity) {
      toast.error('Выберите города отправления и назначения');
      return;
    }

    if (!wizardData.fromCoordinates || !wizardData.toCoordinates) {
      toast.error('Выберите точные координаты отправления и назначения');
      return;
    }

    if (!wizardData.departureDate || !wizardData.departureTime) {
      toast.error('Укажите дату и время отправления');
      return;
    }

    if (wizardData.pricePerSeat <= 0) {
      toast.error('Укажите цену за место');
      return;
    }

    try {
      await createRide({
        driver_id: user.id,
        from_city: wizardData.fromCity,
        to_city: wizardData.toCity,
        pickup_address: wizardData.fromAddress,
        dropoff_address: wizardData.toAddress,
        pickup_latitude: wizardData.fromCoordinates[0],
        pickup_longitude: wizardData.fromCoordinates[1],
        dropoff_latitude: wizardData.toCoordinates[0],
        dropoff_longitude: wizardData.toCoordinates[1],
        precise_pickup_latitude: wizardData.pickupCoordinates?.[0],
        precise_pickup_longitude: wizardData.pickupCoordinates?.[1],
        precise_dropoff_latitude: wizardData.dropoffCoordinates?.[0],
        precise_dropoff_longitude: wizardData.dropoffCoordinates?.[1],
        passenger_pickup_instructions: wizardData.pickupInstructions,
        passenger_dropoff_instructions: wizardData.dropoffInstructions,
        route_data: wizardData.selectedRoute,
        route_polyline: wizardData.selectedRoute?.polyline,
        estimated_duration_minutes: wizardData.selectedRoute?.durationValue ? Math.round(wizardData.selectedRoute.durationValue / 60) : undefined,
        estimated_distance_km: wizardData.selectedRoute?.distanceValue ? Math.round(wizardData.selectedRoute.distanceValue / 1000) : undefined,
        toll_info: wizardData.selectedRoute?.tollInfo,
        departure_date: wizardData.departureDate,
        departure_time: wizardData.departureTime,
        departure_flexibility: wizardData.departureFlexibility,
        available_seats: wizardData.availableSeats,
        price_per_seat: wizardData.pricePerSeat,
        car_model: wizardData.carModel,
        car_color: wizardData.carColor,
        description: wizardData.description,
        comfort_settings: wizardData.comfortSettings,
        status: 'active'
      });
      
      toast.success('Поездка успешно создана!');
      navigate('/driver-home');
    } catch (error) {
      console.error('Error creating ride:', error);
      toast.error('Ошибка при создании поездки');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardTitle className="text-2xl font-bold flex items-center">
                <MapPin className="h-7 w-7 mr-3" />
                Откуда поедете?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <GoogleMapsApiKeyInput />
              <CitySelect
                value={wizardData.fromCity}
                onValueChange={(value) => updateWizardData({ fromCity: value })}
                placeholder="Выберите город отправления"
              />
              <Button
                onClick={handleNext}
                disabled={!wizardData.fromCity}
                className="w-full mt-6 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl"
              >
                Продолжить
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <GoogleMapPicker
            title="Выберите точку отправления"
            placeholder="Поиск адреса отправления..."
            initialLocation={wizardData.fromCoordinates}
            initialAddress={wizardData.fromAddress}
            onLocationSelect={(coordinates, address) => {
              updateWizardData({
                fromCoordinates: coordinates,
                fromAddress: address
              });
              handleNext();
            }}
          />
        );

      case 3:
        return (
          <GoogleMapPicker
            title="Где будете забирать пассажиров?"
            placeholder="Поиск места посадки..."
            initialLocation={wizardData.pickupCoordinates || wizardData.fromCoordinates}
            initialAddress={wizardData.pickupAddress}
            onLocationSelect={(coordinates, address) => {
              updateWizardData({
                pickupCoordinates: coordinates,
                pickupAddress: address
              });
              handleNext();
            }}
          />
        );

      case 4:
        return (
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardTitle className="text-2xl font-bold flex items-center">
                <MapPin className="h-7 w-7 mr-3" />
                Куда поедете?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <CitySelect
                value={wizardData.toCity}
                onValueChange={(value) => updateWizardData({ toCity: value })}
                placeholder="Выберите город назначения"
              />
              <Button
                onClick={handleNext}
                disabled={!wizardData.toCity}
                className="w-full mt-6 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl"
              >
                Продолжить
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <GoogleMapPicker
            title="Выберите точку назначения"
            placeholder="Поиск адреса назначения..."
            initialLocation={wizardData.toCoordinates}
            initialAddress={wizardData.toAddress}
            onLocationSelect={(coordinates, address) => {
              updateWizardData({
                toCoordinates: coordinates,
                toAddress: address
              });
              handleNext();
            }}
          />
        );

      case 6:
        return (
          <GoogleMapPicker
            title="Где будете высаживать пассажиров?"
            placeholder="Поиск места высадки..."
            initialLocation={wizardData.dropoffCoordinates || wizardData.toCoordinates}
            initialAddress={wizardData.dropoffAddress}
            onLocationSelect={(coordinates, address) => {
              updateWizardData({
                dropoffCoordinates: coordinates,
                dropoffAddress: address
              });
              handleNext();
            }}
          />
        );

      case 7:
        if (!wizardData.fromCoordinates || !wizardData.toCoordinates) {
          return (
            <div className="text-center p-8">
              <p>Ошибка: не выбраны координаты маршрута</p>
            </div>
          );
        }
        
        return (
          <RouteCalculator
            startPoint={wizardData.fromCoordinates}
            endPoint={wizardData.toCoordinates}
            startAddress={wizardData.fromAddress || ''}
            endAddress={wizardData.toAddress || ''}
            onRouteSelect={(route) => {
              updateWizardData({ selectedRoute: route });
              handleNext();
            }}
          />
        );

      case 8:
        return (
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardTitle className="text-2xl font-bold flex items-center">
                <Settings className="h-7 w-7 mr-3" />
                Детали поездки
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {/* Дата и время */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата отправления
                  </label>
                  <Input
                    type="date"
                    value={wizardData.departureDate}
                    onChange={(e) => updateWizardData({ departureDate: e.target.value })}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Время отправления
                  </label>
                  <Input
                    type="time"
                    value={wizardData.departureTime}
                    onChange={(e) => updateWizardData({ departureTime: e.target.value })}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Места и цена */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Количество мест
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="8"
                    value={wizardData.availableSeats}
                    onChange={(e) => updateWizardData({ availableSeats: parseInt(e.target.value) || 1 })}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Цена за место (сум)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="1000"
                    value={wizardData.pricePerSeat}
                    onChange={(e) => updateWizardData({ pricePerSeat: parseInt(e.target.value) || 0 })}
                    className="h-12 rounded-xl"
                    placeholder="50000"
                    required
                  />
                </div>
              </div>

              {/* Автомобиль */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Модель автомобиля
                  </label>
                  <Input
                    type="text"
                    value={wizardData.carModel}
                    onChange={(e) => updateWizardData({ carModel: e.target.value })}
                    className="h-12 rounded-xl"
                    placeholder="Toyota Camry"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Цвет автомобиля
                  </label>
                  <Input
                    type="text"
                    value={wizardData.carColor}
                    onChange={(e) => updateWizardData({ carColor: e.target.value })}
                    className="h-12 rounded-xl"
                    placeholder="Белый"
                  />
                </div>
              </div>

              {/* Описание */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание поездки
                </label>
                <Textarea
                  value={wizardData.description}
                  onChange={(e) => updateWizardData({ description: e.target.value })}
                  className="rounded-xl"
                  placeholder="Расскажите о поездке..."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleFinish}
                disabled={isCreating || !wizardData.departureDate || !wizardData.departureTime || wizardData.pricePerSeat <= 0}
                className="w-full h-14 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold text-lg rounded-xl"
              >
                {isCreating ? 'Создание...' : 'Создать поездку'}
                <Check className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-6 overflow-x-auto px-4">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className={`flex flex-col items-center min-w-0 ${index < steps.length - 1 ? 'flex-shrink-0' : ''}`}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold transition-all duration-300 ${
              currentStep === step.number 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110' 
                : currentStep > step.number 
                  ? 'bg-green-500 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-600'
            }`}>
              {currentStep > step.number ? <Check className="h-4 w-4" /> : step.number}
            </div>
            <span className={`text-xs mt-1 text-center ${
              currentStep === step.number ? 'text-blue-600 font-semibold' : 'text-gray-500'
            }`}>
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 rounded-full transition-all duration-300 flex-shrink-0 ${
              currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="rounded-2xl hover:bg-blue-50 p-3 text-gray-700 font-semibold"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад
            </Button>
            <div className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Создать поездку
              </h1>
              <p className="text-gray-600 text-sm">Шаг {currentStep} из {steps.length}</p>
            </div>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="py-6">
        {renderStepIndicator()}
      </div>

      {/* Content */}
      <div className="px-4 pb-8">
        {renderStepContent()}
      </div>

      <DriverBottomNavigation />
    </div>
  );
};

export default CreateRideWizard;
