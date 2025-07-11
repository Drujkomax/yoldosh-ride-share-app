import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore, startOfToday } from 'date-fns';
import { ru } from 'date-fns/locale';

const FullScreenCalendar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/passenger-search';
  const selectedDateParam = searchParams.get('selectedDate');
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    selectedDateParam ? new Date(selectedDateParam) : null
  );
  const [months, setMonths] = useState<Date[]>([]);
  const today = startOfToday();

  // Initialize months starting from current month
  useEffect(() => {
    const initialMonths = [];
    for (let i = 0; i < 12; i++) {
      const newMonth = addMonths(today, i);
      // Ensure the date is valid before adding
      if (!isNaN(newMonth.getTime())) {
        initialMonths.push(newMonth);
      }
    }
    setMonths(initialMonths);
  }, []); // Remove today dependency to prevent infinite loop

  // Load more months when user scrolls to bottom
  const loadMoreMonths = () => {
    if (months.length === 0) return;
    
    const lastMonth = months[months.length - 1];
    const newMonths = [];
    for (let i = 1; i <= 6; i++) {
      const newMonth = addMonths(lastMonth, i);
      // Ensure the date is valid before adding
      if (!isNaN(newMonth.getTime())) {
        newMonths.push(newMonth);
      }
    }
    setMonths(prev => [...prev, ...newMonths]);
  };

  // Handle scroll to detect when to load more months
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
        loadMoreMonths();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [months]);

  const handleDateSelect = (date: Date) => {
    if (isBefore(date, today)) return; // Don't allow selecting past dates
    
    setSelectedDate(date);
    
    // Return to previous page with selected date
    const params = new URLSearchParams(searchParams);
    params.set('selectedDate', format(date, 'yyyy-MM-dd'));
    params.delete('returnTo');
    
    navigate(`${returnTo}?${params.toString()}`);
  };

  const renderMonth = (monthDate: Date) => {
    // Safety check: ensure monthDate is valid
    if (!monthDate || isNaN(monthDate.getTime())) {
      console.error('Invalid monthDate passed to renderMonth:', monthDate);
      return null;
    }

    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Get first day of week (Monday = 1, Sunday = 0)
    const firstDayOfWeek = monthStart.getDay();
    const startDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Convert to Monday = 0
    
    // Safety check: ensure startDay is a valid number
    if (isNaN(startDay) || startDay < 0) {
      console.error('Invalid startDay calculated:', startDay, 'from firstDayOfWeek:', firstDayOfWeek);
      return null;
    }
    
    const emptyDays = Array(startDay).fill(null);

    return (
      <div key={monthDate.toISOString()} className="mb-8 animate-fade-in">
        {/* Month Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            {format(monthDate, 'LLLL yyyy', { locale: ru })}
          </h2>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month start */}
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="h-12" />
          ))}
          
          {/* Days */}
          {days.map(day => {
            const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            const isTodayDate = isToday(day);
            const isPastDate = isBefore(day, today);
            const isCurrentMonth = isSameMonth(day, monthDate);

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateSelect(day)}
                disabled={isPastDate}
                className={`
                  h-12 flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-200
                  ${isSelected 
                    ? 'bg-blue-500 text-white shadow-lg scale-110' 
                    : isTodayDate 
                      ? 'bg-blue-100 text-blue-600 border-2 border-blue-300' 
                      : isPastDate 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : isCurrentMonth 
                          ? 'text-gray-900 hover:bg-gray-100 hover:scale-105' 
                          : 'text-gray-400'
                  }
                  ${!isPastDate && !isSelected ? 'hover-scale' : ''}
                `}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-4 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(returnTo)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </Button>
          
          <h1 className="text-lg font-semibold text-gray-900">
            Когда вы едете?
          </h1>
          
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
        
        {selectedDate && (
          <div className="mt-2 text-center">
            <div className="text-sm text-gray-500">Выбрано:</div>
            <div className="text-base font-medium text-blue-600">
              {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: ru })}
            </div>
          </div>
        )}
      </div>

      {/* Calendar Content */}
      <div className="px-4 py-6">
        <div className="max-w-sm mx-auto">
          {months.map(month => renderMonth(month))}
          
          {/* Loading indicator */}
          <div className="text-center py-8">
            <div className="text-gray-500 text-sm">Загружаем больше месяцев...</div>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      {selectedDate && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <Button
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set('selectedDate', format(selectedDate, 'yyyy-MM-dd'));
              params.delete('returnTo');
              navigate(`${returnTo}?${params.toString()}`);
            }}
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium"
          >
            Подтвердить дату
          </Button>
        </div>
      )}
    </div>
  );
};

export default FullScreenCalendar;