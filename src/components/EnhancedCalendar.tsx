
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, addWeeks, isToday, isTomorrow, isThisWeek, startOfWeek, endOfWeek, startOfToday } from 'date-fns';
import { ru } from 'date-fns/locale';

interface EnhancedCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (date: Date | undefined) => void;
  selectedDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  title?: string;
}

const EnhancedCalendar = ({
  isOpen,
  onClose,
  onDateSelect,
  selectedDate,
  minDate = startOfToday(),
  maxDate,
  title = "Выберите дату"
}: EnhancedCalendarProps) => {
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(selectedDate);

  const quickOptions = [
    {
      id: 'today',
      label: 'Сегодня',
      date: new Date(),
      subtitle: format(new Date(), 'EEEE', { locale: ru }),
    },
    {
      id: 'tomorrow',
      label: 'Завтра',
      date: addDays(new Date(), 1),
      subtitle: format(addDays(new Date(), 1), 'EEEE', { locale: ru }),
    },
    {
      id: 'weekend',
      label: 'На выходных',
      date: addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 5), // Суббота
      subtitle: 'Суббота',
    },
    {
      id: 'next_week',
      label: 'Через неделю',
      date: addWeeks(new Date(), 1),
      subtitle: format(addWeeks(new Date(), 1), 'EEEE', { locale: ru }),
    },
  ];

  const handleQuickSelect = (date: Date) => {
    setCalendarDate(date);
    onDateSelect(date);
    onClose();
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    setCalendarDate(date);
    if (date) {
      onDateSelect(date);
      onClose();
    }
  };

  const getDateDescription = (date: Date) => {
    if (isToday(date)) return 'Сегодня';
    if (isTomorrow(date)) return 'Завтра';
    if (isThisWeek(date)) return 'На этой неделе';
    return format(date, 'dd MMMM', { locale: ru });
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
            <div />
          </div>

          {/* Quick Options */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-medium text-gray-600">Быстрый выбор</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickOptions.map((option) => (
                <Button
                  key={option.id}
                  variant="ghost"
                  onClick={() => handleQuickSelect(option.date)}
                  className={`h-auto p-4 flex flex-col items-start text-left rounded-2xl border-2 transition-all ${
                    selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(option.date, 'yyyy-MM-dd')
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {option.subtitle}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {format(option.date, 'dd.MM', { locale: ru })}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-600">Или выберите дату</h3>
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <Calendar
                mode="single"
                selected={calendarDate}
                onSelect={handleCalendarSelect}
                disabled={(date) => 
                  (minDate && date < minDate) || 
                  (maxDate && date > maxDate)
                }
                locale={ru}
                className="w-full"
              />
            </div>
          </div>

          {/* Selected Date Display */}
          {selectedDate && (
            <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-full">
                  <CalendarIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-blue-800">
                    {format(selectedDate, 'dd MMMM yyyy', { locale: ru })}
                  </div>
                  <div className="text-blue-600 text-sm">
                    {getDateDescription(selectedDate)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EnhancedCalendar;
