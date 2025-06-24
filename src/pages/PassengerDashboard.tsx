
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Search, MapPin, Calendar, Users, Star, User, Clock, Minus } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import BottomNavigation from '@/components/BottomNavigation';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-900 pb-20">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-lg border-b border-white/20 dark:border-slate-700/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Привет, {user?.name || 'Пассажир'}!
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Найдите идеальную поездку</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/profile')}
              className="rounded-full hover:bg-yoldosh-primary/10 hover:scale-110 transition-all duration-300"
            >
              <User className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Quick Search */}
        <Card className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">Быстрый поиск поездки</h2>
              <Button
                onClick={() => navigate('/search-rides')}
                className="bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-2xl px-8 py-4 text-lg"
              >
                <Search className="h-5 w-5 mr-3" />
                Найти поездку
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Available Rides */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Доступные поездки</h3>
          
          {availableRides.map((ride) => (
            <Card key={ride.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{ride.driver.name}</span>
                        {ride.driver.isVerified && (
                          <Badge variant="secondary" className="text-xs bg-yoldosh-success/20 text-yoldosh-success">
                            ✓ Проверен
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-slate-600 dark:text-slate-400">{ride.driver.rating}</span>
                        <span className="text-gray-500">({ride.driver.reviews} отзывов)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-2xl text-yoldosh-success">
                      {ride.price.toLocaleString()} сум
                    </div>
                    <div className="text-sm text-slate-500">{ride.availableSeats} из {ride.totalSeats} мест</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{ride.from} → {ride.to}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{ride.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{ride.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{ride.availableSeats} мест</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {ride.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-slate-100 dark:bg-slate-700">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-4 pt-4 border-t dark:border-slate-600">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="flex-1 rounded-xl border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-105 transition-all duration-300"
                        onClick={() => setSelectedRide(ride)}
                      >
                        Подробнее
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-3xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-800 dark:text-slate-200">
                          Информация о поездке
                        </DialogTitle>
                      </DialogHeader>
                      {selectedRide && (
                        <div className="space-y-6">
                          {/* Driver Info */}
                          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">О водителе</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Имя:</span>
                                <span className="font-medium">{selectedRide.driver.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Рейтинг:</span>
                                <span className="flex items-center">
                                  <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                                  {selectedRide.driver.rating} ({selectedRide.driver.reviews})
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Опыт:</span>
                                <span>{selectedRide.driver.experience}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Автомобиль:</span>
                                <span>{selectedRide.driver.car}</span>
                              </div>
                            </div>
                          </div>

                          {/* Trip Info */}
                          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">О поездке</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Маршрут:</span>
                                <span className="font-medium">{selectedRide.from} → {selectedRide.to}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Дата и время:</span>
                                <span>{selectedRide.date} в {selectedRide.time}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Цена за место:</span>
                                <span className="font-bold text-yoldosh-success">{selectedRide.price.toLocaleString()} сум</span>
                              </div>
                              <div className="pt-2">
                                <span className="text-slate-600 dark:text-slate-400">{selectedRide.description}</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Booking */}
                          <div className="p-4 bg-yoldosh-primary/5 rounded-2xl">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Быстрое бронирование</h4>
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-sm">Количество мест:</span>
                              <div className="flex items-center space-x-3">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSeatsChange(false, selectedRide.availableSeats)}
                                  disabled={bookingSeats <= 1}
                                  className="h-8 w-8 rounded-full"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="font-bold text-lg w-8 text-center">{bookingSeats}</span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSeatsChange(true, selectedRide.availableSeats)}
                                  disabled={bookingSeats >= selectedRide.availableSeats}
                                  className="h-8 w-8 rounded-full"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-sm">Общая стоимость:</span>
                              <span className="font-bold text-xl text-yoldosh-success">
                                {(selectedRide.price * bookingSeats).toLocaleString()} сум
                              </span>
                            </div>
                            <Button
                              onClick={() => handleQuickBook(selectedRide)}
                              className="w-full bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-xl"
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
                    className="flex-1 bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-xl"
                  >
                    Забронировать
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default PassengerDashboard;
