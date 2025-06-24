
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Users, Star, User, Phone, MessageCircle, Car, Clock, Shield } from 'lucide-react';

const DriverRideDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data for driver's ride details
  const ride = {
    id: parseInt(id || '1'),
    from: 'Ташкент',
    to: 'Самарканд',
    date: '25 декабря 2024',
    time: '09:00',
    price: 50000,
    seats: 3,
    bookedSeats: 1,
    car: 'Chevrolet Lacetti',
    passengers: [
      {
        id: 1,
        name: 'Жамшид Каримов',
        rating: 4.8,
        reviews: 15,
        phone: '+998 90 123 45 67',
        isVerified: true,
        bookedSeats: 1,
        joinDate: 'Сентябрь 2023',
        preferences: ['Некурящий', 'Тихая поездка', 'Без остановок'],
        specialRequests: 'Есть небольшая сумка. Предпочитаю места у окна.',
        paymentStatus: 'paid'
      }
    ],
    route: {
      distance: '320 км',
      duration: '4 часа 30 минут',
      stops: ['Джизак (остановка 15 мин)']
    },
    earnings: {
      total: 50000,
      commission: 5000,
      net: 45000
    }
  };

  const handleCallPassenger = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleMessagePassenger = (passengerName: string) => {
    navigate(`/chat/${passengerName}`);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-yoldosh-success/10 text-yoldosh-success border-0';
      case 'pending': return 'bg-yoldosh-warning/10 text-yoldosh-warning border-0';
      case 'failed': return 'bg-yoldosh-error/10 text-yoldosh-error border-0';
      default: return 'bg-slate-100 text-slate-800 border-0';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/driver')}
              className="hover:bg-yoldosh-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <h1 className="text-xl font-bold text-slate-800">Поездка #{ride.id}</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Route Info */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-800">
              <MapPin className="h-6 w-6 mr-3 text-yoldosh-primary" />
              Информация о поездке
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-5 w-5 text-yoldosh-primary" />
                    <span className="font-semibold text-slate-800">Маршрут</span>
                  </div>
                  <div className="text-lg font-bold text-slate-800">
                    {ride.from} → {ride.to}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    {ride.route.distance} • {ride.route.duration}
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-2xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-5 w-5 text-yoldosh-success" />
                    <span className="font-semibold text-slate-800">Дата и время</span>
                  </div>
                  <div className="text-lg font-bold text-slate-800">{ride.date}</div>
                  <div className="text-sm text-slate-600">Отправление в {ride.time}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-5 w-5 text-yoldosh-accent" />
                    <span className="font-semibold text-slate-800">Места</span>
                  </div>
                  <div className="text-lg font-bold text-slate-800">
                    {ride.bookedSeats} из {ride.seats} забронировано
                  </div>
                  <div className="text-sm text-slate-600">
                    {ride.seats - ride.bookedSeats} свободных мест
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">💰</span>
                    <span className="font-semibold text-slate-800">Доходы</span>
                  </div>
                  <div className="text-xl font-bold text-yoldosh-success">
                    {ride.earnings.net.toLocaleString()} сум
                  </div>
                  <div className="text-xs text-slate-500">
                    Общий доход: {ride.earnings.total.toLocaleString()} сум
                  </div>
                </div>
              </div>
            </div>

            {/* Route stops */}
            {ride.route.stops.length > 0 && (
              <div className="mt-6 p-4 bg-slate-50 rounded-2xl">
                <h4 className="font-semibold mb-2 text-slate-800">Остановки по маршруту</h4>
                <div className="space-y-1">
                  {ride.route.stops.map((stop, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-slate-600">
                      <Clock className="h-4 w-4" />
                      <span>{stop}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Passengers */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-800">
              <Users className="h-6 w-6 mr-3 text-yoldosh-secondary" />
              Пассажиры ({ride.passengers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {ride.passengers.map((passenger) => (
              <div key={passenger.id} className="bg-gradient-to-r from-white to-slate-50 rounded-2xl p-6 shadow-md border border-slate-100">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-bold text-slate-800">{passenger.name}</h3>
                      {passenger.isVerified && (
                        <Badge className="bg-yoldosh-success/20 text-yoldosh-success border-0">
                          <Shield className="h-3 w-3 mr-1" />
                          Верифицирован
                        </Badge>
                      )}
                      <Badge className={getPaymentStatusColor(passenger.paymentStatus)}>
                        Оплачено
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{passenger.rating}</span>
                        <span>({passenger.reviews} отзывов)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Car className="h-4 w-4" />
                        <span>{passenger.bookedSeats} место</span>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      Зарегистрирован: {passenger.joinDate}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleCallPassenger(passenger.phone)}
                      size="sm"
                      className="bg-yoldosh-success hover:bg-green-700 rounded-xl"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleMessagePassenger(passenger.name)}
                      size="sm"
                      variant="outline"
                      className="rounded-xl border-yoldosh-primary text-yoldosh-primary hover:bg-yoldosh-primary/10"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Preferences */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-slate-800">Предпочтения</h4>
                  <div className="flex flex-wrap gap-2">
                    {passenger.preferences.map((pref, index) => (
                      <Badge key={index} variant="outline" className="bg-slate-100 text-slate-700">
                        {pref}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Special requests */}
                {passenger.specialRequests && (
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <h4 className="font-semibold mb-1 text-slate-800 text-sm">Особые пожелания</h4>
                    <p className="text-sm text-slate-700 italic">"{passenger.specialRequests}"</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => navigate(`/edit-ride/${ride.id}`)}
            variant="outline"
            className="h-14 rounded-2xl border-2 border-yoldosh-secondary text-yoldosh-secondary hover:bg-yoldosh-secondary/10"
          >
            Редактировать поездку
          </Button>
          <Button
            onClick={() => navigate('/driver')}
            className="h-14 bg-gradient-secondary hover:scale-105 transition-all duration-300 rounded-2xl"
          >
            Вернуться к поездкам
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DriverRideDetails;
