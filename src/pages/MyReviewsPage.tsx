
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Star, User } from 'lucide-react';

const MyReviewsPage = () => {
  const navigate = useNavigate();

  const reviews = [
    {
      id: 1,
      reviewer: 'Шерзод Исламов',
      rating: 5,
      comment: 'Отличный пассажир! Пунктуальный, вежливый. Рекомендую!',
      date: '20 декабря 2024',
      trip: 'Ташкент → Самарканд'
    },
    {
      id: 2,
      reviewer: 'Азиз Каримов',
      rating: 4,
      comment: 'Хороший попутчик, приятно было ехать вместе.',
      date: '18 декабря 2024',
      trip: 'Самарканд → Бухара'
    },
    {
      id: 3,
      reviewer: 'Дильшод Рахимов',
      rating: 5,
      comment: 'Очень культурный и общительный человек. Время в дороге пролетело незаметно!',
      date: '10 декабря 2024',
      trip: 'Ташкент → Наманган'
    }
  ];

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

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
              Мои отзывы
            </h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Rating Summary */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl mb-8">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-yoldosh-primary mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${
                      i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-slate-600">Основано на {reviews.length} отзывах</p>
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{review.reviewer}</h3>
                      <p className="text-sm text-slate-600">{review.trip}</p>
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
                    <p className="text-sm text-slate-500">{review.date}</p>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyReviewsPage;
