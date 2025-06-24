
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Calendar, Users, Settings, User, Car, Shield, Search, Bell, Edit, Eye, X } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  // Mock data for driver's rides and passenger requests
  const myRides = [
    {
      id: 1,
      from: 'Ташкент',
      to: 'Самарканд',
      date: '25 декабря',
      time: '09:00',
      price: 50000,
      seats: 3,
      bookedSeats: 1,
      status: 'active'
    },
    {
      id: 2,
      from: 'Самарканд',
      to: 'Бухара',
      date: '27 декабря',
      time: '14:00',
      price: 40000,
      seats: 4,
      bookedSeats: 2,
      status: 'active'
    }
  ];

  const passengerRequests = [
    {
      id: 1,
      passenger: {
        name: 'Азиз',
        rating: 4.6,
        reviews: 12
      },
      from: 'Ташкент',
      to: 'Самарканд',
      date: '26 декабря',
      passengers: 2,
      maxPrice: 45000,
      comment: 'Предпочитаю ехать утром'
    },
    {
      id: 2,
      passenger: {
        name: 'Нодира',
        rating: 4.9,
        reviews: 28
      },
      from: 'Ташкент',
      to: 'Бухара',
      date: '28 декабря',
      passengers: 1,
      maxPrice: 60000,
      comment: 'Могу подождать до вечера'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-yoldosh-success/10 text-yoldosh-success border-0';
      case 'completed': return 'bg-slate-100 text-slate-800 border-0';
      case 'cancelled': return 'bg-yoldosh-error/10 text-yoldosh-error border-0';
      default: return 'bg-slate-100 text-slate-800 border-0';
    }
  };

  const handleCreateRide = () => {
    if (user?.isVerified) {
      navigate('/create-ride');
    } else {
      if (confirm('Для создания поездки необходима верификация. Пройти верификацию сейчас?')) {
        navigate('/verification');
      }
    }
  };

  const handleRespondToRequest = (requestId: number) => {
    if (user?.isVerified) {
      alert(`Отклик на заявку ${requestId} отправлен!`);
    } else {
      if (confirm('Для отклика на заявки необходима верификация. Пройти верификацию сейчас?')) {
        navigate('/verification');
      }
    }
  };

  const handleRejectRequest = (requestId: number, passengerName: string) => {
    if (confirm(`Вы уверены, что хотите отказать пассажиру ${passengerName}?`)) {
      // Здесь будет логика отправки сообщения в чат
      console.log(`Отказ пассажиру ${passengerName} по заявке ${requestId}`);
      alert(`Отказ отправлен пассажиру ${passengerName}. Уведомление отправлено в чат.`);
      
      // TODO: Отправить сообщение в чат пассажиру
      // chatService.sendMessage(passengerName, `Водитель отказал в вашей заявке #${requestId}`);
    }
  };

  const handleViewRideDetails = (rideId: number) => {
    navigate(`/ride-details/${rideId}`);
  };

  const handleEditRide = (rideId: number) => {
    navigate(`/edit-ride/${rideId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-secondary bg-clip-text text-transparent">
                Панель водителя
              </h1>
              <p className="text-slate-600 mt-1">Управляйте своими поездками</p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="rounded-xl hover:bg-yoldosh-secondary/10 p-3"
              >
                <User className="h-5 w-5 text-yoldosh-secondary" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/settings')}
                className="rounded-xl hover:bg-yoldosh-secondary/10 p-3"
              >
                <Settings className="h-5 w-5 text-yoldosh-secondary" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Verification Status */}
        {!user?.isVerified && (
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-0 rounded-3xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">Пройдите верификацию</h3>
                  <p className="text-slate-600 text-sm mt-1">
                    Для создания поездок и откликов на заявки требуется верификация
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/verification')}
                  className="bg-gradient-to-r from-amber-400 to-orange-400 hover:scale-105 transition-all duration-300 rounded-xl"
                >
                  Пройти
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={handleCreateRide}
            className="h-16 bg-gradient-secondary hover:scale-105 transition-all duration-300 rounded-2xl shadow-lg relative"
          >
            <div className="flex items-center">
              <Plus className="h-5 w-5 mr-3" />
              <span className="font-semibold">Создать поездку</span>
            </div>
            {!user?.isVerified && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yoldosh-warning rounded-full animate-pulse"></div>
            )}
          </Button>
          <Button
            onClick={() => navigate('/search-requests')}
            variant="outline"
            className="h-16 border-2 border-yoldosh-accent text-yoldosh-accent hover:bg-yoldosh-accent/10 hover:scale-105 transition-all duration-300 rounded-2xl"
          >
            <div className="flex items-center">
              <Search className="h-5 w-5 mr-3" />
              <span className="font-semibold">Найти заявки</span>
            </div>
          </Button>
        </div>

        {/* Passenger Requests */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
                <Bell className="h-6 w-6 mr-3 text-yoldosh-accent" />
                Заявки пассажиров
              </CardTitle>
              <Badge className="bg-yoldosh-accent/10 text-yoldosh-accent border-0">
                {passengerRequests.length} новых
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {passengerRequests.map((request) => (
              <div key={request.id} className="bg-gradient-to-r from-white to-slate-50 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-accent rounded-2xl flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-lg">{request.passenger.name}</div>
                      <div className="flex items-center space-x-2 mt-1 text-sm">
                        <span className="text-amber-500">★ {request.passenger.rating}</span>
                        <span className="text-slate-500">({request.passenger.reviews} отзывов)</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl text-yoldosh-success">
                      до {request.maxPrice.toLocaleString()} сум
                    </div>
                    <div className="text-sm text-slate-600">{request.passengers} пассажир(ов)</div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-slate-400" />
                    <span className="font-semibold text-slate-800">{request.from} → {request.to}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>{request.date}</span>
                  </div>
                  {request.comment && (
                    <div className="bg-slate-100 p-3 rounded-xl">
                      <p className="text-sm text-slate-700 italic">"{request.comment}"</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl border-yoldosh-accent text-yoldosh-accent hover:bg-yoldosh-accent/10"
                  >
                    Подробнее
                  </Button>
                  <Button 
                    onClick={() => handleRejectRequest(request.id, request.passenger.name)}
                    variant="outline"
                    className="flex-1 rounded-xl border-red-500 text-red-500 hover:bg-red-50 hover:border-red-600 hover:text-red-600"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Отказать
                  </Button>
                  <Button 
                    onClick={() => handleRespondToRequest(request.id)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:scale-105 transition-all duration-300 rounded-xl shadow-lg"
                  >
                    {user?.isVerified ? 'Откликнуться' : 'Откликнуться (нужна верификация)'}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* My Rides */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">Мои поездки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {myRides.map((ride) => (
              <div key={ride.id} className="bg-gradient-to-r from-white to-slate-50 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-secondary rounded-xl flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-bold text-slate-800 text-lg">{ride.from} → {ride.to}</span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-slate-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{ride.date} в {ride.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{ride.bookedSeats}/{ride.seats} мест забронировано</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-2xl text-yoldosh-success">
                      {ride.price.toLocaleString()} сум
                    </div>
                    <Badge className={getStatusColor(ride.status)}>
                      Активна
                    </Badge>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    onClick={() => handleViewRideDetails(ride.id)}
                    variant="outline" 
                    className="flex-1 rounded-xl border-yoldosh-secondary text-yoldosh-secondary hover:bg-yoldosh-secondary/10"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Подробнее
                  </Button>
                  <Button 
                    onClick={() => handleEditRide(ride.id)}
                    variant="outline"
                    className="flex-1 rounded-xl border-slate-300 text-slate-600 hover:bg-slate-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Редактировать
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 rounded-3xl shadow-lg hover:scale-105 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-yoldosh-primary mb-2">12</div>
              <div className="text-sm text-slate-600 font-medium">Поездок</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-0 rounded-3xl shadow-lg hover:scale-105 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-yoldosh-success mb-2">4.8</div>
              <div className="text-sm text-slate-600 font-medium">Рейтинг</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-0 rounded-3xl shadow-lg hover:scale-105 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-yoldosh-warning mb-2">42</div>
              <div className="text-sm text-slate-600 font-medium">Пассажиров</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
