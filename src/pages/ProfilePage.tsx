
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Star, Car, Phone, Settings, LogOut, Shield, Loader2, Plus, CheckCircle, ChevronRight, Mail, MessageSquare, Users, Bell, Moon, Lock, CreditCard, Wallet, HelpCircle, Gift, Zap } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useProfile } from '@/hooks/useProfile';
import { useReviews } from '@/hooks/useReviews';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import BottomNavigation from '@/components/BottomNavigation';
import PhotoUploadFlow from '@/components/PhotoUploadFlow';
import UserAvatar from '@/components/UserAvatar';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const { profile, isLoading: profileLoading } = useProfile();
  const { reviews, isLoading: reviewsLoading } = useReviews();
  const [activeTab, setActiveTab] = useState('about');
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  const handleLogout = () => {
    setUser(null);
    navigate('/');
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
    : profile?.rating || 0;

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

  if (!user || !profile) {
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
      onClick: () => console.log('Пароль')
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
        <div className="px-4 py-4">
          <div className="flex justify-center mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1 w-full max-w-md">
              <button
                onClick={() => setActiveTab('about')}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'about'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                О себе
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
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

      <div className="px-4 space-y-6">
        {activeTab === 'about' && (
          <>
            {/* Profile Info */}
            <div className="flex items-center space-x-4 py-4 cursor-pointer" onClick={() => navigate('/edit-profile')}>
              <div className="relative">
                <UserAvatar size="lg" />
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold text-teal-900">{user?.name || 'Пользователь'}</div>
                <div className="text-gray-500">Новичок</div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>

            {/* Edit Profile Link */}
            <button 
              onClick={() => navigate('/edit-profile')}
              className="w-full text-left text-teal-600 font-medium py-2"
            >
              Редактировать информацию о себе
            </button>

            {/* Add Photo */}
            <div className="flex items-center space-x-3 py-4">
              {user?.avatarUrl ? (
                <button 
                  onClick={() => setShowPhotoUpload(true)}
                  className="flex items-center space-x-3 text-teal-600 font-medium"
                >
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Изменить фото профиля</span>
                </button>
              ) : (
                <button 
                  onClick={() => setShowPhotoUpload(true)}
                  className="flex items-center space-x-3 text-teal-600 font-medium"
                >
                  <Plus className="h-5 w-5 text-teal-600" />
                  <span className="text-teal-600 font-medium">Добавить фото профиля</span>
                </button>
              )}
            </div>

            {/* Verify Profile Section */}
            <div className="py-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Подтвердите свой профиль</h3>
              
              <div className="space-y-4">
                {/* Verify Passport */}
                <button 
                  onClick={() => navigate('/myid-verification')}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5 text-teal-600" />
                  <span className="text-teal-600 font-medium">Проверить паспорт</span>
                </button>
                
                {/* Verify Email */}
                <div className="flex items-center space-x-3">
                  <Plus className="h-5 w-5 text-teal-600" />
                  <span className="text-teal-600 font-medium">Подтвердить почту {profile?.email || 'Не указана'}</span>
                </div>
                
                {/* Phone Verified */}
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-teal-600" />
                  <span className="text-gray-700">{profile?.phone}</span>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">О себе</h3>
              
              <div className="space-y-4">
                {/* Tell About Yourself */}
                <div className="flex items-center space-x-3">
                  <Plus className="h-5 w-5 text-teal-600" />
                  <span className="text-teal-600 font-medium">Расскажите немного о себе</span>
                </div>
                
                {/* Trip Preferences */}
                <div className="flex items-center space-x-3">
                  <Plus className="h-5 w-5 text-teal-600" />
                  <span className="text-teal-600 font-medium">Смена опций поездки</span>
                </div>
              </div>
            </div>

            {/* Cars Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Машины</h3>
              
              <div className="flex items-center space-x-4 py-4 cursor-pointer" onClick={() => navigate('/manage-cars')}>
                <Car className="h-6 w-6 text-gray-400" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">HYUNDAI ACCENT</div>
                  <div className="text-gray-500 text-sm">Бежевый</div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </>
        )}

        {activeTab === 'account' && (
          <div className="space-y-6">
            {/* Account Settings Menu */}
            <div className="bg-white rounded-lg divide-y divide-gray-100">
              {accountMenuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5 text-teal-600" />
                    <span className="text-gray-900 font-medium">{item.title}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              ))}
            </div>

            {/* Logout Button */}
            <div className="pt-4">
              <Button 
                variant="outline" 
                className="w-full h-12 justify-start text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Выйти из аккаунта
              </Button>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ProfilePage;
