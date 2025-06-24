import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Users, Star, User, Car, Phone, MessageCircle, Edit } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const RideDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();

  // Mock ride data
  const ride = {
    id: 1,
    driver: {
      name: 'Алишер',
      rating: 4.9,
      reviews: 24,
      phone: '+998901234567',
      isVerified: true,
      totalTrips: 45
    },
    from: 'Ташкент',
    to: 'Самарканд',
    date: '25 декабря',
    time: '09:00',
    price: 50000,
    seats: 3,
    bookedSeats: 1,
    car: {
      make: 'Chevrolet',
      model: 'Lacetti',
      year: 2018,
      color: 'Белый',
      plate: '01A123BC'
    },
    comfort: 'Комфорт',
    duration: '4ч 30м',
    description: 'Комфортная поездка в Самарканд. Остановка в Джизаке по договоренности. Кондиционер работает, музыка негромкая.',
    rules: [
      'Не курить в салоне',
      'Без домашних животных',
      'Опоздание не более 10 минут'
    ],
    passengers: [
      { 
        name: 'Жамшид', 
        rating: 4.8, 
        seats: 1,
        phone: '+998901111111' 
      }
    ]
  };

  const isDriverView = user?.role === 'driver';
  const isOwnRide = isDriverView && ride.driver.name === user?.name;

  const handleBookRide = () => {
    alert('Поездка забронирована!');
  };

  const handleEditRide = () => {
    navigate(`/edit-ride/${id}`);
  };

  const handleDeleteRide = () => {
    if (confirm('Вы уверены, что хотите отменить поездку?')) {
      alert('Поездка отменена');
      navigate('/driver');
    }
  };

  const handleCallDriver = () => {
    window.location.href = `tel:${ride.driver.phone}`;
  };

  const handleChatWithDriver = () => {
    alert('Открытие чата с водителем');
  };

  const handleViewPassengerProfile = (passengerName: string) => {
    navigate(`/passenger-profile/${passengerName}`);
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
            <h1 className="text-xl font-bold">Детали поездки</h1>
            {isOwnRide && (
              <Button
                variant="ghost"
                onClick={handleEditRide}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Route Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-yoldosh-blue rounded-xl flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-xl">{ride.from} → {ride.to}</div>
                    <div className="text-gray-500">{ride.duration}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{ride.date} в {ride.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{ride.seats - ride.bookedSeats} из {ride.seats} мест</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-3xl text-yoldosh-green">
                  {ride.price.toLocaleString()} сум
                </div>
                <Badge className="mt-2 bg-yoldosh-blue/10 text-yoldosh-blue">
                  {ride.comfort}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver Info */}
        <Card>
          <CardHeader>
            <CardTitle>О водителе</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-bold text-lg">{ride.driver.name}</span>
                  {ride.driver.isVerified && (
                    <Badge variant="secondary" className="text-xs">
                      ✓ Проверен
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{ride.driver.rating}</span>
                    <span>({ride.driver.reviews} отзывов)</span>
                  </div>
                  <span>{ride.driver.totalTrips} поездок</span>
                </div>
              </div>
            </div>

            {!isOwnRide && (
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleCallDriver}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Позвонить
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleChatWithDriver}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Сообщение
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Car Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="h-5 w-5 mr-2" />
              Автомобиль
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Марка:</span> {ride.car.make} {ride.car.model}
              </div>
              <div>
                <span className="font-medium">Год:</span> {ride.car.year}
              </div>
              <div>
                <span className="font-medium">Цвет:</span> {ride.car.color}
              </div>
              <div>
                <span className="font-medium">Номер:</span> {ride.car.plate}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description & Rules */}
        {ride.description && (
          <Card>
            <CardHeader>
              <CardTitle>Описание</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{ride.description}</p>
              
              {ride.rules.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Правила поездки:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {ride.rules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Passengers */}
        {ride.passengers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Попутчики</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ride.passengers.map((passenger, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => handleViewPassengerProfile(passenger.name)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="font-medium">{passenger.name}</div>
                        <div className="flex items-center space-x-1 text-sm">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span>{passenger.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {passenger.seats} место
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isOwnRide && !isDriverView && (
            <Button 
              onClick={handleBookRide}
              className="w-full h-14 text-lg bg-yoldosh-green hover:bg-green-700"
            >
              Забронировать за {ride.price.toLocaleString()} сум
            </Button>
          )}

          {isOwnRide && (
            <div className="space-y-3">
              <Button 
                onClick={handleEditRide}
                className="w-full h-12 bg-yoldosh-blue hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Редактировать поездку
              </Button>
              <Button 
                onClick={handleDeleteRide}
                variant="destructive"
                className="w-full h-12"
              >
                Отменить поездку
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideDetails;
