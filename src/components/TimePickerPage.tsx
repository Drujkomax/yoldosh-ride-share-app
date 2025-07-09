import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';

interface TimePickerPageProps {
  selectedTime?: string;
  onTimeSelect: (time: string) => void;
  onBack: () => void;
  title?: string;
}

const TimePickerPage = ({
  selectedTime = '09:00',
  onTimeSelect,
  onBack,
  title = "Выберите время отправления"
}: TimePickerPageProps) => {
  const [hour, setHour] = useState(parseInt(selectedTime.split(':')[0]));
  const [minute, setMinute] = useState(parseInt(selectedTime.split(':')[1]));
  
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    // Center the selected hour and minute
    if (hourRef.current) {
      const hourElement = hourRef.current.children[hour] as HTMLElement;
      if (hourElement) {
        hourRef.current.scrollTop = hourElement.offsetTop - hourRef.current.offsetHeight / 2 + hourElement.offsetHeight / 2;
      }
    }
    
    if (minuteRef.current) {
      const minuteElement = minuteRef.current.children[minute] as HTMLElement;
      if (minuteElement) {
        minuteRef.current.scrollTop = minuteElement.offsetTop - minuteRef.current.offsetHeight / 2 + minuteElement.offsetHeight / 2;
      }
    }
  }, [hour, minute]);

  const handleConfirm = () => {
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onTimeSelect(timeString);
  };

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Time Display */}
      <div className="flex-1 flex flex-col justify-center items-center px-4">
        <div className="text-6xl font-light text-gray-900 mb-8 tracking-wider">
          {formatTime(hour, minute)}
        </div>

        {/* Time Pickers */}
        <div className="flex items-center space-x-8 w-full max-w-sm">
          {/* Hour Picker */}
          <div className="flex-1">
            <div className="text-center text-sm font-medium text-gray-600 mb-4">Час</div>
            <div className="relative">
              <div className="absolute inset-x-0 top-1/2 h-12 bg-blue-50 border-y-2 border-blue-200 transform -translate-y-1/2 pointer-events-none rounded-lg"></div>
              <div
                ref={hourRef}
                className="h-48 overflow-y-scroll scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="py-16">
                  {hours.map((h) => (
                    <div
                      key={h}
                      onClick={() => setHour(h)}
                      className={`h-12 flex items-center justify-center text-2xl font-medium cursor-pointer transition-colors ${
                        h === hour 
                          ? 'text-blue-600 font-semibold' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {h.toString().padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="text-3xl font-light text-gray-400 mt-8">:</div>

          {/* Minute Picker */}
          <div className="flex-1">
            <div className="text-center text-sm font-medium text-gray-600 mb-4">Минута</div>
            <div className="relative">
              <div className="absolute inset-x-0 top-1/2 h-12 bg-blue-50 border-y-2 border-blue-200 transform -translate-y-1/2 pointer-events-none rounded-lg"></div>
              <div
                ref={minuteRef}
                className="h-48 overflow-y-scroll scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="py-16">
                  {minutes.filter(m => m % 5 === 0).map((m) => (
                    <div
                      key={m}
                      onClick={() => setMinute(m)}
                      className={`h-12 flex items-center justify-center text-2xl font-medium cursor-pointer transition-colors ${
                        m === minute 
                          ? 'text-blue-600 font-semibold' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {m.toString().padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Button */}
        <div className="mt-8 w-full max-w-sm">
          <Button 
            onClick={handleConfirm}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl"
          >
            <Check className="h-5 w-5 mr-2" />
            Далее
          </Button>
        </div>
      </div>


    </div>
  );
};

export default TimePickerPage;