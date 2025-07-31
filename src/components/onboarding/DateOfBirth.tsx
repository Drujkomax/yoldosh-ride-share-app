
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Gift } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { WheelPicker } from '@/components/ui/wheel-picker';

interface DateOfBirthProps {
  dateOfBirth?: Date;
  onDateChange: (date: Date) => void;
  onNext: () => void;
  onSkip: () => void;
}

const DateOfBirth = ({ dateOfBirth, onDateChange, onNext, onSkip }: DateOfBirthProps) => {
  const today = new Date();
  const [day, setDay] = useState(dateOfBirth?.getDate() || today.getDate());
  const [month, setMonth] = useState(dateOfBirth ? dateOfBirth.getMonth() + 1 : today.getMonth() + 1);
  const [year, setYear] = useState(dateOfBirth?.getFullYear() || today.getFullYear() - 18);
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerType, setPickerType] = useState<'day' | 'month' | 'year'>('day');

  const currentYear = new Date().getFullYear();

  // Generate options for pickers
  const dayItems = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const monthItems = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  const yearItems = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());

  const validateDate = () => {
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();
    const age = today.getFullYear() - selectedDate.getFullYear();
    
    if (age < 14) {
      setError('Возраст должен быть не менее 14 лет');
      return false;
    }
    
    if (age > 100) {
      setError('Проверьте корректность даты');
      return false;
    }

    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateDate()) {
      const date = new Date(year, month - 1, day);
      onDateChange(date);
      onNext();
    }
  };

  const openPicker = (type: 'day' | 'month' | 'year') => {
    setPickerType(type);
    setShowDatePicker(true);
  };

  const handlePickerSelect = (value: string | number) => {
    if (pickerType === 'day') {
      setDay(parseInt(value.toString()));
    } else if (pickerType === 'month') {
      const monthIndex = monthItems.indexOf(value.toString()) + 1;
      setMonth(monthIndex);
    } else if (pickerType === 'year') {
      setYear(parseInt(value.toString()));
    }
    setError('');
    setShowDatePicker(false);
  };

  const getPickerItems = () => {
    switch (pickerType) {
      case 'day': return dayItems;
      case 'month': return monthItems;
      case 'year': return yearItems;
      default: return dayItems;
    }
  };

  const getCurrentSelectedValue = () => {
    switch (pickerType) {
      case 'day': return day.toString().padStart(2, '0');
      case 'month': return monthItems[month - 1];
      case 'year': return year.toString();
      default: return day.toString().padStart(2, '0');
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 flex flex-col justify-center p-6">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Дата рождения</h1>
          <p className="text-gray-600">Укажите вашу дату рождения</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-lg text-center flex items-center justify-center space-x-2">
              <Calendar className="h-5 w-5 text-teal-600" />
              <span>Когда вы родились?</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">День</label>
                <button
                  onClick={() => openPicker('day')}
                  className="w-full h-12 text-center text-lg font-medium border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors bg-white hover:bg-teal-50"
                >
                  {day.toString().padStart(2, '0')}
                </button>
              </div>
              
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">Месяц</label>
                <button
                  onClick={() => openPicker('month')}
                  className="w-full h-12 text-center text-lg font-medium border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors bg-white hover:bg-teal-50"
                >
                  {monthItems[month - 1]?.substring(0, 3) || month.toString().padStart(2, '0')}
                </button>
              </div>
              
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">Год</label>
                <button
                  onClick={() => openPicker('year')}
                  className="w-full h-12 text-center text-lg font-medium border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors bg-white hover:bg-teal-50"
                >
                  {year}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <div className="bg-teal-50 p-4 rounded-lg">
              <p className="text-sm text-teal-700 text-center">
                🔒 Эта информация поможет нам обеспечить безопасность
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleNext}
                disabled={!!error}
                className={`w-full h-12 text-base font-medium rounded-xl transition-all duration-300 ${
                  !error
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Продолжить
              </Button>

              <Button 
                onClick={onSkip}
                variant="ghost"
                className="w-full h-12 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-300"
              >
                Пропустить
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Date Picker Modal */}
        <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
          <DialogContent className="max-w-sm rounded-2xl p-0">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-center mb-4 text-teal-900">
                {pickerType === 'day' ? 'Выберите день' : 
                 pickerType === 'month' ? 'Выберите месяц' : 'Выберите год'}
              </h3>
              <WheelPicker
                items={getPickerItems()}
                selectedValue={getCurrentSelectedValue()}
                onValueChange={handlePickerSelect}
                className="mx-auto"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DateOfBirth;
