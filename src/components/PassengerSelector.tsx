
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X, Minus, Plus } from 'lucide-react';

interface PassengerSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onPassengerSelect: (count: number) => void;
  currentCount: number;
}

const PassengerSelector = ({ isOpen, onClose, onPassengerSelect, currentCount }: PassengerSelectorProps) => {
  const handleCountChange = (newCount: number) => {
    if (newCount >= 1 && newCount <= 8) {
      onPassengerSelect(newCount);
    }
  };

  const handleConfirm = () => {
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-auto bg-gray-900 text-white border-0 rounded-t-3xl">
        <SheetHeader className="text-left mb-8">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold text-white">
              Количество<br />бронируемых мест
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-gray-800">
              <X className="h-6 w-6" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-8 pb-8">
          {/* Counter */}
          <div className="flex items-center justify-center space-x-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCountChange(currentCount - 1)}
              disabled={currentCount <= 1}
              className="w-16 h-16 rounded-full border-2 border-gray-600 text-white hover:bg-gray-800 disabled:opacity-30"
            >
              <Minus className="h-8 w-8" />
            </Button>
            
            <div className="text-6xl font-bold text-white min-w-[100px] text-center">
              {currentCount}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCountChange(currentCount + 1)}
              disabled={currentCount >= 8}
              className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-30"
            >
              <Plus className="h-8 w-8" />
            </Button>
          </div>

          {/* Confirm Button */}
          <div className="px-4">
            <Button
              onClick={handleConfirm}
              className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-lg font-semibold"
            >
              Подтвердить
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PassengerSelector;
