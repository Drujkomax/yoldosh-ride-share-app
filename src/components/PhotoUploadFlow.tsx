
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
    const type = file.type;
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

    setIsUploading(true);

    try {
      const fileExtension = getFileExtension(selectedFile);
      const timestamp = Date.now();
      
      // Create file from blob with proper extension and type
      const file = new File([croppedBlob], `avatar-${user.id}-${timestamp}.${fileExtension}`, {
        type: croppedBlob.type
      });

      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        originalSize: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
      });

      // Upload to Supabase Storage
      const fileName = `${user.id}/${timestamp}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('Generated public URL:', publicUrl);

      // Update user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      // Update user context
      setUser({
        ...user,
        avatarUrl: publicUrl
      });

      toast.success('Фото профиля успешно обновлено!');
      onComplete(true);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Ошибка при загрузке фото. Попробуйте еще раз.');
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
