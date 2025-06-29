
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Car, Clock, MapPin, Users, DollarSign, Route, Check, Calendar } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useRides } from '@/hooks/useRides';
import { toast } from 'sonner';
import DriverBottomNavigation from '@/components/DriverBottomNavigation';
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
    availableSeats: '4',
    pricePerSeat: '',
    carModel: '',
    carColor: '',
    description: '',
    duration: '2'
  });

  const steps = [
    { number: 1, title: 'Откуда', completed: !!rideData.fromAddress },
    { number: 2, title: 'Куда', completed: !!rideData.toAddress },
    { number: 3, title: 'Маршрут', completed: !!rideData.routeData },
    { number: 4, title: 'Детали', completed: false }
  ];

  const handleFromLocationSelect = (coordinates: [number, number], address: string) => {
    setRideData(prev => ({
      ...prev,
      fromCoordinates: coordinates,
      fromAddress: address
    }));
    setCurrentStep(2);
  };

  const handleToLocationSelect = (coordinates: [number, number], address: string) => {
    setRideData(prev => ({
      ...prev,
      toCoordinates: coordinates,
      toAddress: address
    }));
    setCurrentStep(3);
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
    <div className="flex items-center justify-center space-x-3 mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className={`flex items-center justify-center w-12 h-12 rounded-full text-sm font-bold transition-all duration-300 ${
            currentStep === step.number 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110' 
              : step.completed 
                ? 'bg-green-500 text-white shadow-md' 
                : 'bg-gray-200 text-gray-600'
          }`}>
            {step.completed ? <Check className="h-5 w-5" /> : step.number}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-12 h-1 rounded-full transition-all duration-300 ${
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
            onLocationSelect={handleFromLocationSelect}
            selectedLocation={rideData.fromCoordinates}
            selectedAddress={rideData.fromAddress}
          />
        );

      case 2:
        return (
          <LocationStep
            title="Куда поедете?"
            onLocationSelect={handleToLocationSelect}
            selectedLocation={rideData.toCoordinates}
            selectedAddress={rideData.toAddress}
          />
        );

      case 3:
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
            <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="text-center pb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardTitle className="text-3xl font-bold flex items-center justify-center mb-2">
                  <Route className="h-8 w-8 mr-3" />
                  Проверьте маршрут
                </CardTitle>
                <p className="text-blue-100 text-lg">Убедитесь, что маршрут построен правильно</p>
              </CardHeader>
              
              <CardContent className="p-8">
                {rideData.fromCoordinates && rideData.toCoordinates && (
                  <RouteVisualizer
                    startPoint={rideData.fromCoordinates}
                    endPoint={rideData.toCoordinates}
                    startAddress={rideData.fromAddress || ''}
                    endAddress={rideData.toAddress || ''}
                    onRouteCalculated={handleRouteCalculated}
                  />
                )}
                
                <div className="flex space-x-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 h-14 rounded-2xl border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold text-lg"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Назад
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(4)}
                    disabled={!rideData.routeData}
                    className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    Продолжить
                    <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
            <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="text-center pb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardTitle className="text-3xl font-bold flex items-center justify-center mb-2">
                  <Car className="h-8 w-8 mr-3" />
                  Детали поездки
                </CardTitle>
                <p className="text-blue-100 text-lg">Заполните информацию о поездке</p>
              </CardHeader>
              
              <CardContent className="p-8">
                <form onSubmit={handleDetailsSubmit} className="space-y-8">
                  {/* Дата и время */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="flex items-center text-lg font-semibold text-gray-800">
                        <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                        Дата отправления
                      </label>
                      <input
                        type="date"
                        value={rideData.departureDate}
                        onChange={(e) => setRideData(prev => ({ ...prev, departureDate: e.target.value }))}
                        className="w-full h-14 px-4 text-lg font-medium bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center text-lg font-semibold text-gray-800">
                        <Clock className="h-5 w-5 mr-2 text-blue-600" />
                        Время отправления
                      </label>
                      <input
                        type="time"
                        value={rideData.departureTime}
                        onChange={(e) => setRideData(prev => ({ ...prev, departureTime: e.target.value }))}
                        className="w-full h-14 px-4 text-lg font-medium bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  {/* Места и цена */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="flex items-center text-lg font-semibold text-gray-800">
                        <Users className="h-5 w-5 mr-2 text-blue-600" />
                        Количество мест
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={rideData.availableSeats}
                        onChange={(e) => setRideData(prev => ({ ...prev, availableSeats: e.target.value }))}
                        className="w-full h-14 px-4 text-lg font-medium bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center text-lg font-semibold text-gray-800">
                        <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                        Цена за место (сум)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={rideData.pricePerSeat}
                        onChange={(e) => setRideData(prev => ({ ...prev, pricePerSeat: e.target.value }))}
                        className="w-full h-14 px-4 text-lg font-medium bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                        placeholder="50000"
                        required
                      />
                    </div>
                  </div>

                  {/* Автомобиль */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="flex items-center text-lg font-semibold text-gray-800">
                        <Car className="h-5 w-5 mr-2 text-blue-600" />
                        Модель автомобиля
                      </label>
                      <input
                        type="text"
                        value={rideData.carModel}
                        onChange={(e) => setRideData(prev => ({ ...prev, carModel: e.target.value }))}
                        className="w-full h-14 px-4 text-lg font-medium bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                        placeholder="Toyota Camry"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-lg font-semibold text-gray-800 block">
                        Цвет автомобиля
                      </label>
                      <input
                        type="text"
                        value={rideData.carColor}
                        onChange={(e) => setRideData(prev => ({ ...prev, carColor: e.target.value }))}
                        className="w-full h-14 px-4 text-lg font-medium bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                        placeholder="Белый"
                      />
                    </div>
                  </div>

                  {/* Продолжительность */}
                  <div className="space-y-3">
                    <label className="flex items-center text-lg font-semibold text-gray-800">
                      <Clock className="h-5 w-5 mr-2 text-blue-600" />
                      Длительность поездки (в часах)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={rideData.duration}
                      onChange={(e) => setRideData(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full h-14 px-4 text-lg font-medium bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                      required
                    />
                  </div>

                  {/* Описание */}
                  <div className="space-y-3">
                    <label className="text-lg font-semibold text-gray-800 block">
                      Описание (необязательно)
                    </label>
                    <textarea
                      value={rideData.description}
                      onChange={(e) => setRideData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-4 text-lg font-medium bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 resize-none"
                      placeholder="Дополнительная информация о поездке..."
                    />
                  </div>
                  
                  <div className="flex space-x-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(3)}
                      className="flex-1 h-16 rounded-2xl border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold text-lg"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Назад
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Plus className="h-6 w-6 mr-2" />
                      Создать поездку
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-40">
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
              className="rounded-2xl hover:bg-blue-50 p-4 text-gray-700 font-semibold"
            >
              <ArrowLeft className="h-6 w-6 mr-2" />
              Назад
            </Button>
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Создать поездку
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Шаг {currentStep} из {steps.length}</p>
            </div>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        {currentStep < 3 ? (
          renderCurrentStep()
        ) : (
          <>
            <div className="container mx-auto px-6 pb-8">
              {renderStepIndicator()}
            </div>
            {renderCurrentStep()}
          </>
        )}
      </div>

      <DriverBottomNavigation />
    </div>
  );
};

export default CreateRide;
