
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, MapPin, Calendar, Users, Star, User, Clock, Minus, MessageCircle, FileText } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const PassengerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [selectedRide, setSelectedRide] = useState(null);
  const [bookingSeats, setBookingSeats] = useState(1);

  // Mock available rides data
  const availableRides = [
    {
      id: 1,
      driver: {
        name: 'Бахтиёр',
        rating: 4.8,
        reviews: 45,
        phone: '+998901234567',
        isVerified: true,
        experience: '3 года опыта',
        car: 'Chevrolet Lacetti 2018'
      },
      from: 'Ташкент',
      to: 'Самарканд',
      date: '25 декабря',
      time: '09:00',
      availableSeats: 3,
      totalSeats: 4,
      price: 50000,
      features: ['Кондиционер', 'Музыка', 'Некурящий'],
      description: 'Комфортная поездка с остановками по договоренности'
    },
    {
      id: 2,
      driver: {
        name: 'Азиз',
        rating: 4.6,
        reviews: 28,
        phone: '+998901234568',
        isVerified: true,
        experience: '2 года опыта',
        car: 'Daewoo Nexia 2017'
      },
      from: 'Ташкент',
      to: 'Самарканд',
      date: '25 декабря',
      time: '14:30',
      availableSeats: 2,
      totalSeats: 4,
      price: 45000,
      features: ['Кондиционер', 'Некурящий'],
      description: 'Быстрая поездка без лишних остановок'
    }
  ];

  const handleBookRide = (rideId: number) => {
    navigate(`/book-ride/${rideId}`);
  };

  const handleQuickBook = (ride) => {
    const totalPrice = ride.price * bookingSeats;
    alert(`Заявка отправлена!\nПоездка: ${ride.from} → ${ride.to}\nМест: ${bookingSeats}\nСумма: ${totalPrice.toLocaleString()} сум`);
    setSelectedRide(null);
    setBookingSeats(1);
  };

  const handleSeatsChange = (increment: boolean, maxSeats: number) => {
    if (increment && bookingSeats < maxSeats) {
      setBookingSeats(prev => prev + 1);
    } else if (!increment && bookingSeats > 1) {
      setBookingSeats(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 relative">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Привет, {user?.name || 'Пассажир'}!
              </h1>
              <p className="text-slate-600 text-sm">Найдите идеальную поездку</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/profile')}
              className="rounded-full w-12 h-12 p-0 hover:bg-slate-100"
            >
              <User className="h-6 w-6 text-slate-600" />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Quick Search Card */}
        <Card className="mb-6 shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Быстрый поиск поездки</h2>
              <Button
                onClick={() => navigate('/search-rides')}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                <Search className="h-5 w-5 mr-2" />
                Найти поездку
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Available Rides */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 px-1">Доступные поездки</h3>
          
          {availableRides.map((ride) => (
            <Card key={ride.id} className="shadow-sm border-0 bg-white">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-slate-900 text-sm">{ride.driver.name}</span>
                        {ride.driver.isVerified && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 px-2 py-0.5">
                            ✓
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-xs">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-slate-600">{ride.driver.rating}</span>
                        <span className="text-gray-400">({ride.driver.reviews})</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-lg text-slate-900">
                      {ride.price.toLocaleString()} сум
                    </div>
                    <div className="text-xs text-slate-500">{ride.availableSeats} из {ride.totalSeats} мест</div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-slate-900 text-sm">{ride.from} → {ride.to}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{ride.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{ride.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{ride.availableSeats} мест</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {ride.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-slate-50 text-slate-700 border-slate-200">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-2 border-t border-slate-100">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 h-10 text-sm border-slate-300 hover:bg-slate-50"
                        onClick={() => setSelectedRide(ride)}
                      >
                        Подробнее
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm rounded-2xl bg-white">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-slate-900">
                          Информация о поездке
                        </DialogTitle>
                      </DialogHeader>
                      {selectedRide && (
                        <div className="space-y-4">
                          {/* Driver Info */}
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <h4 className="font-medium text-slate-900 mb-2 text-sm">О водителе</h4>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-600">Имя:</span>
                                <span className="font-medium text-slate-900">{selectedRide.driver.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Рейтинг:</span>
                                <span className="flex items-center">
                                  <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                                  <span className="text-slate-900">{selectedRide.driver.rating} ({selectedRide.driver.reviews})</span>
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Опыт:</span>
                                <span className="text-slate-900">{selectedRide.driver.experience}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Автомобиль:</span>
                                <span className="text-slate-900">{selectedRide.driver.car}</span>
                              </div>
                            </div>
                          </div>

                          {/* Trip Info */}
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <h4 className="font-medium text-slate-900 mb-2 text-sm">О поездке</h4>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-600">Маршрут:</span>
                                <span className="font-medium text-slate-900">{selectedRide.from} → {selectedRide.to}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Дата и время:</span>
                                <span className="text-slate-900">{selectedRide.date} в {selectedRide.time}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Цена за место:</span>
                                <span className="font-bold text-blue-600">{selectedRide.price.toLocaleString()} сум</span>
                              </div>
                              <div className="pt-1">
                                <span className="text-slate-600 text-xs">{selectedRide.description}</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Booking */}
                          <div className="p-3 bg-blue-50 rounded-xl">
                            <h4 className="font-medium text-slate-900 mb-3 text-sm">Быстрое бронирование</h4>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs text-slate-600">Количество мест:</span>
                              <div className="flex items-center space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSeatsChange(false, selectedRide.availableSeats)}
                                  disabled={bookingSeats <= 1}
                                  className="h-7 w-7 rounded-full p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="font-medium text-sm w-6 text-center">{bookingSeats}</span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSeatsChange(true, selectedRide.availableSeats)}
                                  disabled={bookingSeats >= selectedRide.availableSeats}
                                  className="h-7 w-7 rounded-full p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-xs text-slate-600">Общая стоимость:</span>
                              <span className="font-bold text-lg text-blue-600">
                                {(selectedRide.price * bookingSeats).toLocaleString()} сум
                              </span>
                            </div>
                            <Button
                              onClick={() => handleQuickBook(selectedRide)}
                              className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
                            >
                              Забронировать сейчас
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    onClick={() => handleBookRide(ride.id)}
                    size="sm"
                    className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
                  >
                    Забронировать
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Static Bottom Navigation - Figma Style */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-4 py-3">
        <div className="flex justify-around items-center">
          <Button
            onClick={() => navigate('/search-rides')}
            variant="ghost"
            className="flex flex-col items-center justify-center h-14 px-6 rounded-xl hover:bg-blue-50 group transition-all duration-200"
          >
            <Search className="h-5 w-5 mb-1 text-slate-600 group-hover:text-blue-600 transition-colors" />
            <span className="text-xs font-medium text-slate-600 group-hover:text-blue-600 transition-colors">Поиск</span>
          </Button>
          
          <Button
            onClick={() => navigate('/create-request')}
            variant="ghost"
            className="flex flex-col items-center justify-center h-14 px-6 rounded-xl hover:bg-green-50 group transition-all duration-200"
          >
            <FileText className="h-5 w-5 mb-1 text-slate-600 group-hover:text-green-600 transition-colors" />
            <span className="text-xs font-medium text-slate-600 group-hover:text-green-600 transition-colors">Заявка</span>
          </Button>
          
          <Button
            onClick={() => navigate('/chats')}
            variant="ghost"
            className="flex flex-col items-center justify-center h-14 px-6 rounded-xl hover:bg-purple-50 group transition-all duration-200"
          >
            <MessageCircle className="h-5 w-5 mb-1 text-slate-600 group-hover:text-purple-600 transition-colors" />
            <span className="text-xs font-medium text-slate-600 group-hover:text-purple-600 transition-colors">Чаты</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PassengerDashboard;
