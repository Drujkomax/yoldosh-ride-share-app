
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Check, Loader2 } from 'lucide-react';
import CircularCropper from './CircularCropper';

interface PhotoPreviewScreenProps {
  photoFile: File;
  onConfirm: (croppedBlob: Blob) => void;
  onBack: () => void;
  isUploading?: boolean;
}

const PhotoPreviewScreen = ({ photoFile, onConfirm, onBack, isUploading = false }: PhotoPreviewScreenProps) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(photoFile);
    setImageUrl(url);
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [photoFile]);

  const handleCropComplete = (blob: Blob) => {
    setCroppedBlob(blob);
  };

  const handleConfirm = () => {
    if (croppedBlob) {
      onConfirm(croppedBlob);
    }
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
            disabled={isUploading}
          >
            <ArrowLeft className="h-6 w-6 text-teal-600" />
          </Button>
          <h1 className="text-xl font-bold text-teal-900">Настройте фото</h1>
          <div className="w-10" />
        </div>
      </div>

      {isUploading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-teal-600" />
            <p className="text-gray-600">Загружаем фото...</p>
          </div>
        </div>
      ) : (
        <div className="px-4 py-8 space-y-6">
          {/* Instructions */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Отрегулируйте ваше фото
            </h2>
            <p className="text-gray-600">
              Убедитесь, что ваше лицо находится в центре круга
            </p>
          </div>

          {/* Cropper */}
          <div className="flex justify-center">
            {imageUrl && (
              <CircularCropper
                imageUrl={imageUrl}
                onCropComplete={handleCropComplete}
                size={280}
              />
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={handleConfirm}
              disabled={!croppedBlob}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg disabled:opacity-50"
            >
              <Check className="h-5 w-5 mr-2" />
              Использовать это фото
            </Button>
            
            <Button
              onClick={onBack}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 py-3 rounded-lg"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Выбрать другое фото
            </Button>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-800 mb-2">💡 Советы:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Ваше лицо должно занимать большую часть круга</li>
              <li>• Убедитесь, что лицо хорошо освещено</li>
              <li>• Избегайте размытых изображений</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoPreviewScreen;
