
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Phone, Star, MapPin, Calendar, MessageSquare, Car } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useReviews } from '@/hooks/useReviews';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { reviews, isLoading } = useReviews();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Профиль недоступен</h2>
            <p className="text-gray-600 mb-4">Войдите в систему для просмотра профиля</p>
            <Button onClick={() => navigate('/')}>
              Вернуться на главную
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
    : 0;

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
            <div></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* User Info Card */}
        <Card className="bg-white rounded-2xl shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">{user.name || 'Пользователь'}</CardTitle>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <Phone className="h-4 w-4 text-blue-500" />
              <span className="text-gray-600">{user.phone}</span>
            </div>
          </CardHeader>
          <CardContent>
            {/* Car Info for Drivers */}
            {user.role === 'driver' && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Car className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">Информация о машине</span>
                </div>
                <p className="text-gray-700">
                  Информация будет отображаться после добавления данных о машине
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Star className="h-5 w-5 text-amber-500" />
                  <span className="text-2xl font-bold text-gray-800">
                    {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Рейтинг</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {user.totalRides || 0}
                </div>
                <p className="text-sm text-gray-600">Поездок</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {reviews.length}
                </div>
                <p className="text-sm text-gray-600">Отзывов</p>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <Badge variant="outline" className={`${
                user.isVerified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}>
                {user.isVerified ? '✓ Верифицирован' : 'Не верифицирован'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card className="bg-white rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
              Отзывы ({reviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">
                <p className="text-gray-600">Загрузка отзывов...</p>
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {review.reviewer?.name || 'Пользователь'}
                          </p>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating ? 'text-amber-500 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 text-sm">{review.comment}</p>
                    )}
                    {review.booking?.ride && (
                      <div className="mt-2 text-xs text-gray-500 flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {review.booking.ride.from_city} → {review.booking.ride.to_city}
                        </span>
                        <Calendar className="h-3 w-3 ml-2" />
                        <span>{formatDate(review.booking.ride.departure_date)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Пока нет отзывов</p>
                <p className="text-sm text-gray-500 mt-1">
                  Отзывы появятся после завершения поездок
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
