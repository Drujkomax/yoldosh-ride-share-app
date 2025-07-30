
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Bell } from 'lucide-react';
import AnimatedInput from '@/components/AnimatedInput';

interface EmailRegistrationProps {
  email: string;
  marketingConsent: boolean;
  onEmailChange: (email: string) => void;
  onMarketingChange: (consent: boolean) => void;
  onNext: () => void;
}

const EmailRegistration = ({ 
  email, 
  marketingConsent, 
  onEmailChange, 
  onMarketingChange, 
  onNext 
}: EmailRegistrationProps) => {
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onEmailChange(value);
    
    if (value && !validateEmail(value)) {
      setEmailError('Введите корректный email адрес');
    } else {
      setEmailError('');
    }
  };

  const handleNext = () => {
    if (!email) {
      setEmailError('Email обязателен');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Введите корректный email адрес');
      return;
    }
    onNext();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 flex flex-col justify-center p-6">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ваш Email</h1>
          <p className="text-gray-600">Укажите email для регистрации</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-lg text-center">Email адрес</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <AnimatedInput
                id="email"
                label="Email адрес"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="example@gmail.com"
                icon={<Mail className="h-4 w-4" />}
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-2">{emailError}</p>
              )}
            </div>

            <Button 
              onClick={handleNext}
              disabled={!email || !!emailError}
              className={`w-full h-12 text-base font-medium rounded-xl transition-all duration-300 ${
                email && !emailError
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

export default EmailRegistration;
