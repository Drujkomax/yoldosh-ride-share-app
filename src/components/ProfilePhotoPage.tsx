import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Image, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProfilePhotoPageProps {
  onComplete: (uploaded: boolean) => void;
  onBack: () => void;
}

const ProfilePhotoPage = ({ onComplete, onBack }: ProfilePhotoPageProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  const handleYes = () => {
    setShowUploadOptions(true);
  };

  const handleNo = () => {
    onComplete(false);
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Пользователь не авторизован');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Фото загружено!",
        description: "Ваше фото профиля успешно обновлено"
      });

      onComplete(true);
    } catch (error) {
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить фото. Попробуйте еще раз",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'camera';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    };
    input.click();
  };

  const handleGallerySelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    };
    input.click();
  };

  if (showUploadOptions) {
    return (
      <div className="fixed inset-0 bg-background z-50">
        {/* Header */}
        <div className="bg-background shadow-sm border-b border-border">
          <div className="flex items-center justify-between p-4">
            <Button variant="ghost" onClick={() => setShowUploadOptions(false)} className="p-2">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Выберите фото</h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Добавьте фото профиля
            </h2>
            <p className="text-muted-foreground">
              Выберите способ добавления фотографии
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleCameraCapture}
              disabled={isUploading}
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
                    Сделайте новое фото с помощью камеры
                  </div>
                </div>
              </div>
            </Button>

            <Button
              onClick={handleGallerySelect}
              disabled={isUploading}
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
                    Выберите фото из галереи устройства
                  </div>
                </div>
              </div>
            </Button>
          </div>

          {isUploading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Загрузка фото...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50">
      {/* Header */}
      <div className="bg-background shadow-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Фото профиля</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Camera className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Добавь в профиль свое фото
          </h2>
          <p className="text-muted-foreground">
            Пассажиры захотят узнать, с кем они едут
          </p>
        </div>

        <div className="bg-muted/30 rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-2">Почему это важно?</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Увеличивает доверие пассажиров</li>
            <li>• Помогает легче найти друг друга при встрече</li>
            <li>• Повышает количество бронирований</li>
          </ul>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleYes}
            className="w-full justify-center p-4 h-auto bg-primary hover:bg-primary/90"
          >
            <div className="flex items-center space-x-3">
              <Camera className="h-5 w-5" />
              <span className="font-semibold text-lg">Да, добавить фото</span>
            </div>
          </Button>

          <Button
            onClick={handleNo}
            variant="outline"
            className="w-full justify-center p-4 h-auto"
          >
            <span className="font-semibold text-lg">Пропустить</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhotoPage;