
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Star, Car, Phone, Settings, LogOut, Shield, Loader2, Plus, CheckCircle, ChevronRight, Mail } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useProfile } from '@/hooks/useProfile';
import { useReviews } from '@/hooks/useReviews';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import BottomNavigation from '@/components/BottomNavigation';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const { profile, isLoading: profileLoading } = useProfile();
  const { reviews, isLoading: reviewsLoading } = useReviews();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('about'); // 'about' или 'account'

  const handleLogout = () => {
    setUser(null);
    navigate('/');
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
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold text-teal-900">{profile?.name || 'Bunyod'}</div>
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
              <Plus className="h-5 w-5 text-teal-600" />
              <span className="text-teal-600 font-medium">Добавить фото профиля</span>
            </div>

            {/* Verify Profile Section */}
            <div className="py-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Подтвердите свой профиль</h3>
              
              <div className="space-y-4">
                {/* Verify Passport */}
                <div className="flex items-center space-x-3">
                  <Plus className="h-5 w-5 text-teal-600" />
                  <span className="text-teal-600 font-medium">Проверить паспорт</span>
                </div>
                
                {/* Verify Email */}
                <div className="flex items-center space-x-3">
                  <Plus className="h-5 w-5 text-teal-600" />
                  <span className="text-teal-600 font-medium">Подтвердить почту khanapiyayev@icloud.com</span>
                </div>
                
                {/* Phone Verified */}
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-teal-600" />
                  <span className="text-gray-700">+79777940868</span>
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
            {/* Account Settings */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Настройки аккаунта</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Телефон</span>
                    <span className="text-gray-500">{profile?.phone}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Статус верификации</span>
                    <span className={`text-sm ${profile?.is_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                      {profile?.is_verified ? 'Подтвержден' : 'Не подтвержден'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full h-12 justify-start"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-5 w-5 mr-3" />
                Настройки
              </Button>
              
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
