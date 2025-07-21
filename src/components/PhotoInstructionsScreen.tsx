
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, ArrowLeft, CheckCircle } from 'lucide-react';

interface PhotoInstructionsScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

const PhotoInstructionsScreen = ({ onContinue, onBack }: PhotoInstructionsScreenProps) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="h-6 w-6 text-teal-600" />
          </Button>
          <h1 className="text-xl font-bold text-teal-900">Фото профиля</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 py-8 space-y-8">
        {/* Main Icon */}
        <div className="text-center">
          <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Camera className="h-12 w-12 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Добавьте фото профиля
          </h2>
          <p className="text-gray-600 text-lg">
            Это поможет пассажирам узнать вас
          </p>
        </div>

        {/* Benefits List */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-6 w-6 text-teal-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Повышает доверие</h3>
              <p className="text-gray-600">Пассажиры чаще выбирают водителей с фото</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-6 w-6 text-teal-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Легче найти друг друга</h3>
              <p className="text-gray-600">Встреча станет проще и быстрее</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-6 w-6 text-teal-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Больше заказов</h3>
              <p className="text-gray-600">Профили с фото получают на 40% больше бронирований</p>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Требования к фото:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Хорошо видно ваше лицо</li>
            <li>• Фото сделано в хорошем освещении</li>
            <li>• Без солнцезащитных очков</li>
            <li>• Только вы на фотографии</li>
          </ul>
        </div>

        {/* Continue Button */}
        <div className="pt-4">
          <Button 
            onClick={onContinue}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg"
          >
            Продолжить
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhotoInstructionsScreen;
