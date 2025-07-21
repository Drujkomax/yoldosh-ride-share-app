
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Image, ArrowLeft, Loader2 } from 'lucide-react';

interface PhotoCaptureScreenProps {
  onPhotoSelected: (file: File) => void;
  onBack: () => void;
}

const PhotoCaptureScreen = ({ onPhotoSelected, onBack }: PhotoCaptureScreenProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      onPhotoSelected(file);
      setIsLoading(false);
    }, 500);
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'user';
    input.onchange = (event) => handleFileSelect(event as any);
    input.click();
  };

  const handleGallerySelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => handleFileSelect(event as any);
    input.click();
  };

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
          <h1 className="text-xl font-bold text-teal-900">Выберите фото</h1>
          <div className="w-10" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-teal-600" />
            <p className="text-gray-600">Обрабатываем фото...</p>
          </div>
        </div>
      ) : (
        <div className="px-4 py-8 space-y-8">
          {/* Instruction */}
          <div className="text-center">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="h-10 w-10 text-teal-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Сделайте или выберите фото
            </h2>
            <p className="text-gray-600">
              Убедитесь, что ваше лицо хорошо видно
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <Button
              onClick={handleCameraCapture}
              className="w-full justify-start text-left p-6 h-auto bg-blue-50 hover:bg-blue-100 border-2 border-blue-200"
              variant="outline"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Camera className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-blue-800 text-lg">
                    Сделать фото
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    Используйте камеру устройства
                  </div>
                </div>
              </div>
            </Button>

            <Button
              onClick={handleGallerySelect}
              className="w-full justify-start text-left p-6 h-auto bg-green-50 hover:bg-green-100 border-2 border-green-200"
              variant="outline"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Image className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-green-800 text-lg">
                    Выбрать из галереи
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    Загрузите существующее фото
                  </div>
                </div>
              </div>
            </Button>
          </div>

          {/* Guidelines */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">💡 Советы для хорошего фото:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Смотрите прямо в камеру</li>
              <li>• Фотографируйтесь при хорошем освещении</li>
              <li>• Улыбайтесь естественно</li>
              <li>• Избегайте темных очков и головных уборов</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoCaptureScreen;
