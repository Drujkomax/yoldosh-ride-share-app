import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore, startOfToday } from 'date-fns';
import { ru } from 'date-fns/locale';

interface FullScreenCalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  onBack: () => void;
  title?: string;
}

const FullScreenCalendar = ({
  selectedDate,
  onDateSelect,
  onBack,
  title = "Выберите дату отправления"
}: FullScreenCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const today = startOfToday();

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const handleDateClick = (date: Date) => {
    if (!isBefore(date, today)) {
      onDateSelect(date);
    }
  };

  const getDateButtonClass = (date: Date) => {
    const baseClass = "w-full h-12 rounded-lg text-sm font-medium transition-colors";
    
    if (isBefore(date, today)) {
      return `${baseClass} text-gray-300 cursor-not-allowed`;
    }
    
    if (selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) {
      return `${baseClass} bg-blue-600 text-white`;
    }
    
    if (isToday(date)) {
      return `${baseClass} bg-blue-100 text-blue-600 border-2 border-blue-600`;
    }
    
    if (!isSameMonth(date, currentMonth)) {
      return `${baseClass} text-gray-400`;
    }
    
    return `${baseClass} text-gray-900 hover:bg-gray-100`;
  };

  const renderCalendarGrid = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Add empty cells for proper alignment
    const startDate = new Date(monthStart);
    const dayOfWeek = startDate.getDay();
    const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
    
    const emptyCells = Array(offset).fill(null);
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 px-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {format(month, 'LLLL yyyy', { locale: ru })}
          </h3>
          {format(month, 'yyyy-MM') === format(currentMonth, 'yyyy-MM') && (
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevMonth}
                className="p-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextMonth}
                className="p-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2 px-4">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 px-4">
          {emptyCells.map((_, index) => (
            <div key={`empty-${index}`} className="h-12" />
          ))}
          {days.map((date) => (
            <Button
              key={format(date, 'yyyy-MM-dd')}
              onClick={() => handleDateClick(date)}
              className={getDateButtonClass(date)}
              disabled={isBefore(date, today)}
              variant="ghost"
            >
              {format(date, 'd')}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  // Generate next 6 months for scrolling
  const months = Array.from({ length: 6 }, (_, i) => addMonths(currentMonth, i));

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

      {/* Calendar */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-6">
          {months.map((month, index) => (
            <div key={`month-${index}`}>
              {renderCalendarGrid(month)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FullScreenCalendar;