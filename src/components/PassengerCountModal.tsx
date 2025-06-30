
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X, Minus, Plus } from 'lucide-react';

interface PassengerCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (count: number) => void;
  currentCount: number;
  title?: string;
}

const PassengerCountModal = ({
  isOpen,
  onClose,
  onSelect,
  currentCount,
  title = "Количество мест для бронирования"
}: PassengerCountModalProps) => {
  const [count, setCount] = React.useState(currentCount);

  React.useEffect(() => {
    if (isOpen) {
      setCount(currentCount);
    }
  }, [isOpen, currentCount]);

  const handleConfirm = () => {
    onSelect(count);
    onClose();
  };

  const increment = () => {
    if (count < 8) {
      setCount(count + 1);
    }
  };

  const decrement = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[60vh] bg-white">
        <div className="h-full flex flex-col">
          {/* Header */}
          <SheetHeader className="flex-shrink-0 border-b pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-semibold text-gray-900">{title}</SheetTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>

          {/* Counter */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center space-x-8">
              <Button
                onClick={decrement}
                disabled={count <= 1}
                variant="outline"
                size="lg"
                className="h-16 w-16 rounded-full border-2 border-gray-300 hover:border-blue-500 disabled:opacity-50"
              >
                <Minus className="h-6 w-6" />
              </Button>
              
              <div className="text-6xl font-bold text-gray-900 min-w-[100px] text-center">
                {count}
              </div>
              
              <Button
                onClick={increment}
                disabled={count >= 8}
                variant="outline"
                size="lg"
                className="h-16 w-16 rounded-full border-2 border-blue-500 hover:border-blue-600 text-blue-500 hover:text-blue-600 disabled:opacity-50"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="flex-shrink-0 p-4">
            <Button
              onClick={handleConfirm}
              className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-lg font-medium"
            >
              Подтвердить
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PassengerCountModal;
