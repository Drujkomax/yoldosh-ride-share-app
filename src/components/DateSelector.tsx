
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft } from 'lucide-react';
import { format, startOfToday, addMonths, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';

interface DateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (date: Date | undefined) => void;
  selectedDate?: Date;
  minDate?: Date;
  maxDate?: Date;
}

const DateSelector = ({ 
  isOpen, 
  onClose, 
  onDateSelect, 
  selectedDate,
  minDate = startOfToday(),
  maxDate
}: DateSelectorProps) => {
  if (!isOpen) return null;

  const handleDateSelect = (date: Date | undefined) => {
    onDateSelect(date);
    onClose();
  };

  const handleTodaySelect = () => {
    const today = startOfToday();
    onDateSelect(today);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white animate-slide-in-right">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            onClick={onClose}
            className="mr-3 p-2 hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold text-gray-900">Выберите дату</h2>
        </div>

        {/* Quick Actions */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="space-y-2">
            <Button
              variant="ghost"
              onClick={handleTodaySelect}
              className="w-full justify-start text-left p-4 h-auto bg-white rounded-xl hover:bg-blue-50 border border-gray-200"
            >
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="font-medium text-gray-900">Сегодня</div>
                  <div className="text-sm text-gray-500">
                    {format(startOfToday(), 'dd MMMM yyyy', { locale: ru })}
                  </div>
                </div>
                {isToday(selectedDate || new Date()) && (
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </Button>
          </div>
        </div>

        {/* Calendar */}
        <div className="flex-1 overflow-y-auto p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            initialFocus
            numberOfMonths={2}
            className="pointer-events-auto w-full"
            classNames={{
              months: "flex flex-col space-y-4 w-full",
              month: "space-y-4 w-full",
              caption: "flex justify-center pt-1 relative items-center mb-4",
              caption_label: "text-lg font-bold text-gray-800",
              nav: "space-x-1 flex items-center",
              nav_button: "h-8 w-8 bg-blue-500 text-white hover:bg-blue-600 rounded-xl transition-all duration-300 hover:scale-110",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex mb-2",
              head_cell: "text-gray-600 rounded-md w-full font-medium text-sm text-center py-2",
              row: "flex w-full mt-2",
              cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 hover:bg-blue-100 rounded-xl transition-all duration-200 flex-1",
              day: "h-10 w-full p-0 font-normal rounded-xl hover:bg-blue-500 hover:text-white transition-all duration-300 hover:scale-105 focus:bg-blue-500 focus:text-white",
              day_selected: "bg-blue-500 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-500 focus:text-white shadow-lg scale-105",
              day_today: "bg-blue-100 text-blue-600 font-bold",
              day_outside: "text-gray-400 opacity-50",
              day_disabled: "text-gray-400 opacity-30 cursor-not-allowed",
              day_range_middle: "aria-selected:bg-blue-100 aria-selected:text-blue-600",
              day_hidden: "invisible",
            }}
            fromDate={minDate}
            toDate={maxDate}
            defaultMonth={selectedDate || startOfToday()}
          />
        </div>

        {/* Footer info */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="text-center text-sm text-gray-600">
            {selectedDate ? (
              <span>Выбрана дата: <span className="font-medium text-gray-900">{format(selectedDate, 'dd MMMM yyyy', { locale: ru })}</span></span>
            ) : (
              'Выберите дату поездки'
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateSelector;