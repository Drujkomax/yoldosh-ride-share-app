import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Users, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PassengerCountPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/passenger-search';
  const currentCountParam = searchParams.get('currentCount');
  
  const [passengerCount, setPassengerCount] = useState(
    currentCountParam ? parseInt(currentCountParam) : 1
  );

  const handleCountChange = (newCount: number) => {
    if (newCount >= 1 && newCount <= 8) {
      setPassengerCount(newCount);
    }
  };

  const handleConfirm = () => {
    const params = new URLSearchParams(searchParams);
    params.set('passengerCount', passengerCount.toString());
    params.delete('returnTo');
    params.delete('currentCount');
    
    navigate(`${returnTo}?${params.toString()}`);
  };

  const passengerOptions = [
    { count: 1, label: '1 пассажир' },
    { count: 2, label: '2 пассажира' },
    { count: 3, label: '3 пассажира' },
    { count: 4, label: '4 пассажира' },
    { count: 5, label: '5 пассажиров' },
    { count: 6, label: '6 пассажиров' },
    { count: 7, label: '7 пассажиров' },
    { count: 8, label: '8 пассажиров' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(returnTo)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </Button>
          
          <h1 className="text-lg font-semibold text-gray-900">
            Сколько пассажиров?
          </h1>
          
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="flex items-center justify-center space-x-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleCountChange(passengerCount - 1)}
            disabled={passengerCount <= 1}
            className="h-14 w-14 rounded-full border-2 border-gray-300 hover:border-blue-500 disabled:opacity-50"
          >
            <Minus className="h-6 w-6" />
          </Button>
          
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {passengerCount}
            </div>
            <div className="text-gray-500 text-base">
              {passengerCount === 1 ? 'пассажир' : 
               passengerCount <= 4 ? 'пассажира' : 'пассажиров'}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleCountChange(passengerCount + 1)}
            disabled={passengerCount >= 8}
            className="h-14 w-14 rounded-full border-2 border-gray-300 hover:border-blue-500 disabled:opacity-50"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Confirm Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex justify-center">
          <Button
            onClick={handleConfirm}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium"
          >
            Подтвердить количество
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PassengerCountPage;