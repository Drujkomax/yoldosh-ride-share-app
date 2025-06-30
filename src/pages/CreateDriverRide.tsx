
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useRides } from '@/hooks/useRides';
import { toast } from 'sonner';
import LocationStep from '@/components/LocationStep';
import BottomNavigation from '@/components/BottomNavigation';

interface RideData {
  fromCoordinates?: [number, number];
  fromAddress?: string;
  toCoordinates?: [number, number];
  toAddress?: string;
}

const CreateDriverRide = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { createRide } = useRides();
  const [currentStep, setCurrentStep] = useState(1);
  const [rideData, setRideData] = useState<RideData>({});

  const handleFromLocationSelect = (coordinates: [number, number], address: string) => {
    setRideData(prev => ({
      ...prev,
      fromCoordinates: coordinates,
      fromAddress: address
    }));
    // Переходим к следующему шагу
    setCurrentStep(2);
  };

  const handleToLocationSelect = (coordinates: [number, number], address: string) => {
    setRideData(prev => ({
      ...prev,
      toCoordinates: coordinates,
      toAddress: address
    }));
    
    // Создаем поездку автоматически после выбора обеих локаций
    handlePublishRide(coordinates, address);
  };

  const handlePublishRide = async (toCoordinates: [number, number], toAddress: string) => {
    if (!user?.id) {
      toast.error('Необходимо войти в систему');
      return;
    }

    if (!rideData.fromCoordinates || !toCoordinates) {
      toast.error('Выберите точки отправления и назначения');
      return;
    }

    try {
      await createRide({
        driver_id: user.id,
        from_city: rideData.fromAddress?.split(',')[0] || 'Неизвестно',
        to_city: toAddress?.split(',')[0] || 'Неизвестно',
        pickup_address: rideData.fromAddress,
        dropoff_address: toAddress,
        pickup_latitude: rideData.fromCoordinates[0],
        pickup_longitude: rideData.fromCoordinates[1],
        dropoff_latitude: toCoordinates[0],
        dropoff_longitude: toCoordinates[1],
        departure_date: new Date().toISOString().split('T')[0], // Сегодняшняя дата по умолчанию
        departure_time: '09:00', // Время по умолчанию
        available_seats: 4, // Места по умолчанию
        price_per_seat: 50000, // Цена по умолчанию
        status: 'active'
      });
      
      toast.success('Поездка успешно опубликована!');
      navigate('/search-rides'); // Переходим к поиску поездок
    } catch (error) {
      console.error('Error creating ride:', error);
      toast.error('Ошибка при создании поездки');
    }
  };

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

      default:
        return null;
    }
  };

  return (
    <div className="pb-24">
      {renderCurrentStep()}
      <BottomNavigation />
    </div>
  );
};

export default CreateDriverRide;
