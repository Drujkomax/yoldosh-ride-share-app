
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Check, Loader2 } from 'lucide-react';
import CircularCropper, { CircularCropperRef } from './CircularCropper';

interface PhotoPreviewScreenProps {
  photoFile: File;
  onConfirm: (croppedBlob: Blob) => void;
  onBack: () => void;
  isUploading?: boolean;
}

const PhotoPreviewScreen = ({ photoFile, onConfirm, onBack, isUploading = false }: PhotoPreviewScreenProps) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const cropperRef = useRef<CircularCropperRef>(null);

  useEffect(() => {
    const url = URL.createObjectURL(photoFile);
    setImageUrl(url);
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [photoFile]);

  const handleCropComplete = (blob: Blob) => {
    // Automatic crop complete callback - можно использовать для превью
    console.log('Crop completed automatically, blob size:', blob.size);
  };

  const handleConfirm = async () => {
    if (!cropperRef.current) {
      alert('Компонент обрезки не готов. Попробуйте еще раз.');
      return;
    }

    setIsProcessing(true);
    
    try {
      const croppedBlob = await cropperRef.current.getCurrentCrop();
      
      if (croppedBlob) {
        onConfirm(croppedBlob);
      } else {
        alert('Не удалось обрезать изображение. Попробуйте еще раз.');
      }
    } catch (error) {
      console.error('Ошибка при обрезке изображения:', error);
      alert('Произошла ошибка при обрезке изображения.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileFormatInfo = () => {
    const type = photoFile.type;
    if (type.includes('png')) return 'PNG';
    if (type.includes('webp')) return 'WebP';
    if (type.includes('gif')) return 'GIF';
    return 'JPEG';
  };

  const getFileSizeInfo = () => {
    const sizeInMB = (photoFile.size / (1024 * 1024)).toFixed(1);
    return `${sizeInMB} МБ`;
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
            disabled={isUploading || isProcessing}
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
            <p className="text-gray-600 mb-2">
              Убедитесь, что ваше лицо находится в центре круга
            </p>
            <div className="text-sm text-gray-500">
              Формат: {getFileFormatInfo()} • Размер: {getFileSizeInfo()}
            </div>
          </div>

          {/* Cropper */}
          <div className="flex justify-center">
            {imageUrl && (
              <CircularCropper
                ref={cropperRef}
                imageUrl={imageUrl}
                onCropComplete={handleCropComplete}
                originalFile={photoFile}
                size={280}
              />
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={handleConfirm}
              disabled={isProcessing || !imageUrl}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Использовать это фото
                </>
              )}
            </Button>
            
            <Button
              onClick={onBack}
              variant="outline"
              disabled={isProcessing}
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
              <li>• Фото будет автоматически обрезано при сохранении</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoPreviewScreen;
