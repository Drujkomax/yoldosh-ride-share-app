
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';

interface FullScreenDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

const FullScreenDatePicker = ({ isOpen, onClose, onDateSelect, selectedDate }: FullScreenDatePickerProps) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateSelect(date);
      onClose();
    }
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full h-full max-w-none max-h-none p-0 rounded-none">
        <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-purple-50">
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-white shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Выберите дату поездки</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between p-6 bg-white border-b">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h3 className="text-lg font-semibold text-slate-900">
              {format(currentMonth, 'LLLL yyyy', { locale: ru })}
            </h3>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Calendar */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-md mx-auto">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                disabled={(date) => date < new Date()}
                className="w-full"
                classNames={{
                  months: "flex flex-col space-y-4",
                  month: "space-y-4 w-full",
                  caption: "flex justify-center pt-1 relative items-center mb-4",
                  caption_label: "text-xl font-bold text-slate-800",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-300 hover:scale-110",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex mb-2",
                  head_cell: "text-slate-600 rounded-md w-12 font-medium text-sm text-center py-2",
                  row: "flex w-full mt-2",
                  cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 hover:bg-blue-100 rounded-xl transition-all duration-200 w-12 h-12",
                  day: "h-12 w-12 p-0 font-normal rounded-xl hover:bg-blue-500 hover:text-white transition-all duration-300 hover:scale-110 focus:bg-blue-500 focus:text-white text-lg",
                  day_selected: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:from-blue-600 focus:to-purple-600 shadow-lg scale-110",
                  day_today: "bg-orange-100 text-orange-600 font-bold",
                  day_outside: "text-slate-400 opacity-50",
                  day_disabled: "text-slate-400 opacity-30 cursor-not-allowed",
                }}
              />
            </div>

            {/* Quick Date Selection */}
            <div className="mt-8 space-y-3">
              <h4 className="text-lg font-semibold text-slate-900 text-center mb-4">Быстрый выбор</h4>
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                {[
                  { label: 'Сегодня', date: new Date() },
                  { label: 'Завтра', date: addMonths(new Date(), 0) },
                  { label: 'Через неделю', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
                  { label: 'Через месяц', date: addMonths(new Date(), 1) }
                ].map((item) => (
                  <Button
                    key={item.label}
                    variant="outline"
                    onClick={() => handleDateSelect(item.date)}
                    className="h-12 rounded-xl border-2 hover:bg-blue-50 hover:border-blue-300"
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullScreenDatePicker;
