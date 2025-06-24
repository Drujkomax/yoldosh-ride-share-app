
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MapPin, Calendar, Users, Star, User, Minus, Plus } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';

const BookRide = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTheme();
  const { user } = useUser();
  const [bookingData, setBookingData] = useState({
    seats: 1,
    comment: ''
  });

  // Mock ride data
  const ride = {
    id: 1,
    driver: {
      name: 'Бахтиёр',
      rating: 4.8,
      reviews: 45,
      phone: '+998901234567',
      isVerified: true
    },
    from: 'Ташкент',
    to: 'Самарканд',
    date: '25 декабря',
    time: '09:00',
    availableSeats: 3,
    totalSeats: 4,
    price: 50000,
    car: 'Chevrolet Lacetti',
    features: ['Кондиционер', 'Музыка', 'Некурящий']
  };

  const quickComments = [
    'Буду вовремя',
    'С багажом',
    'Без багажа',
    'Могу подождать 5-10 минут',
    'Нужна остановка по пути'
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const handleSeatsChange = (increment: boolean) => {
    if (increment && bookingData.seats < ride.availableSeats) {
      setBookingData(prev => ({ ...prev, seats: prev.seats + 1 }));
    } else if (!increment && bookingData.seats > 1) {
      setBookingData(prev => ({ ...prev, seats: prev.seats - 1 }));
    }
  };

  const handleQuickComment = (comment: string) => {
    const currentComment = bookingData.comment;
    const newComment = currentComment ? `${currentComment}, ${comment}` : comment;
    setBookingData(prev => ({ ...prev, comment: newComment }));
  };

  const handleBooking = () => {
    console.log('Booking data:', bookingData);
    alert('Запрос на бронирование отправлен! Водитель свяжется с вами в ближайшее время.');
    navigate('/passenger');
  };

  const totalPrice = ride.price * bookingData.seats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-lg border-b border-white/20 dark:border-slate-700/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="hover:bg-yoldosh-primary/10 hover:scale-105 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back')}
            </Button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">Бронирование поездки</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Ride Info */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-yoldosh-blue rounded-xl flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-xl text-slate-800 dark:text-slate-200">{ride.from} → {ride.to}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{ride.date} в {ride.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{ride.availableSeats} доступно мест</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-2xl text-yoldosh-success">
                  {ride.price.toLocaleString()} {t('sum')}
                </div>
                <div className="text-sm text-slate-500">за место</div>
              </div>
            </div>

            {/* Driver Info */}
            <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
              <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{ride.driver.name}</span>
                  {ride.driver.isVerified && (
                    <Badge variant="secondary" className="text-xs bg-yoldosh-success/20 text-yoldosh-success">
                      ✓ {t('verified')}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-slate-600 dark:text-slate-400">{ride.driver.rating}</span>
                  <span className="text-gray-500">({ride.driver.reviews} {t('reviews')})</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Form */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-slate-800 dark:text-slate-200">Данные для бронирования</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Info Display */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Пассажир</div>
              <div className="font-medium text-slate-800 dark:text-slate-200">{user?.name}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{user?.phone}</div>
            </div>

            {/* Seats Selection */}
            <div>
              <label className="block text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">
                Количество мест
              </label>
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSeatsChange(false)}
                  disabled={bookingData.seats <= 1}
                  className="h-10 w-10 rounded-full hover:scale-110 transition-all duration-300"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  max={ride.availableSeats}
                  value={bookingData.seats}
                  onChange={(e) => {
                    const value = Math.max(1, Math.min(ride.availableSeats, parseInt(e.target.value) || 1));
                    handleInputChange('seats', value);
                  }}
                  className="w-20 text-center h-12 rounded-xl border-2 bg-white/80 dark:bg-slate-700/80 font-bold text-lg"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSeatsChange(true)}
                  disabled={bookingData.seats >= ride.availableSeats}
                  className="h-10 w-10 rounded-full hover:scale-110 transition-all duration-300"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-slate-500">из {ride.availableSeats} доступных</span>
              </div>
            </div>

            {/* Quick Comment Buttons */}
            <div>
              <label className="block text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">
                Быстрые комментарии
              </label>
              <div className="flex flex-wrap gap-2">
                {quickComments.map((comment, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickComment(comment)}
                    className="text-xs hover:scale-105 transition-all duration-300 rounded-full"
                  >
                    {comment}
                  </Button>
                ))}
              </div>
            </div>

            {/* Comment Field */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                Комментарий (необязательно)
              </label>
              <Textarea
                placeholder="Дополнительная информация для водителя..."
                value={bookingData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                className="rounded-xl border-2 bg-white/80 dark:bg-slate-700/80"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Price Summary */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-600 dark:text-slate-400">
                {bookingData.seats} место × {ride.price.toLocaleString()} {t('sum')}
              </span>
              <span className="font-bold text-2xl text-yoldosh-success">
                {totalPrice.toLocaleString()} {t('sum')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <Button 
          onClick={handleBooking}
          className="w-full h-14 text-lg bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-xl"
        >
          Отправить запрос на бронирование
        </Button>
      </div>
    </div>
  );
};

export default BookRide;
