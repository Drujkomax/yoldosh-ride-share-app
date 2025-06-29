
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ChevronLeft, Check } from 'lucide-react';

interface TimeWheelPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onTimeSelect: (time: string) => void;
  selectedTime?: string;
  title?: string;
}

const TimeWheelPicker = ({ 
  isOpen, 
  onClose, 
  onTimeSelect, 
  selectedTime,
  title = "Выберите время"
}: TimeWheelPickerProps) => {
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  useEffect(() => {
    if (selectedTime) {
      const [hour, minute] = selectedTime.split(':').map(Number);
      setSelectedHour(hour);
      setSelectedMinute(minute);
    }
  }, [selectedTime]);

  const handleConfirm = () => {
    const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onTimeSelect(timeString);
    onClose();
  };

  const scrollToItem = (container: HTMLDivElement, index: number, itemHeight: number) => {
    const scrollTop = index * itemHeight - container.clientHeight / 2 + itemHeight / 2;
    container.scrollTo({ top: scrollTop, behavior: 'smooth' });
  };

  const WheelColumn = ({ 
    items, 
    selectedIndex, 
    onSelect, 
    formatItem,
    containerRef 
  }: {
    items: number[];
    selectedIndex: number;
    onSelect: (index: number) => void;
    formatItem: (item: number) => string;
    containerRef: React.RefObject<HTMLDivElement>;
  }) => {
    const itemHeight = 48;

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop;
      const index = Math.round(scrollTop / itemHeight);
      const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
      onSelect(items[clampedIndex]);
    };

    useEffect(() => {
      if (containerRef.current) {
        const index = items.indexOf(selectedIndex);
        scrollToItem(containerRef.current, index, itemHeight);
      }
    }, [selectedIndex, items, containerRef]);

    return (
      <div className="relative h-48 overflow-hidden">
        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
        
        {/* Selection indicator */}
        <div className="absolute top-1/2 left-0 right-0 h-12 -mt-6 border-t-2 border-b-2 border-blue-200 bg-blue-50 bg-opacity-30 z-10 pointer-events-none" />
        
        <div
          ref={containerRef}
          className="h-full overflow-y-scroll scrollbar-hide"
          onScroll={handleScroll}
          style={{ 
            paddingTop: '96px', // (container height - item height) / 2
            paddingBottom: '96px',
            scrollSnapType: 'y mandatory'
          }}
        >
          {items.map((item, index) => (
            <div
              key={item}
              className="h-12 flex items-center justify-center text-lg font-medium text-gray-700 scroll-snap-align-center"
              style={{ 
                opacity: Math.abs(items.indexOf(selectedIndex) - index) <= 2 ? 1 : 0.3,
                transform: `scale(${Math.abs(items.indexOf(selectedIndex) - index) === 0 ? 1.1 : 1})`
              }}
            >
              {formatItem(item)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-auto bg-white rounded-t-3xl">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <Button onClick={handleConfirm} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Check className="h-4 w-4 mr-1" />
              Готово
            </Button>
          </div>

          {/* Time Display */}
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-gray-900">
              {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')}
            </div>
          </div>

          {/* Wheel Pickers */}
          <div className="flex">
            <div className="flex-1">
              <div className="text-center text-sm font-medium text-gray-600 mb-2">Час</div>
              <WheelColumn
                items={hours}
                selectedIndex={selectedHour}
                onSelect={setSelectedHour}
                formatItem={(hour) => hour.toString().padStart(2, '0')}
                containerRef={hourRef}
              />
            </div>
            
            <div className="w-px bg-gray-200 mx-4 my-8" />
            
            <div className="flex-1">
              <div className="text-center text-sm font-medium text-gray-600 mb-2">Минуты</div>
              <WheelColumn
                items={minutes}
                selectedIndex={selectedMinute}
                onSelect={setSelectedMinute}
                formatItem={(minute) => minute.toString().padStart(2, '0')}
                containerRef={minuteRef}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TimeWheelPicker;
