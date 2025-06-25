import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Star, Car, Phone, Settings, LogOut, Shield } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useUser();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // Mock profile data
  const profile = {
    name: user?.name || 'Пользователь',
    rating: 4.8,
    reviews: 24,
    completedRides: 12,
    joinedDate: 'Декабрь 2024',
    carInfo: user?.role === 'driver' ? 'Chevrolet Lacetti, белый' : null
  };

  const recentReviews = [
    {
      id: 1,
      passenger: 'Жасур',
      rating: 5,
      comment: 'Отличный водитель, вежливый и пунктуальный. Рекомендую!',
      date: '20 декабря 2024'
    },
    {
      id: 2,
      passenger: 'Дильшод',
      rating: 4,
      comment: 'Хорошая поездка, но немного опоздали',
      date: '18 декабря 2024'
    },
    {
      id: 3,
      passenger: 'Азиза',
      rating: 5,
      comment: 'Очень комфортная поездка, спасибо!',
      date: '15 декабря 2024'
    }
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="rounded-xl hover:bg-yoldosh-primary/10 p-3"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Профиль
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
              className="rounded-xl hover:bg-yoldosh-primary/10 p-3"
            >
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
                <AvatarImage src={profilePhoto || undefined} />
                <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h2 className="text-3xl font-bold text-slate-800">{profile.name}</h2>
                  {user?.is_verified && (
                    <Badge className="bg-green-100 text-green-800 px-3 py-1">
                      <Shield className="h-4 w-4 mr-1" />
                      Проверен
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-semibold text-lg">{profile.rating}</span>
                  <span className="text-slate-600">({profile.reviews} отзывов)</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{user?.phone}</span>
                </div>
              </div>
            </div>

            {user?.role === 'driver' && profile.carInfo && (
              <div className="flex items-center space-x-3 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                <Car className="h-6 w-6 text-yoldosh-primary" />
                <span className="font-medium text-slate-800">{profile.carInfo}</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl">
                <div className="text-3xl font-bold text-yoldosh-primary">{profile.completedRides}</div>
                <div className="text-sm text-slate-600 font-medium">Поездок</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl">
                <div className="text-3xl font-bold text-yoldosh-accent">{profile.rating}</div>
                <div className="text-sm text-slate-600 font-medium">Рейтинг</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl">
                <div className="text-3xl font-bold text-yoldosh-secondary">{profile.reviews}</div>
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
            {recentReviews.map((review) => (
              <div key={review.id} className="border-b border-slate-200 pb-6 last:border-b-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-slate-800">{review.passenger}</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-slate-500">{review.date}</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          {user?.role === 'driver' && !user?.is_verified && (
            <Button 
              onClick={() => navigate('/verification')}
              className="w-full h-14 bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-2xl"
            >
              <Shield className="h-5 w-5 mr-2" />
              Пройти верификацию
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="w-full h-14 rounded-2xl border-2 hover:scale-105 transition-all duration-300"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-5 w-5 mr-2" />
            Настройки
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full h-14 text-red-600 border-red-200 hover:bg-red-50 rounded-2xl hover:scale-105 transition-all duration-300"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Выйти из аккаунта
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
