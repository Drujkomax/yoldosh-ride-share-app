
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Star, Car, Phone, Settings, LogOut, Shield } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  // Mock profile data
  const profile = {
    name: 'Алишер Каримов',
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

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <h1 className="text-xl font-bold">Профиль</h1>
            <Button
              variant="ghost"
              size="sm"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  {user?.isVerified && (
                    <Badge className="bg-green-100 text-green-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Проверен
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-1 mb-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{profile.rating}</span>
                  <span className="text-gray-500">({profile.reviews} отзывов)</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{user?.phone}</span>
                </div>
              </div>
            </div>

            {user?.role === 'driver' && profile.carInfo && (
              <div className="flex items-center space-x-2 mb-4 p-3 bg-blue-50 rounded-lg">
                <Car className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">{profile.carInfo}</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-yoldosh-blue">{profile.completedRides}</div>
                <div className="text-sm text-gray-600">Поездок</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yoldosh-green">{profile.rating}</div>
                <div className="text-sm text-gray-600">Рейтинг</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yoldosh-orange">{profile.reviews}</div>
                <div className="text-sm text-gray-600">Отзывов</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card>
          <CardHeader>
            <CardTitle>Отзывы пассажиров</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentReviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{review.passenger}</span>
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
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {user?.role === 'driver' && !user?.isVerified && (
            <Button 
              onClick={() => navigate('/verification')}
              className="w-full bg-yoldosh-blue hover:bg-blue-700"
            >
              <Shield className="h-4 w-4 mr-2" />
              Пройти верификацию
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="w-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            Настройки
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Выйти из аккаунта
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
