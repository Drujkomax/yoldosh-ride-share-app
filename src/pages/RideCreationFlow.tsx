import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useRides } from '@/hooks/useRides';
import { useUser } from '@/contexts/UserContext';
import { useCanCreateRides } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, AlertTriangle, Loader2 } from 'lucide-react';
import AddressSearchPage from '@/components/AddressSearchPage';
import FullScreenCalendar from '@/components/FullScreenCalendar';
import TimePickerPage from '@/components/TimePickerPage';
import PassengerCountPage from '@/components/PassengerCountPage';
import PriceSettingPage from '@/components/PriceSettingPage';
import InstantBookingPage from '@/components/InstantBookingPage';
import ReturnTripPage from '@/components/ReturnTripPage';
import PhotoUploadFlow from '@/components/PhotoUploadFlow';
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
  const canCreateRides = useCanCreateRides();
  
  // Состояния компонента
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepHistory, setStepHistory] = useState<number[]>([]);
  const [currentAddressType, setCurrentAddressType] = useState<'from' | 'to'>('from');
  const [userHasPhoto, setUserHasPhoto] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [bypassCheck, setBypassCheck] = useState(false);
  const [initializationError, setInitializationError] = useState<string>('');
  
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

  // Мемоизированная функция для получения пользователя
  const getCurrentUser = useCallback(async () => {
    console.log('RideCreationFlow - Начало получения пользователя');
    
    try {
      setIsUserLoading(true);
      setInitializationError('');

      // Проверяем контекст пользователя
      console.log('RideCreationFlow - User from context:', user);
      console.log('RideCreationFlow - isAuthenticated:', isAuthenticated);

      if (!isAuthenticated || !user) {
        console.log('RideCreationFlow - Пользователь не авторизован, редирект на onboarding');
        navigate('/onboarding');
        return;
      }

      // Получаем пользователя из Supabase Auth
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('RideCreationFlow - Ошибка получения auth user:', authError);
        throw new Error('Ошибка авторизации: ' + authError.message);
      }

      console.log('RideCreationFlow - Auth user:', authUser);
      setSupabaseUser(authUser);

      // Проверяем фото профиля если есть ID пользователя
      if (user.id) {
        console.log('RideCreationFlow - Проверка фото профиля для user ID:', user.id);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = not found
          console.error('RideCreationFlow - Ошибка получения профиля:', profileError);
          // Не блокируем работу из-за ошибки профиля
        }

        const hasValidPhoto = profileData?.avatar_url && profileData.avatar_url.trim() !== '';
        setUserHasPhoto(hasValidPhoto);
        console.log('RideCreationFlow - User has photo:', hasValidPhoto, 'Avatar URL:', profileData?.avatar_url);
      }

    } catch (error) {
      console.error('RideCreationFlow - Ошибка инициализации:', error);
      setInitializationError(error instanceof Error ? error.message : 'Произошла неизвестная ошибка');
    } finally {
      setIsUserLoading(false);
    }
  }, [user, isAuthenticated, navigate]);

  // Эффект для инициализации (выполняется только один раз)
  useEffect(() => {
    getCurrentUser();
  }, []); // Пустой массив зависимостей!

  // Отдельный эффект для отслеживания изменений пользователя
  useEffect(() => {
    if (!isUserLoading && (!isAuthenticated || !user)) {
      console.log('RideCreationFlow - Пользователь вышел, редирект');
      navigate('/onboarding');
    }
  }, [isAuthenticated, user, navigate, isUserLoading]);

  // Если есть ошибка инициализации
  if (initializationError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl text-red-600">Ошибка загрузки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-center">{initializationError}</p>
            <div className="space-y-2">
              <Button 
                onClick={() => {
                  setInitializationError('');
                  getCurrentUser();
                }}
                className="w-full"
              >
                Попробовать снова
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/passenger')}
                className="w-full"
              >
                Назад
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Показываем загрузку пока получаем данные пользователя
  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <div>
            <p className="text-muted-foreground">Загрузка профиля...</p>
            <p className="text-xs text-gray-400 mt-2">
              Проверяем данные пользователя
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Проверка прав на создание поездки
  if (!bypassCheck && canCreateRides === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Car className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-xl">Добавьте автомобиль</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto" />
              <p className="text-gray-600">
                Для публикации поездок необходимо добавить автомобиль в профиль
              </p>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/profile')} 
                className="w-full"
              >
                Добавить автомобиль
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/passenger')}
                className="w-full"
              >
                Вернуться назад
              </Button>
              
              {/* Временная кнопка для тестирования */}
              {process.env.NODE_ENV === 'development' && (
                <Button 
                  variant="destructive" 
                  onClick={() => setBypassCheck(true)}
                  className="w-full text-xs"
                  size="sm"
                >
                  🚧 Обойти проверку (для тестирования)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const goToNextStep = useCallback(() => {
    setStepHistory(prev => [...prev, currentStep]);
    
    // Skip photo step if user already has a valid photo
    if (currentStep === 8 && userHasPhoto) {
      console.log('RideCreationFlow - Skipping photo step, user already has photo');
      setCurrentStep(10); // Skip to comments
    } else {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, userHasPhoto]);

  const goBack = useCallback(() => {
    if (stepHistory.length > 0) {
      const previousStep = stepHistory[stepHistory.length - 1];
      setStepHistory(prev => prev.slice(0, -1));
      setCurrentStep(previousStep);
    } else {
      // Если это первый шаг, возвращаемся назад
      navigate('/passenger');
    }
  }, [stepHistory, navigate]);

  const handleAddressSelect = useCallback((address: string, coordinates: [number, number]) => {
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
  }, [currentAddressType, goToNextStep]);

  const handleDateSelect = useCallback((date: Date) => {
    setRideData(prev => ({
      ...prev,
      departure_date: date.toISOString().split('T')[0]
    }));
    goToNextStep();
  }, [goToNextStep]);

  const handleTimeSelect = useCallback((time: string) => {
    setRideData(prev => ({
      ...prev,
      departure_time: time
    }));
    goToNextStep();
  }, [goToNextStep]);

  const handlePassengerCountSelect = useCallback((count: number) => {
    setRideData(prev => ({
      ...prev,
      available_seats: count
    }));
    goToNextStep();
  }, [goToNextStep]);

  const handleInstantBookingSelect = useCallback((enabled: boolean) => {
    setRideData(prev => ({
      ...prev,
      instant_booking_enabled: enabled
    }));
    goToNextStep();
  }, [goToNextStep]);

  const handlePriceSelect = useCallback((price: number) => {
    setRideData(prev => ({
      ...prev,
      price_per_seat: price
    }));
    goToNextStep();
  }, [goToNextStep]);

  const handleReturnTripSelect = useCallback((returnTripData: RideFormData | null) => {
    setRideData(prev => ({
      ...prev,
      return_trip_data: returnTripData
    }));
    goToNextStep();
  }, [goToNextStep]);

  const handlePhotoUpload = useCallback((uploaded: boolean) => {
    console.log('RideCreationFlow - Photo upload completed:', uploaded);
    setRideData(prev => ({
      ...prev,
      photo_uploaded: uploaded
    }));
    
    if (uploaded) {
      setUserHasPhoto(true);
    }
    
    goToNextStep();
  }, [goToNextStep]);

  const handleCommentsSubmit = useCallback((comments: string) => {
    setRideData(prev => ({
      ...prev,
      description: comments
    }));
    createRides();
  }, []);

  const createRides = useCallback(async () => {
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

      // Используем createRide из useRides hook
      await createRide(mainRideData);
      
      navigate('/ride-published');
    } catch (error) {
      console.error('RideCreationFlow - Ошибка создания поездки:', error);
      toast({
        title: "Ошибка при создании поездки",
        description: "Попробуйте еще раз",
        variant: "destructive"
      });
    }
  }, [user, rideData, createRide, navigate, toast]);

  const renderStep = () => {
    try {
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
              previousSelection={rideData.from_city}
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
            <PhotoUploadFlow
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
          console.error('RideCreationFlow - Неизвестный шаг:', currentStep);
          return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
              <Card className="w-full max-w-md">
                <CardContent className="text-center space-y-4 pt-6">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
                  <p>Ошибка навигации (шаг {currentStep})</p>
                  <Button onClick={() => setCurrentStep(1)}>
                    Начать сначала
                  </Button>
                </CardContent>
              </Card>
            </div>
          );
      }
    } catch (error) {
      console.error('RideCreationFlow - Ошибка рендера шага:', error);
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="text-center space-y-4 pt-6">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
              <p>Ошибка отображения страницы</p>
              <Button onClick={() => window.location.reload()}>
                Перезагрузить страницу
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {renderStep()}
      <div className="pb-20">
        <BottomNavigation />
      </div>
      
      {/* Debug panel for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
          <div>Step: {currentStep}</div>
          <div>User: {user?.id ? '✅' : '❌'}</div>
          <div>Auth: {isAuthenticated ? '✅' : '❌'}</div>
          <div>Can Create: {String(canCreateRides)}</div>
          <div>Loading: {isUserLoading ? '⏳' : '✅'}</div>
        </div>
      )}
    </div>
  );
};

export default RideCreationFlow;