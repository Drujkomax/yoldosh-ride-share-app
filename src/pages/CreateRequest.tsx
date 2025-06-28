import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, MapPin, Calendar, Users, DollarSign, FileText, Check } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useRideRequests } from '@/hooks/useRideRequests';
import { toast } from 'sonner';
import BottomNavigation from '@/components/BottomNavigation';
import { MapProvider2Gis } from '@/components/2GisMapProvider';
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
    <div className="flex items-center justify-center space-x-3 mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className={`flex items-center justify-center w-12 h-12 rounded-full text-sm font-bold transition-all duration-300 ${
            currentStep === step.number 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-110' 
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
            subtitle="Выберите точку посадки"
            onLocationSelect={handleFromLocationSelect}
            onNext={() => setCurrentStep(2)}
            selectedLocation={requestData.fromCoordinates}
            selectedAddress={requestData.fromAddress}
            icon={<MapPin className="h-8 w-8 mr-3 text-green-500" />}
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
            icon={<MapPin className="h-8 w-8 mr-3 text-red-500" />}
          />
        );

      case 3:
        return (
          <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4">
            <Card className="max-w-3xl mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="text-center pb-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardTitle className="text-3xl font-bold flex items-center justify-center mb-2">
                  <FileText className="h-8 w-8 mr-3" />
                  Детали заявки
                </CardTitle>
                <p className="text-purple-100 text-lg">Заполните информацию о вашей поездке</p>
              </CardHeader>
              
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Отображение выбранного маршрута */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-100 shadow-sm">
                    <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center">
                      <MapPin className="h-6 w-6 mr-2 text-purple-600" />
                      Выбранный маршрут
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4 p-4 bg-white/80 rounded-xl shadow-sm">
                        <div className="w-4 h-4 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 mb-1">Откуда</div>
                          <div className="text-gray-600">{requestData.fromAddress}</div>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <div className="w-px h-8 bg-gradient-to-b from-green-500 to-red-500"></div>
                      </div>
                      <div className="flex items-start space-x-4 p-4 bg-white/80 rounded-xl shadow-sm">
                        <div className="w-4 h-4 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 mb-1">Куда</div>
                          <div className="text-gray-600">{requestData.toAddress}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Остальные поля формы */}
                  <div className="space-y-3">
                    <label htmlFor="preferredDate" className="flex items-center text-lg font-semibold text-gray-800">
                      <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                      Предпочитаемая дата
                    </label>
                    <input
                      type="date"
                      id="preferredDate"
                      value={requestData.preferredDate}
                      onChange={(e) => setRequestData(prev => ({ ...prev, preferredDate: e.target.value }))}
                      className="w-full h-14 px-4 text-lg font-medium bg-white border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="passengersCount" className="flex items-center text-lg font-semibold text-gray-800">
                      <Users className="h-5 w-5 mr-2 text-purple-600" />
                      Количество пассажиров
                    </label>
                    <input
                      type="number"
                      id="passengersCount"
                      min="1"
                      max="8"
                      value={requestData.passengersCount}
                      onChange={(e) => setRequestData(prev => ({ ...prev, passengersCount: e.target.value }))}
                      className="w-full h-14 px-4 text-lg font-medium bg-white border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="maxPrice" className="flex items-center text-lg font-semibold text-gray-800">
                      <DollarSign className="h-5 w-5 mr-2 text-purple-600" />
                      Максимальная цена за место (необязательно)
                    </label>
                    <input
                      type="number"
                      id="maxPrice"
                      min="0"
                      step="1000"
                      value={requestData.maxPrice}
                      onChange={(e) => setRequestData(prev => ({ ...prev, maxPrice: e.target.value }))}
                      className="w-full h-14 px-4 text-lg font-medium bg-white border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
                      placeholder="Укажите максимальную цену (сум)"
                    />
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="description" className="text-lg font-semibold text-gray-800 block">
                      Описание (необязательно)
                    </label>
                    <textarea
                      id="description"
                      value={requestData.description}
                      onChange={(e) => setRequestData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-4 text-lg font-medium bg-white border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 resize-none"
                      placeholder="Дополнительная информация о поездке..."
                    />
                  </div>
                  
                  <div className="flex space-x-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 h-16 rounded-2xl border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold text-lg"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Назад
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 h-16 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Plus className="h-6 w-6 mr-2" />
                      Создать заявку
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
    <MapProvider2Gis>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
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
                    navigate('/passenger');
                  }
                }}
                className="rounded-2xl hover:bg-purple-50 p-4 text-gray-700 font-semibold"
              >
                <ArrowLeft className="h-6 w-6 mr-2" />
                Назад
              </Button>
              <div className="text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Создать заявку
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

        <BottomNavigation />
      </div>
    </MapProvider2Gis>
  );
};

export default CreateRequest;
