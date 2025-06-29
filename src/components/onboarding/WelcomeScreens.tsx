
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Car, Users, Shield, MapPin } from 'lucide-react';

interface WelcomeScreensProps {
  onNext: () => void;
}

const welcomeData = [
  {
    icon: Car,
    title: 'Быстрые поездки',
    description: 'Находите попутчиков и добирайтесь быстрее',
    color: 'bg-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    icon: Users,
    title: 'Надежные попутчики',
    description: 'Все пользователи проходят верификацию',
    color: 'bg-green-600',
    bgColor: 'bg-green-50'
  },
  {
    icon: Shield,
    title: 'Безопасность',
    description: 'Ваша безопасность - наш приоритет',
    color: 'bg-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    icon: MapPin,
    title: 'Удобные маршруты',
    description: 'Поездки по всему Узбекистану',
    color: 'bg-orange-600',
    bgColor: 'bg-orange-50'
  }
];

const WelcomeScreens = ({ onNext }: WelcomeScreensProps) => {
  const [currentScreen, setCurrentScreen] = useState(0);

  const handleNext = () => {
    if (currentScreen < welcomeData.length - 1) {
      setCurrentScreen(prev => prev + 1);
    } else {
      onNext();
    }
  };

  const handleSkip = () => {
    onNext();
  };

  const current = welcomeData[currentScreen];
  const Icon = current.icon;

  return (
    <div className={`min-h-screen ${current.bgColor} flex flex-col justify-between p-6 transition-all duration-500`}>
      <div className="flex justify-end pt-4">
        <Button variant="ghost" onClick={handleSkip} className="text-gray-600 hover:text-gray-800">
          Пропустить
        </Button>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center text-center px-6">
        <div className={`w-24 h-24 ${current.color} rounded-full flex items-center justify-center mb-8 shadow-lg animate-bounce-soft`}>
          <Icon className="h-12 w-12 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {current.title}
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-sm">
          {current.description}
        </p>

        <div className="flex space-x-2 mb-12">
          {welcomeData.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentScreen ? current.color.replace('bg-', 'bg-') : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={handleNext}
          className={`w-full h-14 text-lg font-medium ${current.color} hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}
        >
          {currentScreen < welcomeData.length - 1 ? 'Далее' : 'Начать'}
        </Button>
      </div>
    </div>
  );
};

export default WelcomeScreens;
