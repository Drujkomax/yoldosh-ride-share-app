import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

const AboutMePage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const { profile, updateProfile } = useProfile();
  
  const [aboutText, setAboutText] = useState(profile?.about || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!aboutText.trim()) {
      toast.error('Пожалуйста, введите информацию о себе');
      return;
    }

    setIsLoading(true);
    try {
      // Обновляем профиль в БД
      await updateProfile({
        about: aboutText.trim()
      });

      // Обновляем данные пользователя в контексте
      if (user) {
        const updatedUser = {
          ...user,
          about: aboutText.trim()
        };
        setUser(updatedUser);
      }

      toast.success('Информация о себе сохранена');
      navigate('/profile');
    } catch (error) {
      console.error('Ошибка при сохранении информации о себе:', error);
      toast.error('Ошибка при сохранении');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/profile')}
            className="p-2"
          >
            <ArrowLeft className="h-6 w-6 text-teal-600" />
          </Button>
          <h1 className="text-xl font-bold text-teal-900">О себе</h1>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="text-teal-600 hover:text-teal-700 font-medium bg-transparent hover:bg-transparent p-0"
          >
            {isLoading ? 'Сохранение...' : 'Готово'}
          </Button>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Расскажите немного о себе
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Эта информация поможет другим пользователям узнать вас лучше. 
              Опишите свои интересы, хобби или что-то интересное о себе.
            </p>
          </div>

          <Textarea
            value={aboutText}
            onChange={(e) => setAboutText(e.target.value)}
            placeholder="Например: Люблю путешествовать, читать книги и слушать музыку. Работаю в IT сфере. Предпочитаю поездки в тишине или с приятной беседой."
            className="min-h-[200px] text-base resize-none"
            maxLength={500}
          />

          <div className="text-right text-sm text-gray-500">
            {aboutText.length}/500 символов
          </div>

          <Button
            onClick={handleSave}
            disabled={isLoading || !aboutText.trim()}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg"
          >
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutMePage;