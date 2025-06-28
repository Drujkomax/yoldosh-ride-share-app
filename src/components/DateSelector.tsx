
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';

interface DateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

const DateSelector = ({ isOpen, onClose, onDateSelect, selectedDate }: DateSelectorProps) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const handleDateSelect = (date: Date) => {
    onDateSelect(date);
    onClose();
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const getDateClasses = (day: Date) => {
    let classes = 'w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium transition-all duration-200';
    
    if (selectedDate && isSameDay(day, selectedDate)) {
      classes += ' bg-blue-500 text-white';
    } else if (isToday(day)) {
      classes += ' bg-gray-700 text-white';
    } else {
      classes += ' text-gray-300 hover:bg-gray-800';
    }
    
    if (day < new Date()) {
      classes += ' opacity-50 cursor-not-allowed';
    } else {
      classes += ' cursor-pointer';
    }
    
    return classes;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-full bg-gray-900 text-white border-0 rounded-t-3xl">
        <SheetHeader className="text-left mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold text-white">Когда вы едете?</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-gray-800">
              <X className="h-6 w-6" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Week Days */}
          <div className="grid grid-cols-7 gap-2 px-4">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-gray-400 font-medium py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Month Header */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-4">
              {format(currentMonth, 'LLLL', { locale: ru }).toUpperCase()}
            </h3>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 px-4">
            {/* Empty cells for days before month start */}
            {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, index) => (
              <div key={index} className="w-12 h-12"></div>
            ))}
            
            {/* Days of the month */}
            {days.map((day) => (
              <button
                key={day.toISOString()}
                onClick={() => day >= new Date() && handleDateSelect(day)}
                className={getDateClasses(day)}
                disabled={day < new Date()}
              >
                {format(day, 'd')}
              </button>
            ))}
          </div>

          {/* Next Month */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              {format(addDays(monthEnd, 1), 'LLLL', { locale: ru }).toUpperCase()}
            </h3>
            <div className="grid grid-cols-7 gap-2 px-4">
              {/* Show first few days of next month */}
              {Array.from({ length: 10 }).map((_, index) => {
                const nextMonthDay = addDays(monthEnd, index + 1);
                return (
                  <button
                    key={nextMonthDay.toISOString()}
                    onClick={() => handleDateSelect(nextMonthDay)}
                    className={getDateClasses(nextMonthDay)}
                  >
                    {format(nextMonthDay, 'd')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DateSelector;
