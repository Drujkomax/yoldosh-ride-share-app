
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import CitySelect from '@/components/CitySelect';

const EditRide = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock ride data (в реальном приложении загружается по ID)
  const [rideData, setRideData] = useState({
    id: 1,
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
    description: 'Комфортная поездка в Самарканд. Остановка в Джизаке по договоренности. Кондиционер работает, музыка негромкая.',
    rules: [
      'Не курить в салоне',
      'Без домашних животных',
      'Опоздание не более 10 минут'
    ]
  });

  const hasPassengers = rideData.bookedSeats > 0;

  const [formData, setFormData] = useState({
    from: rideData.from,
    to: rideData.to,
    date: rideData.date,
    time: rideData.time,
    price: rideData.price,
    seats: rideData.seats,
    description: rideData.description,
    rules: rideData.rules.join('\n')
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Здесь будет логика сохранения изменений
    console.log('Сохранение изменений:', formData);
    alert('Изменения сохранены!');
    navigate('/driver');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="rounded-xl hover:bg-slate-100"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Назад
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-secondary bg-clip-text text-transparent">
                  Редактировать поездку
                </h1>
                <p className="text-slate-600 mt-1">Изменение деталей поездки</p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              className="bg-gradient-secondary hover:scale-105 transition-all duration-300 rounded-xl"
            >
              <Save className="h-5 w-5 mr-2" />
              Сохранить
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Warning for rides with passengers */}
        {hasPassengers && (
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-0 rounded-3xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">Внимание!</h3>
                  <p className="text-slate-600 text-sm mt-1">
                    У вас есть {rideData.bookedSeats} забронированное место. Цена не может быть изменена.
                  </p>
                </div>
                <Badge className="bg-yoldosh-warning/20 text-yoldosh-warning border-0">
                  {rideData.bookedSeats} пассажир(ов)
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Route and Schedule */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">Маршрут и время</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="from" className="text-sm font-medium text-slate-700">Откуда</Label>
                <CitySelect
                  value={formData.from}
                  onChange={(value) => handleInputChange('from', value)}
                  placeholder="Выберите город отправления"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to" className="text-sm font-medium text-slate-700">Куда</Label>
                <CitySelect
                  value={formData.to}
                  onChange={(value) => handleInputChange('to', value)}
                  placeholder="Выберите город назначения"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-slate-700">Дата</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-yoldosh-secondary focus:ring-yoldosh-secondary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm font-medium text-slate-700">Время</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-yoldosh-secondary focus:ring-yoldosh-secondary/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price and Seats */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">Цена и места</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium text-slate-700">
                  Цена за место (сум)
                  {hasPassengers && <span className="text-amber-600 ml-2">(нельзя изменить)</span>}
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseInt(e.target.value))}
                  disabled={hasPassengers}
                  className={`rounded-xl ${hasPassengers ? 'bg-slate-100 text-slate-500' : 'border-slate-200 focus:border-yoldosh-secondary focus:ring-yoldosh-secondary/20'}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seats" className="text-sm font-medium text-slate-700">
                  Количество мест
                  {hasPassengers && <span className="text-slate-500 ml-2">(мин. {rideData.bookedSeats})</span>}
                </Label>
                <Input
                  id="seats"
                  type="number"
                  value={formData.seats}
                  onChange={(e) => handleInputChange('seats', parseInt(e.target.value))}
                  min={hasPassengers ? rideData.bookedSeats : 1}
                  max="8"
                  className="rounded-xl border-slate-200 focus:border-yoldosh-secondary focus:ring-yoldosh-secondary/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description and Rules */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">Дополнительная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-slate-700">Описание поездки</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Расскажите о поездке..."
                className="rounded-xl border-slate-200 focus:border-yoldosh-secondary focus:ring-yoldosh-secondary/20 min-h-24"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rules" className="text-sm font-medium text-slate-700">Правила поездки</Label>
              <Textarea
                id="rules"
                value={formData.rules}
                onChange={(e) => handleInputChange('rules', e.target.value)}
                placeholder="Укажите правила (каждое с новой строки)..."
                className="rounded-xl border-slate-200 focus:border-yoldosh-secondary focus:ring-yoldosh-secondary/20 min-h-24"
              />
              <p className="text-xs text-slate-500">Каждое правило указывайте с новой строки</p>
            </div>
          </CardContent>
        </Card>

        {/* Car Info (Read-only) */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">Информация об автомобиле</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="font-medium text-slate-600">Марка:</span>
                <p className="text-slate-800">{rideData.car.make} {rideData.car.model}</p>
              </div>
              <div className="space-y-1">
                <span className="font-medium text-slate-600">Год:</span>
                <p className="text-slate-800">{rideData.car.year}</p>
              </div>
              <div className="space-y-1">
                <span className="font-medium text-slate-600">Цвет:</span>
                <p className="text-slate-800">{rideData.car.color}</p>
              </div>
              <div className="space-y-1">
                <span className="font-medium text-slate-600">Номер:</span>
                <p className="text-slate-800">{rideData.car.plate}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Для изменения информации об автомобиле перейдите в настройки профиля
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1 h-12 rounded-xl border-slate-300 text-slate-600 hover:bg-slate-50"
          >
            Отменить
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 h-12 bg-gradient-secondary hover:scale-105 transition-all duration-300 rounded-xl"
          >
            <Save className="h-5 w-5 mr-2" />
            Сохранить изменения
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditRide;
