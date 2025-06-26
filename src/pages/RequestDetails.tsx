
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MapPin, Calendar, Users, Star, User, MessageCircle, Phone, Shield, Car, Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useRideRequests } from '@/hooks/useRideRequests';

const RequestDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTheme();
  const { requests, respondToRequest, isResponding } = useRideRequests();
  const [responseMessage, setResponseMessage] = useState('');

  // Находим заявку по ID
  const request = requests.find(r => r.id === id);

  const handleSendResponse = async () => {
    if (!responseMessage.trim() || !id) {
      return;
    }
    
    try {
      await respondToRequest({ requestId: id, message: responseMessage });
      navigate('/search-requests');
    } catch (error) {
      console.error('Ошибка отправки отклика:', error);
    }
  };

  const handleCall = () => {
    if (request?.passenger?.phone) {
      window.location.href = `tel:${request.passenger.phone}`;
    }
  };

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Заявка не найдена</h2>
            <Button onClick={() => navigate('/search-requests')} className="bg-gradient-primary">
              Вернуться к заявкам
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-lg border-b border-white/20 dark:border-slate-700/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="hover:bg-yoldosh-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back')}
            </Button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">Детали заявки</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Passenger Info */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
              <User className="h-6 w-6 mr-3 text-yoldosh-primary" />
              Информация о пассажире
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{request.passenger?.name || 'Пассажир'}</h3>
                  {request.passenger?.is_verified && (
                    <Badge className="bg-yoldosh-success/20 text-yoldosh-success border-0">
                      <Shield className="h-3 w-3 mr-1" />
                      {t('verified')}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{request.passenger?.rating || 0}</span>
                    <span>({request.passenger?.total_rides || 0} поездок)</span>
                  </div>
                </div>
              </div>
              {request.passenger?.phone && (
                <Button
                  onClick={handleCall}
                  className="bg-yoldosh-success hover:bg-green-700 rounded-xl"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Позвонить
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trip Details */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
              <MapPin className="h-6 w-6 mr-3 text-yoldosh-secondary" />
              Детали поездки
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-2xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-5 w-5 text-yoldosh-primary" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Маршрут</span>
                  </div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    {request.from_city} → {request.to_city}
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-4 rounded-2xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-5 w-5 text-yoldosh-success" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Предпочитаемая дата</span>
                  </div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    {new Date(request.preferred_date).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-2xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-5 w-5 text-yoldosh-accent" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Пассажиры</span>
                  </div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{request.passengers_count} человек(а)</div>
                </div>
                
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-2xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">💰</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Готов заплатить до</span>
                  </div>
                  <div className="text-xl font-bold text-yoldosh-success">
                    {request.max_price_per_seat.toLocaleString()} {t('sum')}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {request.description && (
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 p-4 rounded-2xl">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageCircle className="h-5 w-5 text-yoldosh-primary" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Описание</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 italic">"{request.description}"</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Response Section */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
              <MessageCircle className="h-6 w-6 mr-3 text-yoldosh-accent" />
              Отправить отклик
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                Сообщение пассажиру
              </label>
              <Textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Здравствуйте! Я готов взять вас в поездку. У меня чистая машина, еду аккуратно..."
                className="min-h-24 rounded-xl border-2 bg-white/80 dark:bg-slate-700/80"
              />
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Опишите ваши условия, время отправления, характеристики автомобиля
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1 rounded-xl border-slate-300 dark:border-slate-600"
              >
                Отмена
              </Button>
              <Button
                onClick={handleSendResponse}
                disabled={isResponding || !responseMessage.trim()}
                className="flex-1 bg-gradient-accent hover:scale-105 transition-all duration-300 rounded-xl"
              >
                {isResponding ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Отправляем...
                  </>
                ) : (
                  'Отправить отклик'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RequestDetails;
