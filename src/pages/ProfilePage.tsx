import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Star, Car, Phone, Settings, LogOut, Shield, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useProfile } from '@/hooks/useProfile';
import { useReviews } from '@/hooks/useReviews';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import BottomNavigation from '@/components/BottomNavigation';
const ProfilePage = () => {
  const navigate = useNavigate();
  const {
    user,
    setUser
  } = useUser();
  const {
    profile,
    isLoading: profileLoading
  } = useProfile();
  const {
    reviews,
    isLoading: reviewsLoading
  } = useReviews();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
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
  const averageRating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : profile?.rating || 0;
  if (profileLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-slate-600">Загрузка профиля...</p>
        </div>
      </div>;
  }
  if (!user || !profile) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center pb-20">
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
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-xl hover:bg-yoldosh-primary/10 p-3">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Профиль
            </h1>
            <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="rounded-xl hover:bg-yoldosh-primary/10 p-3">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Profile Info */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-center space-x-6 mb-8">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url || profilePhoto || undefined} />
                <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h2 className="text-3xl font-bold text-slate-800">{profile.name}</h2>
                  {profile.is_verified && <Badge className="bg-green-100 text-green-800 px-3 py-1">
                      <Shield className="h-4 w-4 mr-1" />
                      Проверен
                    </Badge>}
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-semibold text-lg">{averageRating.toFixed(1)}</span>
                  <span className="text-slate-600">({reviews.length} отзывов)</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{profile.phone}</span>
                </div>
              </div>
            </div>

            {profile.role === 'driver' && <div className="flex items-center space-x-3 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                <Car className="h-6 w-6 text-yoldosh-primary" />
                <span className="font-medium text-slate-800">Водитель</span>
              </div>}

            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl">
                <div className="text-3xl font-bold text-yoldosh-primary">{profile.total_rides}</div>
                <div className="text-sm text-slate-600 font-medium">Поездок</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl">
                <div className="text-3xl font-bold text-yoldosh-accent">{averageRating.toFixed(1)}</div>
                <div className="text-sm text-slate-600 font-medium">Подтвердить почту khanapiyayev@icloud.com</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl">
                <div className="text-3xl font-bold text-yoldosh-secondary">{reviews.length}</div>
                <div className="text-sm text-slate-600 font-medium">Отзывов</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-800">Последние отзывы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {reviewsLoading ? <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-gray-600">Загрузка отзывов...</p>
              </div> : reviews.length > 0 ? reviews.slice(0, 3).map(review => <div key={review.id} className="border-b border-slate-200 pb-6 last:border-b-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-slate-800">
                        {review.reviewer?.name || 'Пользователь'}
                      </span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />)}
                      </div>
                    </div>
                    <span className="text-sm text-slate-500">{formatDate(review.created_at)}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{review.comment || 'Без комментария'}</p>
                </div>) : <div className="text-center py-8">
                <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Пока нет отзывов</p>
                <p className="text-sm text-gray-500 mt-1">
                  Отзывы появятся после завершения поездок
                </p>
              </div>}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          {profile.role === 'driver' && !profile.is_verified && <Button onClick={() => navigate('/verification')} className="w-full h-14 bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-2xl">
              <Shield className="h-5 w-5 mr-2" />
              Пройти верификацию
            </Button>}
          
          <Button variant="outline" className="w-full h-14 rounded-2xl border-2 hover:scale-105 transition-all duration-300" onClick={() => navigate('/settings')}>
            <Settings className="h-5 w-5 mr-2" />
            Настройки
          </Button>
          
          <Button variant="outline" className="w-full h-14 text-red-600 border-red-200 hover:bg-red-50 rounded-2xl hover:scale-105 transition-all duration-300" onClick={handleLogout}>
            <LogOut className="h-5 w-5 mr-2" />
            Выйти из аккаунта
          </Button>
        </div>
      </div>

      <BottomNavigation />
    </div>;
};
export default ProfilePage;