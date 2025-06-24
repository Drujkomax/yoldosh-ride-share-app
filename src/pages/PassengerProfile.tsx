
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, User, Phone, MessageCircle, MapPin } from 'lucide-react';

const PassengerProfile = () => {
  const navigate = useNavigate();
  const { name } = useParams();

  // Mock passenger data
  const passenger = {
    name: 'Жамшид',
    rating: 4.8,
    totalRides: 23,
    phone: '+998901111111',
    isVerified: true,
    joinDate: 'Март 2023',
    reviews: [
      {
        id: 1,
        driverName: 'Алишер Рахимов',
        rating: 5,
        comment: 'Отличный попутчик! Пунктуальный, вежливый, приятно общаться. Рекомендую!',
        date: '20 декабря 2024',
        trip: 'Ташкент → Самарканд'
      },
      {
        id: 2,
        driverName: 'Бахтиёр Каримов',
        rating: 5,
        comment: 'Очень культурный пассажир. Время в дороге пролетело незаметно!',
        date: '15 декабря 2024',
        trip: 'Самарканд → Бухара'
      },
      {
        id: 3,
        driverName: 'Умид Усманов',
        rating: 4,
        comment: 'Хороший попутчик, но немного опоздал к назначенному времени.',
        date: '10 декабря 2024',
        trip: 'Ташкент → Наманган'
      },
      {
        id: 4,
        driverName: 'Шерзод Нуров',
        rating: 5,
        comment: 'Отличный человек! Помог с навигацией, очень общительный.',
        date: '5 декабря 2024',
        trip: 'Фергана → Ташкент'
      }
    ]
  };

  const handleCall = () => {
    window.location.href = `tel:${passenger.phone}`;
  };

  const handleChat = () => {
    navigate(`/chat/${passenger.name}`);
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
            <h1 className="text-xl font-bold">Профиль пассажира</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Passenger Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-2xl font-bold">{passenger.name}</h2>
                  {passenger.isVerified && (
                    <Badge variant="secondary" className="text-xs">
                      ✓ Проверен
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{passenger.rating}</span>
                    <span>({passenger.reviews.length} отзывов)</span>
                  </div>
                  <span>{passenger.totalRides} поездок</span>
                  <span>На Yoldosh с {passenger.joinDate}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleCall}
              >
                <Phone className="h-4 w-4 mr-2" />
                Позвонить
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleChat}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Сообщение
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Отзывы водителей ({passenger.reviews.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {passenger.reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="font-medium">{review.driverName}</div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{review.trip}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-500">{review.date}</div>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PassengerProfile;
