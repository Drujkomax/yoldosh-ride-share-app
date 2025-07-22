
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import PhotoInstructionsScreen from './PhotoInstructionsScreen';
import PhotoCaptureScreen from './PhotoCaptureScreen';
import PhotoPreviewScreen from './PhotoPreviewScreen';

interface PhotoUploadFlowProps {
  onComplete: (uploaded: boolean) => void;
  onBack: () => void;
}

type FlowStep = 'instructions' | 'capture' | 'preview';

const PhotoUploadFlow = ({ onComplete, onBack }: PhotoUploadFlowProps) => {
  const { user, setUser } = useUser();
  const [currentStep, setCurrentStep] = useState<FlowStep>('instructions');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleInstructionsContinue = () => {
    setCurrentStep('capture');
  };

  const handlePhotoSelected = (file: File) => {
    console.log('Selected file:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
    });
    setSelectedFile(file);
    setCurrentStep('preview');
  };

  const getFileExtension = (file: File) => {
    const type = file.type.toLowerCase();
    if (type.includes('png')) return 'png';
    if (type.includes('webp')) return 'webp';
    if (type.includes('gif')) return 'gif';
    return 'jpg';
  };

  const handlePhotoConfirm = async (croppedBlob: Blob) => {
    if (!user?.id) {
      toast.error('Пользователь не найден');
      return;
    }

    if (!selectedFile) {
      toast.error('Файл не выбран');
      return;
    }

    console.log('Starting photo upload process...');
    setIsUploading(true);

    try {
      const fileExtension = getFileExtension(selectedFile);
      const timestamp = Date.now();
      
      // Создаем File из blob с правильным типом и расширением
      const fileName = `avatar-${user.id}-${timestamp}.${fileExtension}`;
      const file = new File([croppedBlob], fileName, {
        type: croppedBlob.type
      });

      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        originalSize: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
      });

      // Загружаем в Supabase Storage
      const storagePath = `${user.id}/${timestamp}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(storagePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Ошибка загрузки: ${uploadError.message}`);
      }

      console.log('File uploaded successfully to:', storagePath);

      // Получаем публичный URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(storagePath);

      console.log('Generated public URL:', publicUrl);

      if (!publicUrl) {
        throw new Error('Не удалось получить URL изображения');
      }

      // Обновляем профиль пользователя
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error(`Ошибка обновления профиля: ${updateError.message}`);
      }

      console.log('Profile updated successfully with new avatar URL');

      // Обновляем контекст пользователя
      setUser({
        ...user,
        avatarUrl: publicUrl
      });

      toast.success('Фото профиля успешно обновлено!');
      onComplete(true);
    } catch (error) {
      console.error('Error uploading photo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      toast.error(`Ошибка при загрузке фото: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'instructions':
        onBack();
        break;
      case 'capture':
        setCurrentStep('instructions');
        break;
      case 'preview':
        setCurrentStep('capture');
        setSelectedFile(null);
        break;
    }
  };

  switch (currentStep) {
    case 'instructions':
      return (
        <PhotoInstructionsScreen
          onContinue={handleInstructionsContinue}
          onBack={handleBack}
        />
      );
    case 'capture':
      return (
        <PhotoCaptureScreen
          onPhotoSelected={handlePhotoSelected}
          onBack={handleBack}
        />
      );
    case 'preview':
      return selectedFile ? (
        <PhotoPreviewScreen
          photoFile={selectedFile}
          onConfirm={handlePhotoConfirm}
          onBack={handleBack}
          isUploading={isUploading}
        />
      ) : null;
    default:
      return null;
  }
};

export default PhotoUploadFlow;
