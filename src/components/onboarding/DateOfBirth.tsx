
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Gift } from 'lucide-react';

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

  const currentYear = new Date().getFullYear();

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
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={day}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setDay(Math.min(Math.max(value, 1), 31));
                    setError('');
                  }}
                  className="w-full h-12 text-center text-lg font-medium border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors bg-white"
                  placeholder="01"
                />
              </div>
              
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">Месяц</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={month}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setMonth(Math.min(Math.max(value, 1), 12));
                    setError('');
                  }}
                  className="w-full h-12 text-center text-lg font-medium border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors bg-white"
                  placeholder="01"
                />
              </div>
              
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">Год</label>
                <input
                  type="number"
                  min="1924"
                  max={currentYear}
                  value={year}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || currentYear - 18;
                    setYear(Math.min(Math.max(value, 1924), currentYear));
                    setError('');
                  }}
                  className="w-full h-12 text-center text-lg font-medium border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors bg-white"
                  placeholder="2000"
                />
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
      </div>
    </div>
  );
};

export default DateOfBirth;
