
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Car, Clock, MapPin, Users, DollarSign, Route, Check } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useRides } from '@/hooks/useRides';
import { toast } from 'sonner';
import DriverBottomNavigation from '@/components/DriverBottomNavigation';
import { YandexMapProvider } from '@/components/YandexMapProvider';
import LocationStep from '@/components/LocationStep';
import RouteVisualizer from '@/components/RouteVisualizer';

interface RideData {
  fromCoordinates?: [number, number];
  fromAddress?: string;
  toCoordinates?: [number, number];
  toAddress?: string;
  routeData?: any;
  departureDate: string;
  departureTime: string;
  availableSeats: string;
  pricePerSeat: string;
  carModel: string;
  carColor: string;
  description: string;
  duration: string;
}

const CreateRide = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { createRide } = useRides();
  const [currentStep, setCurrentStep] = useState(1);
  const [rideData, setRideData] = useState<RideData>({
    departureDate: '',
    departureTime: '',
    availableSeats: '',
    pricePerSeat: '',
    carModel: '',
    carColor: '',
    description: '',
    duration: ''
  });

  const steps = [
    { number: 1, title: 'Откуда', completed: !!rideData.fromAddress },
    { number: 2, title: 'Куда', completed: !!rideData.toAddress },
    { number: 3, title: 'Маршрут', completed: !!rideData.routeData },
    { number: 4, title: 'Детали', completed: false },
    { number: 5, title: 'Публикация', completed: false }
  ];

  const handleFromLocationSelect = (coordinates: [number, number], address: string) => {
    setRideData(prev => ({
      ...prev,
      fromCoordinates: coordinates,
      fromAddress: address
    }));
  };

  const handleToLocationSelect = (coordinates: [number, number], address: string) => {
    setRideData(prev => ({
      ...prev,
      toCoordinates: coordinates,
      toAddress: address
    }));
  };

  const handleRouteCalculated = (routeData: any) => {
    setRideData(prev => ({
      ...prev,
      routeData
    }));
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('Необходимо войти в систему');
      return;
    }

    if (!rideData.fromCoordinates || !rideData.toCoordinates) {
      toast.error('Выберите точки отправления и назначения');
      return;
    }

    try {
      await createRide({
        driver_id: user.id,
        from_city: rideData.fromAddress?.split(',')[0] || 'Неизвестно',
        to_city: rideData.toAddress?.split(',')[0] || 'Неизвестно',
        pickup_address: rideData.fromAddress,
        dropoff_address: rideData.toAddress,
        pickup_latitude: rideData.fromCoordinates[0],
        pickup_longitude: rideData.fromCoordinates[1],
        dropoff_latitude: rideData.toCoordinates[0],
        dropoff_longitude: rideData.toCoordinates[1],
        route_data: rideData.routeData,
        departure_date: rideData.departureDate,
        departure_time: rideData.departureTime,
        available_seats: parseInt(rideData.availableSeats),
        price_per_seat: parseFloat(rideData.pricePerSeat),
        car_model: rideData.carModel,
        car_color: rideData.carColor,
        description: rideData.description,
        duration_hours: parseInt(rideData.duration),
        status: 'active'
      });
      
      toast.success('Поездка успешно создана!');
      navigate('/driver-home');
    } catch (error) {
      console.error('Error creating ride:', error);
      toast.error('Ошибка при создании поездки');
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            currentStep === step.number 
              ? 'bg-blue-600 text-white' 
              : step.completed 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-600'
          }`}>
            {step.completed ? <Check className="h-4 w-4" /> : step.number}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 ${
              step.completed ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <LocationStep
            title="Откуда поедете?"
            subtitle="Выберите точку посадки пассажиров"
            onLocationSelect={handleFromLocationSelect}
            onNext={() => setCurrentStep(2)}
            selectedLocation={rideData.fromCoordinates}
            selectedAddress={rideData.fromAddress}
            icon={<MapPin className="h-6 w-6 mr-3 text-green-600" />}
          />
        );

      case 2:
        return (
          <LocationStep
            title="Куда поедете?"
            subtitle="Выберите точку назначения"
            onLocationSelect={handleToLocationSelect}
            onNext={() => setCurrentStep(3)}
            selectedLocation={rideData.toCoordinates}
            selectedAddress={rideData.toAddress}
            icon={<MapPin className="h-6 w-6 mr-3 text-red-600" />}
          />
        );

      case 3:
        return (
          <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-slate-800 flex items-center justify-center">
                <Route className="h-6 w-6 mr-3 text-blue-600" />
                Проверьте маршрут
              </CardTitle>
              <p className="text-slate-600 mt-1">Убедитесь, что маршрут построен правильно</p>
            </CardHeader>
            
            <CardContent className="p-6">
              {rideData.fromCoordinates && rideData.toCoordinates && (
                <RouteVisualizer
                  startPoint={rideData.fromCoordinates}
                  endPoint={rideData.toCoordinates}
                  startAddress={rideData.fromAddress || ''}
                  endAddress={rideData.toAddress || ''}
                  onRouteCalculated={handleRouteCalculated}
                />
              )}
              
              <div className="flex space-x-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 h-12 rounded-xl"
                >
                  Назад
                </Button>
                <Button
                  onClick={() => setCurrentStep(4)}
                  disabled={!rideData.routeData}
                  className="flex-1 h-12 bg-gradient-primary rounded-xl"
                >
                  Продолжить
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-800 flex items-center justify-center">
                <Car className="h-6 w-6 mr-3 text-yoldosh-primary" />
                Детали поездки
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleDetailsSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Дата отправления</label>
                    <input
                      type="date"
                      value={rideData.departureDate}
                      onChange={(e) => setRideData(prev => ({ ...prev, departureDate: e.target.value }))}
                      className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Время отправления</label>
                    <input
                      type="time"
                      value={rideData.departureTime}
                      onChange={(e) => setRideData(prev => ({ ...prev, departureTime: e.target.value }))}
                      className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Количество мест</label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={rideData.availableSeats}
                      onChange={(e) => setRideData(prev => ({ ...prev, availableSeats: e.target.value }))}
                      className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Цена за место</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={rideData.pricePerSeat}
                      onChange={(e) => setRideData(prev => ({ ...prev, pricePerSeat: e.target.value }))}
                      className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Модель автомобиля</label>
                    <input
                      type="text"
                      value={rideData.carModel}
                      onChange={(e) => setRideData(prev => ({ ...prev, carModel: e.target.value }))}
                      className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      placeholder="Например: Toyota Camry"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Цвет автомобиля</label>
                    <input
                      type="text"
                      value={rideData.carColor}
                      onChange={(e) => setRideData(prev => ({ ...prev, carColor: e.target.value }))}
                      className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      placeholder="Например: Белый"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Длительность поездки (в часах)</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={rideData.duration}
                    onChange={(e) => setRideData(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Описание (необязательно)</label>
                  <textarea
                    value={rideData.description}
                    onChange={(e) => setRideData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="Дополнительная информация о поездке..."
                  />
                </div>
                
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 h-12 rounded-xl"
                  >
                    Назад
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 bg-gradient-primary rounded-xl"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Создать поездку
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <YandexMapProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => {
                  if (currentStep > 1) {
                    setCurrentStep(currentStep - 1);
                  } else {
                    navigate('/driver-home');
                  }
                }}
                className="rounded-xl hover:bg-yoldosh-primary/10 p-3"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Назад
              </Button>
              <div className="text-center">
                <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Создать поездку
                </h1>
                <p className="text-slate-600 mt-1">Шаг {currentStep} из {steps.length}</p>
              </div>
              <div className="w-16"></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 py-8">
          {renderStepIndicator()}
          {renderCurrentStep()}
        </div>

        <DriverBottomNavigation />
      </div>
    </YandexMapProvider>
  );
};

export default CreateRide;
