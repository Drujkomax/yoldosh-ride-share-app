
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Car, Clock, MapPin, Users, DollarSign } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useRides } from '@/hooks/useRides';
import { toast } from 'sonner';
import DriverBottomNavigation from '@/components/DriverBottomNavigation';

const CreateRide = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { createRide } = useRides();

  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [availableSeats, setAvailableSeats] = useState('');
  const [pricePerSeat, setPricePerSeat] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carColor, setCarColor] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('Необходимо войти в систему');
      return;
    }

    try {
      await createRide({
        driver_id: user.id,
        from_city: fromCity,
        to_city: toCity,
        departure_date: departureDate,
        departure_time: departureTime,
        available_seats: parseInt(availableSeats),
        price_per_seat: parseFloat(pricePerSeat),
        car_model: carModel,
        car_color: carColor,
        description,
        duration_hours: parseInt(duration),
        status: 'active'
      });
      
      toast.success('Поездка успешно создана!');
      navigate('/driver-home');
    } catch (error) {
      console.error('Error creating ride:', error);
      toast.error('Ошибка при создании поездки');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/driver-home')}
              className="rounded-xl hover:bg-yoldosh-primary/10 p-3"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад
            </Button>
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Создать поездку
              </h1>
              <p className="text-slate-600 mt-1">Опубликуйте поездку и найдите пассажиров</p>
            </div>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-6 py-8">
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-800 flex items-center">
              <Car className="h-6 w-6 mr-3 text-yoldosh-primary" />
              Детали поездки
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fromCity" className="block text-sm font-medium text-slate-700">Откуда</label>
                  <input
                    type="text"
                    id="fromCity"
                    value={fromCity}
                    onChange={(e) => setFromCity(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yoldosh-primary focus:ring-yoldosh-primary sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="toCity" className="block text-sm font-medium text-slate-700">Куда</label>
                  <input
                    type="text"
                    id="toCity"
                    value={toCity}
                    onChange={(e) => setToCity(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yoldosh-primary focus:ring-yoldosh-primary sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="departureDate" className="block text-sm font-medium text-slate-700">Дата отправления</label>
                  <input
                    type="date"
                    id="departureDate"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yoldosh-primary focus:ring-yoldosh-primary sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="departureTime" className="block text-sm font-medium text-slate-700">Время отправления</label>
                  <input
                    type="time"
                    id="departureTime"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yoldosh-primary focus:ring-yoldosh-primary sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="availableSeats" className="block text-sm font-medium text-slate-700">Количество мест</label>
                  <input
                    type="number"
                    id="availableSeats"
                    value={availableSeats}
                    onChange={(e) => setAvailableSeats(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yoldosh-primary focus:ring-yoldosh-primary sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="pricePerSeat" className="block text-sm font-medium text-slate-700">Цена за место</label>
                  <input
                    type="number"
                    id="pricePerSeat"
                    value={pricePerSeat}
                    onChange={(e) => setPricePerSeat(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yoldosh-primary focus:ring-yoldosh-primary sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="carModel" className="block text-sm font-medium text-slate-700">Модель автомобиля</label>
                  <input
                    type="text"
                    id="carModel"
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yoldosh-primary focus:ring-yoldosh-primary sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="carColor" className="block text-sm font-medium text-slate-700">Цвет автомобиля</label>
                  <input
                    type="text"
                    id="carColor"
                    value={carColor}
                    onChange={(e) => setCarColor(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yoldosh-primary focus:ring-yoldosh-primary sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-slate-700">Длительность поездки (в часах)</label>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yoldosh-primary focus:ring-yoldosh-primary sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700">Описание</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yoldosh-primary focus:ring-yoldosh-primary sm:text-sm"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-14 bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-2xl text-lg font-semibold"
              >
                <Plus className="h-6 w-6 mr-3" />
                Создать поездку
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <DriverBottomNavigation />
    </div>
  );
};

export default CreateRide;
