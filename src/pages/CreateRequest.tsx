
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, MapPin, Calendar, Users, DollarSign, FileText, Check } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useRideRequests } from '@/hooks/useRideRequests';
import { toast } from 'sonner';
import BottomNavigation from '@/components/BottomNavigation';
import { YandexMapProvider } from '@/components/YandexMapProvider';
import LocationStep from '@/components/LocationStep';

interface RequestData {
  fromCoordinates?: [number, number];
  fromAddress?: string;
  toCoordinates?: [number, number];
  toAddress?: string;
  preferredDate: string;
  passengersCount: string;
  maxPrice: string;
  description: string;
}

const CreateRequest = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { createRequest } = useRideRequests();
  const [currentStep, setCurrentStep] = useState(1);
  const [requestData, setRequestData] = useState<RequestData>({
    preferredDate: '',
    passengersCount: '1',
    maxPrice: '',
    description: ''
  });

  const steps = [
    { number: 1, title: 'Откуда', completed: !!requestData.fromAddress },
    { number: 2, title: 'Куда', completed: !!requestData.toAddress },
    { number: 3, title: 'Детали', completed: false }
  ];

  const handleFromLocationSelect = (coordinates: [number, number], address: string) => {
    setRequestData(prev => ({
      ...prev,
      fromCoordinates: coordinates,
      fromAddress: address
    }));
  };

  const handleToLocationSelect = (coordinates: [number, number], address: string) => {
    setRequestData(prev => ({
      ...prev,
      toCoordinates: coordinates,
      toAddress: address
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('Необходимо войти в систему');
      return;
    }

    if (!requestData.fromCoordinates || !requestData.toCoordinates) {
      toast.error('Выберите точки отправления и назначения');
      return;
    }

    try {
      await createRequest({
        passenger_id: user.id,
        from_city: requestData.fromAddress?.split(',')[0] || 'Неизвестно',
        to_city: requestData.toAddress?.split(',')[0] || 'Неизвестно',
        pickup_address: requestData.fromAddress,
        dropoff_address: requestData.toAddress,
        pickup_latitude: requestData.fromCoordinates[0],
        pickup_longitude: requestData.fromCoordinates[1],
        dropoff_latitude: requestData.toCoordinates[0],
        dropoff_longitude: requestData.toCoordinates[1],
        preferred_date: requestData.preferredDate,
        passengers_count: parseInt(requestData.passengersCount),
        max_price_per_seat: requestData.maxPrice ? parseFloat(requestData.maxPrice) : null,
        description: requestData.description,
        status: 'active'
      });
      
      toast.success('Заявка успешно создана!');
      navigate('/passenger');
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Ошибка при создании заявки');
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            currentStep === step.number 
              ? 'bg-purple-600 text-white' 
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
            subtitle="Выберите точку посадки"
            onLocationSelect={handleFromLocationSelect}
            onNext={() => setCurrentStep(2)}
            selectedLocation={requestData.fromCoordinates}
            selectedAddress={requestData.fromAddress}
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
            selectedLocation={requestData.toCoordinates}
            selectedAddress={requestData.toAddress}
            icon={<MapPin className="h-6 w-6 mr-3 text-red-600" />}
          />
        );

      case 3:
        return (
          <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-800 flex items-center justify-center">
                <FileText className="h-6 w-6 mr-3 text-yoldosh-primary" />
                Детали заявки
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Отображение выбранного маршрута */}
                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                  <h3 className="font-semibold text-gray-800">Выбранный маршрут</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-sm text-gray-700">{requestData.fromAddress}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <span className="text-sm text-gray-700">{requestData.toAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Предпочитаемая дата */}
                <div>
                  <label htmlFor="preferredDate" className="block text-sm font-medium text-slate-700 mb-2">
                    Предпочитаемая дата
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="date"
                      id="preferredDate"
                      value={requestData.preferredDate}
                      onChange={(e) => setRequestData(prev => ({ ...prev, preferredDate: e.target.value }))}
                      className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-slate-200 focus:border-yoldosh-primary focus:ring-4 focus:ring-yoldosh-primary/20 bg-white/80 backdrop-blur-sm transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                {/* Количество пассажиров */}
                <div>
                  <label htmlFor="passengersCount" className="block text-sm font-medium text-slate-700 mb-2">
                    Количество пассажиров
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="number"
                      id="passengersCount"
                      min="1"
                      max="8"
                      value={requestData.passengersCount}
                      onChange={(e) => setRequestData(prev => ({ ...prev, passengersCount: e.target.value }))}
                      className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-slate-200 focus:border-yoldosh-primary focus:ring-4 focus:ring-yoldosh-primary/20 bg-white/80 backdrop-blur-sm transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                {/* Максимальная цена */}
                <div>
                  <label htmlFor="maxPrice" className="block text-sm font-medium text-slate-700 mb-2">
                    Максимальная цена за место (необязательно)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="number"
                      id="maxPrice"
                      min="0"
                      step="0.01"
                      value={requestData.maxPrice}
                      onChange={(e) => setRequestData(prev => ({ ...prev, maxPrice: e.target.value }))}
                      className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-slate-200 focus:border-yoldosh-primary focus:ring-4 focus:ring-yoldosh-primary/20 bg-white/80 backdrop-blur-sm transition-all duration-300"
                      placeholder="Укажите максимальную цену"
                    />
                  </div>
                </div>

                {/* Описание */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                    Описание (необязательно)
                  </label>
                  <textarea
                    id="description"
                    value={requestData.description}
                    onChange={(e) => setRequestData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full pl-4 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-yoldosh-primary focus:ring-4 focus:ring-yoldosh-primary/20 bg-white/80 backdrop-blur-sm transition-all duration-300"
                    placeholder="Дополнительная информация о поездке..."
                  />
                </div>
                
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 h-12 rounded-xl"
                  >
                    Назад
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-xl"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Создать заявку
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 pb-20">
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
                    navigate('/passenger');
                  }
                }}
                className="rounded-xl hover:bg-yoldosh-primary/10 p-3"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Назад
              </Button>
              <div className="text-center">
                <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Создать заявку
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

        <BottomNavigation />
      </div>
    </YandexMapProvider>
  );
};

export default CreateRequest;
