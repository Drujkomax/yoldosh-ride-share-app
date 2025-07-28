
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, User, Star, Car, Phone, Settings, LogOut, Shield, Loader2, Plus, CheckCircle, ChevronRight, Mail, MessageSquare, Users, Bell, Moon, Lock, CreditCard, Wallet, HelpCircle, Gift, Zap } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useProfile } from '@/hooks/useProfile';
import { useReviews } from '@/hooks/useReviews';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import BottomNavigation from '@/components/BottomNavigation';
import PhotoUploadFlow from '@/components/PhotoUploadFlow';
import UserAvatar from '@/components/UserAvatar';
import { supabase } from '@/integrations/supabase/client';

const ProfilePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, setUser } = useUser();
  const { profile, isLoading: profileLoading } = useProfile();
  const { reviews, isLoading: reviewsLoading } = useReviews();
  const [activeTab, setActiveTab] = useState('about');
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  // Принудительно обновляем данные профиля при заходе на страницу
  useEffect(() => {
    if (user?.id) {
      console.log('ProfilePage - Принудительное обновление данных профиля');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  }, [user?.id, queryClient]);
  
  // Используем данные из профиля, а если их нет - из контекста пользователя
  const displayProfile = profile || {
    ...user,
    first_name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar_url: user?.avatarUrl || ''
  };

  const handleLogout = async () => {
    try {
      console.log('Выход из системы...');
      await supabase.auth.signOut();
      setUser(null);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handlePhotoUploadComplete = (uploaded: boolean) => {
    setShowPhotoUpload(false);
    if (uploaded) {
      // Photo was uploaded successfully, the user context is already updated
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : displayProfile?.rating || 0;

  if (showPhotoUpload) {
    return (
      <PhotoUploadFlow
        onComplete={handlePhotoUploadComplete}
        onBack={() => setShowPhotoUpload(false)}
      />
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-slate-600">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center pb-20">
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Профиль недоступен</h2>
            <p className="text-gray-600 mb-4">Войдите в систему для просмотра профиля</p>
            <Button onClick={() => navigate('/')}>
              Вернуться на главную
            </Button>
          </div>
        </Card>
        <BottomNavigation />
      </div>
    );
  }

  const accountMenuItems = [
    {
      icon: MessageSquare,
      title: "Отзывы",
      onClick: () => navigate('/my-reviews')
    },
    {
      icon: Users,
      title: "Сохраненные пассажиры",
      onClick: () => navigate('/settings/saved-passengers')
    },
    {
      icon: Bell,
      title: "Настройки уведомлений",
      onClick: () => navigate('/settings/notifications')
    },
    {
      icon: Moon,
      title: "Тема приложения",
      onClick: () => navigate('/settings/theme')
    },
    {
      icon: Lock,
      title: "Пароль",
      onClick: () => navigate('/settings/password')
    },
    {
      icon: Mail,
      title: "Почтовый адрес",
      onClick: () => console.log('Почтовый адрес')
    },
    {
      icon: CreditCard,
      title: "Способы получения выплат",
      onClick: () => console.log('Способы получения выплат')
    },
    {
      icon: Wallet,
      title: "Выплаты",
      onClick: () => console.log('Выплаты')
    },
    {
      icon: CreditCard,
      title: "Способы оплаты",
      onClick: () => console.log('Способы оплаты')
    },
    {
      icon: CreditCard,
      title: "Платежи и возвраты",
      onClick: () => console.log('Платежи и возвраты')
    },
    {
      icon: Gift,
      title: "Спецпредложения",
      onClick: () => console.log('Спецпредложения')
    },
    {
      icon: Star,
      title: "Оцените приложение",
      onClick: () => console.log('Оцените приложение')
    },
    {
      icon: HelpCircle,
      title: "Помощь",
      onClick: () => console.log('Помощь')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with Tabs */}
      <div className="bg-white">
        <div className="px-3 py-3">
          <div className="flex justify-center mb-4">
            <div className="flex bg-gray-100 rounded-lg p-1 w-full max-w-md">
              <button
                onClick={() => setActiveTab('about')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'about'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                О себе
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'account'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                Учетная запись
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 space-y-4">
        {activeTab === 'about' && (
          <>
            {/* Profile Info */}
            <div className="flex items-center space-x-3 py-3 cursor-pointer" onClick={() => navigate('/edit-profile')}>
              <div className="relative">
                <UserAvatar size="md" />
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-teal-900">{user?.name || 'Пользователь'}</div>
                <div className="text-gray-500 text-sm">Новичок</div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>

            {/* Edit Profile Link */}
            <button 
              onClick={() => navigate('/edit-profile')}
              className="w-full text-left text-teal-600 font-medium py-1 text-sm"
            >
              Редактировать информацию о себе
            </button>

            {/* Add Photo */}
            <div className="flex items-center space-x-3 py-2">
              {displayProfile?.avatar_url ? (
                <button 
                  onClick={() => setShowPhotoUpload(true)}
                  className="flex items-center space-x-2 text-teal-600 font-medium text-sm"
                >
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Изменить фото профиля</span>
                </button>
              ) : (
                <button 
                  onClick={() => setShowPhotoUpload(true)}
                  className="flex items-center space-x-2 text-teal-600 font-medium text-sm"
                >
                  <Plus className="h-4 w-4 text-teal-600" />
                  <span className="text-teal-600 font-medium">Добавить фото профиля</span>
                </button>
              )}
            </div>

            {/* Verify Profile Section */}
            <div className="py-3">
              <h3 className="text-base font-bold text-gray-900 mb-3">Подтвердите свой профиль</h3>
              
              <div className="space-y-2">
                {/* Verify Passport */}
                <button 
                  onClick={() => navigate('/myid-verification')}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4 text-teal-600" />
                  <span className="text-teal-600 font-medium text-sm">Проверить паспорт</span>
                </button>
                
                {/* Email */}
                <div className="flex items-center space-x-2 p-2">
                  {displayProfile?.email ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-teal-600" />
                      <span className="text-gray-700 text-sm">{displayProfile.email}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 text-teal-600" />
                      <span className="text-teal-600 font-medium text-sm">Добавить почту</span>
                    </>
                  )}
                </div>
                
                 {/* Phone Verified */}
                <div className="flex items-center space-x-2 p-2">
                  <CheckCircle className="h-4 w-4 text-teal-600" />
                  <span className="text-gray-700 text-sm">{displayProfile?.phone}</span>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="border-t border-gray-200 pt-3">
              <h3 className="text-base font-bold text-gray-900 mb-3">О себе</h3>
              
              <div className="space-y-2">
                {/* Tell About Yourself */}
                <button 
                  onClick={() => navigate('/about-me')}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4 text-teal-600" />
                  <span className="text-teal-600 font-medium text-sm">Расскажите немного о себе</span>
                </button>
                
                {/* Trip Preferences */}
                <div className="flex items-center space-x-2 p-2">
                  <Plus className="h-4 w-4 text-teal-600" />
                  <span className="text-teal-600 font-medium text-sm">Смена опций поездки</span>
                </div>
              </div>
            </div>

            {/* Cars Section */}
            <div className="border-t border-gray-200 pt-3">
              <h3 className="text-base font-bold text-gray-900 mb-3">Машины</h3>
              
              <div className="flex items-center space-x-3 py-3 cursor-pointer" onClick={() => navigate('/manage-cars')}>
                <Car className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">HYUNDAI ACCENT</div>
                  <div className="text-gray-500 text-xs">Бежевый</div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </>
        )}

        {activeTab === 'account' && (
          <div className="space-y-4">
            {/* Account Settings Menu */}
            <div className="bg-white rounded-lg divide-y divide-gray-100">
              {accountMenuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-4 w-4 text-teal-600" />
                    <span className="text-gray-900 font-medium text-sm">{item.title}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </div>

            {/* Logout Button */}
            <div className="pt-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full h-10 justify-start text-red-600 border-red-200 hover:bg-red-50 text-sm"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Выйти из аккаунта
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Выйти из аккаунта?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Вы уверены, что хотите выйти из аккаунта? Вам потребуется войти заново для доступа к вашему профилю.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                      Выйти
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ProfilePage;
