
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  selectedDate?: Date;
  title?: string;
}

const DatePickerModal = ({
  isOpen,
  onClose,
  onSelect,
  selectedDate,
  title = "Когда вы едете?"
}: DatePickerModalProps) => {
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onSelect(date);
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] bg-white">
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

          {/* Calendar */}
          <div className="flex-1 flex items-center justify-center p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              locale={ru}
              className="rounded-md border-0"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center text-lg font-semibold",
                caption_label: "text-lg font-semibold",
                nav: "space-x-1 flex items-center",
                nav_button: "h-8 w-8 bg-transparent p-0 hover:bg-gray-100 rounded-md",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-gray-500 rounded-md w-12 font-normal text-sm",
                row: "flex w-full mt-2",
                cell: "h-12 w-12 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                day: "h-12 w-12 p-0 font-medium text-gray-900 hover:bg-gray-100 rounded-md transition-colors",
                day_selected: "bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-600",
                day_today: "bg-gray-100 text-gray-900",
                day_outside: "text-gray-400 opacity-50",
                day_disabled: "text-gray-400 opacity-50",
                day_hidden: "invisible",
              }}
              disabled={(date) => date < new Date()}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DatePickerModal;
