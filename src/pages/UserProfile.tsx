import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Star, Car, Phone, Shield, Loader2, MessageCircle } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  // Загружаем профиль пользователя
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  // Загружаем отзывы пользователя
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['user-reviews', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles!reviews_reviewer_id_fkey (
            name, avatar_url
          )
        `)
        .eq('reviewed_user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId
  });

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

  const handleSendMessage = () => {
    // Функция для отправки сообщения (создание чата)
    // Здесь можно добавить логику создания чата и перехода к нему
    console.log('Send message to user:', userId);
  };

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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Пользователь не найден</h2>
            <p className="text-gray-600 mb-4">Профиль пользователя недоступен</p>
            <Button onClick={() => navigate(-1)}>
              Вернуться назад
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Профиль пользователя
            </h1>
            <div className="w-12" /> {/* Spacer */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Profile Info */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-center space-x-6 mb-8">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h2 className="text-3xl font-bold text-slate-800">{profile.name}</h2>
                  {profile.is_verified && (
                    <Badge className="bg-green-100 text-green-800 px-3 py-1">
                      <Shield className="h-4 w-4 mr-1" />
                      Проверен
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-semibold text-lg">{averageRating.toFixed(1)}</span>
                  <span className="text-slate-600">({reviews.length} отзывов)</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center text-slate-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 text-center mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl">
                <div className="text-3xl font-bold text-yoldosh-primary">{profile.total_rides || 0}</div>
                <div className="text-sm text-slate-600 font-medium">Поездок</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl">
                <div className="text-3xl font-bold text-yoldosh-accent">{averageRating.toFixed(1)}</div>
                <div className="text-sm text-slate-600 font-medium">Рейтинг</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl">
                <div className="text-3xl font-bold text-yoldosh-secondary">{reviews.length}</div>
                <div className="text-sm text-slate-600 font-medium">Отзывов</div>
              </div>
            </div>

            {/* Action Button */}
            <Button 
              onClick={handleSendMessage}
              className="w-full h-14 bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-2xl"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Написать сообщение
            </Button>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-800">Отзывы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {reviewsLoading ? (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-gray-600">Загрузка отзывов...</p>
              </div>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="border-b border-slate-200 pb-6 last:border-b-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={review.reviewer?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {review.reviewer?.name?.split(' ').map(n => n[0]).join('') || 'П'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-slate-800">
                        {review.reviewer?.name || 'Пользователь'}
                      </span>
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
                    <span className="text-sm text-slate-500">{formatDate(review.created_at)}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{review.comment || 'Без комментария'}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
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

export default UserProfile;