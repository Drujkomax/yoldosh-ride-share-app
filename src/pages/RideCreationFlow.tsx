import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useRides } from '@/hooks/useRides';
import { useUser } from '@/contexts/UserContext';
import AddressSearchPage from '@/components/AddressSearchPage';
import FullScreenCalendar from '@/components/FullScreenCalendar';
import TimePickerPage from '@/components/TimePickerPage';
import PassengerCountPage from '@/components/PassengerCountPage';
import PriceSettingPage from '@/components/PriceSettingPage';
import InstantBookingPage from '@/components/InstantBookingPage';
import ReturnTripPage from '@/components/ReturnTripPage';
import ProfilePhotoPage from '@/components/ProfilePhotoPage';
import RideCommentsPage from '@/components/RideCommentsPage';
import BottomNavigation from '@/components/BottomNavigation';

interface RideFormData {
  departure_date: string;
  departure_time: string;
  from_city: string;
  to_city: string;
  available_seats: number;
  price_per_seat: number;
  description: string;
  pickup_coordinates: [number, number];
  pickup_address: string;
  dropoff_coordinates: [number, number];
  dropoff_address: string;
  instant_booking_enabled: boolean;
  return_trip_data: RideFormData | null;
  photo_uploaded: boolean;
}

const RideCreationFlow = () => {
  const navigate = useNavigate();
  const { createRide, isCreating } = useRides();
  const { user, isAuthenticated } = useUser();
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepHistory, setStepHistory] = useState<number[]>([]);
  const [currentAddressType, setCurrentAddressType] = useState<'from' | 'to'>('from');
  const [userHasPhoto, setUserHasPhoto] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(true);
  
  const [rideData, setRideData] = useState<RideFormData>({
    departure_date: '',
    departure_time: '',
    from_city: '',
    to_city: '',
    available_seats: 1,
    price_per_seat: 0,
    description: '',
    pickup_coordinates: [0, 0],
    pickup_address: '',
    dropoff_coordinates: [0, 0],
    dropoff_address: '',
    instant_booking_enabled: false,
    return_trip_data: null,
    photo_uploaded: false
  });

  // Get current user and check if user has profile photo
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        // Проверяем пользователя из контекста
        if (!user) {
          console.log('RideCreationFlow - Пользователь не авторизован, редирект на авторизацию');
          navigate('/onboarding');
          return;
        }
        
        // Пытаемся получить пользователя из Supabase Auth для полной интеграции
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setSupabaseUser(authUser);
        
        // Проверяем есть ли фото профиля
        if (user.id) {
          const { data } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .single();
          
          setUserHasPhoto(!!data?.avatar_url);
        }
      } catch (error) {
        console.error('RideCreationFlow - Ошибка получения пользователя:', error);
        // Не редиректим на onboarding при ошибке, если пользователь есть в контексте
      } finally {
        setIsUserLoading(false);
      }
    };
    
    getCurrentUser();
  }, [navigate, user]);

  const goToNextStep = () => {
    setStepHistory(prev => [...prev, currentStep]);
    
    // Skip photo step if user already has photo
    if (currentStep === 8 && userHasPhoto) {
      setCurrentStep(10);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goBack = () => {
    if (stepHistory.length > 0) {
      const previousStep = stepHistory[stepHistory.length - 1];
      setStepHistory(prev => prev.slice(0, -1));
      setCurrentStep(previousStep);
    }
  };

  const handleAddressSelect = (address: string, coordinates: [number, number]) => {
    // Extract city from address
    const cityMatch = address.match(/([^,]+),\s*([^,]+)/);
    const city = cityMatch ? cityMatch[1].trim() : address;
    
    if (currentAddressType === 'from') {
      setRideData(prev => ({
        ...prev,
        from_city: city,
        pickup_coordinates: coordinates,
        pickup_address: address
      }));
      setCurrentAddressType('to');
      setCurrentStep(2);
    } else {
      setRideData(prev => ({
        ...prev,
        to_city: city,
        dropoff_coordinates: coordinates,
        dropoff_address: address
      }));
      goToNextStep();
    }
  };

  const handleDateSelect = (date: Date) => {
    setRideData(prev => ({
      ...prev,
      departure_date: date.toISOString().split('T')[0]
    }));
    goToNextStep();
  };

  const handleTimeSelect = (time: string) => {
    setRideData(prev => ({
      ...prev,
      departure_time: time
    }));
    goToNextStep();
  };

  const handlePassengerCountSelect = (count: number) => {
    setRideData(prev => ({
      ...prev,
      available_seats: count
    }));
    goToNextStep();
  };

  const handleInstantBookingSelect = (enabled: boolean) => {
    setRideData(prev => ({
      ...prev,
      instant_booking_enabled: enabled
    }));
    goToNextStep();
  };

  const handlePriceSelect = (price: number) => {
    setRideData(prev => ({
      ...prev,
      price_per_seat: price
    }));
    goToNextStep();
  };

  const handleReturnTripSelect = (returnTripData: RideFormData | null) => {
    setRideData(prev => ({
      ...prev,
      return_trip_data: returnTripData
    }));
    goToNextStep();
  };

  const handlePhotoUpload = (uploaded: boolean) => {
    setRideData(prev => ({
      ...prev,
      photo_uploaded: uploaded
    }));
    goToNextStep();
  };

  const handleCommentsSubmit = (comments: string) => {
    setRideData(prev => ({
      ...prev,
      description: comments
    }));
    createRides();
  };

  const createRides = async () => {
    console.log('RideCreationFlow - Начало создания поездки, user:', user);
    console.log('RideCreationFlow - Данные поездки:', rideData);
    
    if (!user?.id) {
      console.error('RideCreationFlow - Пользователь не найден');
      toast({
        title: "Ошибка авторизации",
        description: "Необходимо войти в систему",
        variant: "destructive"
      });
      navigate('/onboarding');
      return;
    }

    try {
      // Создаем основную поездку через useRides hook
      const mainRideData = {
        driver_id: user.id,
        departure_date: rideData.departure_date,
        departure_time: rideData.departure_time,
        from_city: rideData.from_city,
        to_city: rideData.to_city,
        available_seats: rideData.available_seats,
        price_per_seat: rideData.price_per_seat,
        description: rideData.description,
        pickup_address: rideData.pickup_address,
        dropoff_address: rideData.dropoff_address,
        pickup_latitude: rideData.pickup_coordinates[0],
        pickup_longitude: rideData.pickup_coordinates[1],
        dropoff_latitude: rideData.dropoff_coordinates[0],
        dropoff_longitude: rideData.dropoff_coordinates[1],
        instant_booking_enabled: rideData.instant_booking_enabled,
        status: 'active' as const
      };

      console.log('RideCreationFlow - Создание основной поездки:', mainRideData);

      // Используем createRide из useRides hook - он автоматически создаст профиль если нужно
      createRide(mainRideData);

      // TODO: Добавить поддержку обратной поездки через useRides
      // Пока что основная поездка создается через надежный hook
      
      navigate('/ride-published');
    } catch (error) {
      console.error('RideCreationFlow - Ошибка создания поездки:', error);
      toast({
        title: "Ошибка при создании поездки",
        description: "Попробуйте еще раз",
        variant: "destructive"
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <AddressSearchPage
            title="Откуда вы выезжаете?"
            onAddressSelect={handleAddressSelect}
            onBack={goBack}
            placeholder="Выберите город отправления"
          />
        );
      case 2:
        return (
          <AddressSearchPage
            title="Куда вы едете?"
            onAddressSelect={handleAddressSelect}
            onBack={goBack}
            placeholder="Выберите город назначения"
          />
        );
      case 3:
        return (
          <FullScreenCalendar
            selectedDate={rideData.departure_date ? new Date(rideData.departure_date) : undefined}
            onDateSelect={handleDateSelect}
            onBack={goBack}
            title="Когда поездка?"
          />
        );
      case 4:
        return (
          <TimePickerPage
            selectedTime={rideData.departure_time}
            onTimeSelect={handleTimeSelect}
            onBack={goBack}
            title="Во сколько заберете пассажиров?"
          />
        );
      case 5:
        return (
          <PassengerCountPage
            selectedCount={rideData.available_seats}
            onCountSelect={handlePassengerCountSelect}
            onBack={goBack}
            title="Сколько попутчиков возьмете?"
          />
        );
      case 6:
        return (
          <InstantBookingPage
            onSelect={handleInstantBookingSelect}
            onBack={goBack}
          />
        );
      case 7:
        return (
          <PriceSettingPage
            selectedPrice={rideData.price_per_seat}
            onPriceSelect={handlePriceSelect}
            onBack={goBack}
            title="Установите цену за место"
          />
        );
      case 8:
        return (
          <ReturnTripPage
            originalRideData={rideData}
            onSelect={handleReturnTripSelect}
            onBack={goBack}
          />
        );
      case 9:
        return (
          <ProfilePhotoPage
            onComplete={handlePhotoUpload}
            onBack={goBack}
          />
        );
      case 10:
        return (
          <RideCommentsPage
            initialComments={rideData.description}
            onSubmit={handleCommentsSubmit}
            onBack={goBack}
          />
        );
      default:
        return null;
    }
  };

  // Показываем загрузку пока получаем данные пользователя
  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {renderStep()}
      <div className="pb-20">
        <BottomNavigation />
      </div>
    </div>
  );
};

export default RideCreationFlow;