import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowLeftRight, X } from 'lucide-react';
import FullScreenCalendar from '@/components/FullScreenCalendar';
import TimePickerPage from '@/components/TimePickerPage';
import PriceSettingPage from '@/components/PriceSettingPage';

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

interface ReturnTripPageProps {
  originalRideData: RideFormData;
  onSelect: (returnTripData: RideFormData | null) => void;
  onBack: () => void;
}

const ReturnTripPage = ({ originalRideData, onSelect, onBack }: ReturnTripPageProps) => {
  const [showReturnFlow, setShowReturnFlow] = useState(false);
  const [returnStep, setReturnStep] = useState(1); // 1: date, 2: time, 3: price
  const [returnTripData, setReturnTripData] = useState<Partial<RideFormData>>({
    from_city: originalRideData.to_city,
    to_city: originalRideData.from_city,
    pickup_address: originalRideData.dropoff_address,
    dropoff_address: originalRideData.pickup_address,
    pickup_coordinates: originalRideData.dropoff_coordinates,
    dropoff_coordinates: originalRideData.pickup_coordinates,
    available_seats: originalRideData.available_seats,
    instant_booking_enabled: originalRideData.instant_booking_enabled,
    description: '',
    return_trip_data: null,
    photo_uploaded: false
  });

  const handleYes = () => {
    setShowReturnFlow(true);
  };

  const handleNo = () => {
    onSelect(null);
  };

  const handleReturnDate = (date: Date) => {
    setReturnTripData(prev => ({
      ...prev,
      departure_date: date.toISOString().split('T')[0]
    }));
    setReturnStep(2);
  };

  const handleReturnTime = (time: string) => {
    setReturnTripData(prev => ({
      ...prev,
      departure_time: time
    }));
    setReturnStep(3);
  };

  const handleReturnPrice = (price: number) => {
    const completeReturnTrip = {
      ...returnTripData,
      price_per_seat: price
    } as RideFormData;
    
    onSelect(completeReturnTrip);
  };

  const handleBackInFlow = () => {
    if (returnStep === 1) {
      setShowReturnFlow(false);
    } else {
      setReturnStep(prev => prev - 1);
    }
  };

  if (showReturnFlow) {
    switch (returnStep) {
      case 1:
        return (
          <FullScreenCalendar
            selectedDate={returnTripData.departure_date ? new Date(returnTripData.departure_date) : undefined}
            onDateSelect={handleReturnDate}
            onBack={handleBackInFlow}
            title="Когда обратная поездка?"
          />
        );
      case 2:
        return (
          <TimePickerPage
            selectedTime={returnTripData.departure_time || ''}
            onTimeSelect={handleReturnTime}
            onBack={handleBackInFlow}
            title="Во сколько обратная поездка?"
          />
        );
      case 3:
        return (
          <PriceSettingPage
            selectedPrice={returnTripData.price_per_seat || 0}
            onPriceSelect={handleReturnPrice}
            onBack={handleBackInFlow}
            title="Цена за место в обратной поездке"
          />
        );
    }
  }

  return (
    <div className="fixed inset-0 bg-background z-50">
      {/* Header */}
      <div className="bg-background shadow-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Обратная поездка</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <ArrowLeftRight className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Собираетесь назад?
          </h2>
          <p className="text-muted-foreground">
            Опубликуйте обратную поездку сейчас!
          </p>
        </div>

        <div className="bg-muted/30 rounded-xl p-4">
          <div className="flex items-center justify-between text-sm">
            <div>
              <div className="font-medium text-foreground">{originalRideData.from_city}</div>
              <div className="text-muted-foreground">Откуда</div>
            </div>
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            <div className="text-right">
              <div className="font-medium text-foreground">{originalRideData.to_city}</div>
              <div className="text-muted-foreground">Куда</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleYes}
            className="w-full justify-center p-4 h-auto bg-primary hover:bg-primary/90"
          >
            <div className="flex items-center space-x-3">
              <ArrowLeftRight className="h-5 w-5" />
              <span className="font-semibold text-lg">Да, создать обратную поездку</span>
            </div>
          </Button>

          <Button
            onClick={handleNo}
            variant="outline"
            className="w-full justify-center p-4 h-auto"
          >
            <div className="flex items-center space-x-3">
              <X className="h-5 w-5" />
              <span className="font-semibold text-lg">Нет, только одну поездку</span>
            </div>
          </Button>
        </div>

        <div className="bg-blue-50 rounded-xl p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Преимущества</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Удобно для пассажиров - сразу видят обе поездки</li>
            <li>• Экономия времени - не нужно создавать вторую поездку отдельно</li>
            <li>• Больше шансов найти попутчиков на обратный путь</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReturnTripPage;