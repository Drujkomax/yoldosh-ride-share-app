
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Facebook, Apple } from 'lucide-react';

interface RegistrationMethodProps {
  selectedMethod: 'email' | 'facebook' | 'apple';
  onMethodSelect: (method: 'email' | 'facebook' | 'apple') => void;
  onNext: () => void;
}

const RegistrationMethod = ({ selectedMethod, onMethodSelect, onNext }: RegistrationMethodProps) => {
  const methods = [
    {
      id: 'email' as const,
      icon: Mail,
      title: 'Email',
      description: 'Войти через электронную почту',
      color: 'border-teal-200 bg-teal-50 text-teal-700',
      iconColor: 'text-teal-600'
    },
    {
      id: 'facebook' as const,
      icon: Facebook,
      title: 'Facebook',
      description: 'Войти через Facebook',
      color: 'border-teal-200 bg-teal-50 text-teal-700',
      iconColor: 'text-teal-600'
    },
    {
      id: 'apple' as const,
      icon: Apple,
      title: 'Apple ID',
      description: 'Войти через Apple ID',
      color: 'border-gray-200 bg-gray-50 text-gray-700',
      iconColor: 'text-gray-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 flex flex-col justify-center p-6">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Добро пожаловать!</h1>
          <p className="text-gray-600">Выберите способ регистрации</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-center text-lg">Способ входа</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {methods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;
              
              return (
                <button
                  key={method.id}
                  onClick={() => onMethodSelect(method.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                    isSelected 
                      ? 'border-teal-500 bg-teal-50 shadow-md' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-teal-600' : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-6 w-6 ${isSelected ? 'text-white' : method.iconColor}`} />
                    </div>
                    <div className="text-left">
                      <h3 className={`font-medium ${isSelected ? 'text-teal-900' : 'text-gray-900'}`}>
                        {method.title}
                      </h3>
                      <p className={`text-sm ${isSelected ? 'text-teal-600' : 'text-gray-600'}`}>
                        {method.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}

            <Button 
              onClick={onNext}
              className="w-full h-12 text-base font-medium bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mt-6"
            >
              Продолжить
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegistrationMethod;
