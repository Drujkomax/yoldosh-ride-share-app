
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Gift } from 'lucide-react';
import { WheelPicker } from '@/components/ui/wheel-picker';

interface DateOfBirthProps {
  dateOfBirth?: Date;
  onDateChange: (date: Date) => void;
  onNext: () => void;
  onSkip: () => void;
}

const DateOfBirth = ({ dateOfBirth, onDateChange, onNext, onSkip }: DateOfBirthProps) => {
  const [day, setDay] = useState(dateOfBirth?.getDate() || 1);
  const [month, setMonth] = useState(dateOfBirth ? dateOfBirth.getMonth() + 1 : 1);
  const [year, setYear] = useState(dateOfBirth?.getFullYear() || new Date().getFullYear() - 18);
  const [error, setError] = useState('');

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

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


  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col justify-center p-6">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Дата рождения</h1>
          <p className="text-gray-600">Укажите вашу дату рождения</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-lg text-center flex items-center justify-center space-x-2">
              <Calendar className="h-5 w-5 text-pink-600" />
              <span>Когда вы родились?</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4 h-64">
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">День</label>
                <WheelPicker
                  items={days}
                  selectedValue={day}
                  onValueChange={(value) => setDay(value as number)}
                  className="border-2 border-gray-200 rounded-xl"
                />
              </div>
              
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">Месяц</label>
                <WheelPicker
                  items={months}
                  selectedValue={month}
                  onValueChange={(value) => setMonth(value as number)}
                  className="border-2 border-gray-200 rounded-xl"
                />
              </div>
              
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">Год</label>
                <WheelPicker
                  items={years}
                  selectedValue={year}
                  onValueChange={(value) => setYear(value as number)}
                  className="border-2 border-gray-200 rounded-xl"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700 text-center">
                🔒 Эта информация поможет нам обеспечить безопасность
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleNext}
                disabled={!!error}
                className={`w-full h-12 text-base font-medium rounded-xl transition-all duration-300 ${
                  !error
                    ? 'bg-pink-600 hover:bg-pink-700 text-white shadow-lg hover:shadow-xl' 
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
      </div>
    </div>
  );
};

export default DateOfBirth;
