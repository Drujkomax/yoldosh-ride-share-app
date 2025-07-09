import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Minus, Plus, Check } from 'lucide-react';

interface PassengerCountPageProps {
  selectedCount?: number;
  onCountSelect: (count: number) => void;
  onBack: () => void;
  title?: string;
}

const PassengerCountPage = ({
  selectedCount = 3,
  onCountSelect,
  onBack,
  title = "Сколько пассажиров вы можете взять?"
}: PassengerCountPageProps) => {
  const [count, setCount] = useState(selectedCount);
  const [maxBackSeats, setMaxBackSeats] = useState(true);

  const handleIncrement = () => {
    if (count < 8) {
      setCount(count + 1);
    }
  };

  const handleDecrement = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  const handleConfirm = () => {
    onCountSelect(count);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            {title}
          </h1>

          {/* Counter */}
          <div className="flex items-center justify-center space-x-8 mb-8">
            <Button
              variant="outline"
              size="lg"
              onClick={handleDecrement}
              disabled={count <= 1}
              className="w-16 h-16 rounded-full border-2 border-blue-200 hover:border-blue-400 disabled:opacity-50"
            >
              <Minus className="h-6 w-6" />
            </Button>
            
            <div className="text-8xl font-light text-teal-700 min-w-[120px] text-center">
              {count}
            </div>
            
            <Button
              variant="outline"
              size="lg"
              onClick={handleIncrement}
              disabled={count >= 8}
              className="w-16 h-16 rounded-full border-2 border-blue-200 hover:border-blue-400 disabled:opacity-50"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Passenger Options */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-teal-700">
            Настройки пассажиров
          </h2>
          
          <div 
            onClick={() => setMaxBackSeats(!maxBackSeats)}
            className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Макс. 2 сзади</h3>
              <p className="text-sm text-gray-600 mt-1">
                Подумайте о комфорте, оставьте среднее место свободным
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                maxBackSeats 
                  ? 'bg-blue-600 border-blue-600' 
                  : 'border-gray-300'
              }`}>
                {maxBackSeats && (
                  <Check className="h-4 w-4 text-white" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="p-6">
        <Button 
          onClick={handleConfirm}
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full text-lg"
        >
          <ArrowLeft className="h-5 w-5 mr-2 rotate-180" />
          Продолжить
        </Button>
      </div>
    </div>
  );
};

export default PassengerCountPage;