
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import AnimatedInput from '@/components/AnimatedInput';

interface PersonalInfoProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (name: string) => void;
  onLastNameChange: (name: string) => void;
  onNext: () => void;
}

const PersonalInfo = ({ 
  firstName, 
  lastName, 
  onFirstNameChange, 
  onLastNameChange, 
  onNext 
}: PersonalInfoProps) => {
  const [errors, setErrors] = useState({ firstName: '', lastName: '' });

  const validateName = (name: string, field: 'firstName' | 'lastName') => {
    // Фамилия не обязательна
    if (field === 'lastName') {
      if (name.trim() && name.trim().length < 2) {
        setErrors(prev => ({ ...prev, [field]: 'Минимум 2 символа' }));
        return false;
      }
      setErrors(prev => ({ ...prev, [field]: '' }));
      return true;
    }
    
    // Имя обязательно
    if (!name.trim()) {
      setErrors(prev => ({ ...prev, [field]: 'Поле обязательно' }));
      return false;
    }
    if (name.trim().length < 2) {
      setErrors(prev => ({ ...prev, [field]: 'Минимум 2 символа' }));
      return false;
    }
    setErrors(prev => ({ ...prev, [field]: '' }));
    return true;
  };

  const handleNext = () => {
    const isFirstNameValid = validateName(firstName, 'firstName');
    const isLastNameValid = validateName(lastName, 'lastName');
    
    if (isFirstNameValid && isLastNameValid) {
      onNext();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 flex flex-col justify-center p-6">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Как вас зовут?</h1>
          <p className="text-gray-600">Имя и фамилию</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-lg text-center">Личная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <AnimatedInput
                id="firstName"
                label="Имя"
                type="text"
                value={firstName}
                onChange={(e) => onFirstNameChange(e.target.value)}
                onBlur={() => validateName(firstName, 'firstName')}
                placeholder="Имя"
                icon={<User className="h-4 w-4" />}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-2">{errors.firstName}</p>
              )}
            </div>

            <div>
              <AnimatedInput
                id="lastName"
                label="Фамилия"
                type="text"
                value={lastName}
                onChange={(e) => onLastNameChange(e.target.value)}
                onBlur={() => validateName(lastName, 'lastName')}
                placeholder="Фамилия"
                icon={<User className="h-4 w-4" />}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-2">{errors.lastName}</p>
              )}
            </div>

            <div className="bg-teal-50 p-4 rounded-lg">
              <p className="text-sm text-teal-700 text-center">
                💡 Ваше имя будет видно другим пользователям в поездках
              </p>
            </div>

            <Button 
              onClick={handleNext}
              disabled={!firstName.trim() || !!errors.firstName || !!errors.lastName}
              className={`w-full h-12 text-base font-medium rounded-xl transition-all duration-300 ${
                firstName.trim() && !errors.firstName && !errors.lastName
                  ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Продолжить
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonalInfo;
