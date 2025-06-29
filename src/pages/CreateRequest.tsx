
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useRideRequests } from '@/hooks/useRideRequests';
import { toast } from 'sonner';
import LocationStep from '@/components/LocationStep';

interface RequestData {
  fromCoordinates?: [number, number];
  fromAddress?: string;
  toCoordinates?: [number, number];
  toAddress?: string;
}

const CreateRequest = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { createRequest } = useRideRequests();
  const [currentStep, setCurrentStep] = useState(1);
  const [requestData, setRequestData] = useState<RequestData>({});

  const handleFromLocationSelect = (coordinates: [number, number], address: string) => {
    setRequestData(prev => ({
      ...prev,
      fromCoordinates: coordinates,
      fromAddress: address
    }));
    // Автоматически переходим к следующему шагу
    setCurrentStep(2);
  };

  const handleToLocationSelect = (coordinates: [number, number], address: string) => {
    setRequestData(prev => ({
      ...prev,
      toCoordinates: coordinates,
      toAddress: address
    }));
    
    // Создаем заявку автоматически после выбора обеих локаций
    handleSubmit(coordinates, address);
  };

  const handleSubmit = async (toCoordinates: [number, number], toAddress: string) => {
    if (!user?.id) {
      toast.error('Необходимо войти в систему');
      return;
    }

    if (!requestData.fromCoordinates || !toCoordinates) {
      toast.error('Выберите точки отправления и назначения');
      return;
    }

    try {
      await createRequest({
        passenger_id: user.id,
        from_city: requestData.fromAddress?.split(',')[0] || 'Неизвестно',
        to_city: toAddress?.split(',')[0] || 'Неизвестно',
        pickup_address: requestData.fromAddress,
        dropoff_address: toAddress,
        pickup_latitude: requestData.fromCoordinates[0],
        pickup_longitude: requestData.fromCoordinates[1],
        dropoff_latitude: toCoordinates[0],
        dropoff_longitude: toCoordinates[1],
        preferred_date: new Date().toISOString().split('T')[0], // Сегодняшняя дата по умолчанию
        passengers_count: 1,
        max_price_per_seat: null,
        description: '',
        status: 'active'
      });
      
      toast.success('Заявка успешно создана!');
      navigate('/passenger');
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Ошибка при создании заявки');
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <LocationStep
            title="Откуда едете?"
            onLocationSelect={handleFromLocationSelect}
            selectedLocation={requestData.fromCoordinates}
            selectedAddress={requestData.fromAddress}
          />
        );

      case 2:
        return (
          <LocationStep
            title="Куда едете?"
            onLocationSelect={handleToLocationSelect}
            selectedLocation={requestData.toCoordinates}
            selectedAddress={requestData.toAddress}
          />
        );

      default:
        return null;
    }
  };

  return renderCurrentStep();
};

export default CreateRequest;
