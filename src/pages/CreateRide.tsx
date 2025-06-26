
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MapPin, Calendar, Users, Car } from 'lucide-react';
import { useRides } from '@/hooks/useRides';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

const CreateRide = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { createRide, isCreating } = useRides();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    time: '',
    seats: '',
    price: '',
    duration: '2',
    car: '',
    description: ''
  });

  const cities = [
    'Ташкент',
    'Самарканд',
    'Бухара',
    'Андижан',
    'Наманган',
    'Фергана',
    'Карши',
    'Термез',
    'Ургенч',
    'Нукус'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.from || !formData.to) {
        toast.error("Выберите города отправления и назначения");
        return;
      }
      if (formData.from === formData.to) {
        toast.error("Города отправления и назначения должны отличаться");
        return;
      }
    }
    
    if (step === 2) {
      if (!formData.date || !formData.time) {
        toast.error("Выберите дату и время");
        return;
      }
      
      // Проверяем, что дата не в прошлом
      const selectedDate = new Date(`${formData.date}T${formData.time}`);
      const now = new Date();
      if (selectedDate <= now) {
        toast.error("Дата и время поездки должны быть в будущем");
        return;
      }
    }
    
    if (step === 3) {
      if (!formData.seats || !formData.price || !formData.car) {
        toast.error("Заполните все поля");
        return;
      }
      
      if (parseInt(formData.seats) <= 0) {
        toast.error("Количество мест должно быть больше 0");
        return;
      }
      
      if (parseFloat(formData.price) <= 0) {
        toast.error("Цена должна быть больше 0");
        return;
      }
    }
    
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    console.log('CreateRide - Starting ride creation');
    console.log('CreateRide - Current user:', user);
    console.log('CreateRide - Form data:', formData);
    
    if (!user) {
      console.error('CreateRide - No user found');
      toast.error("Необходимо войти в систему");
      return;
    }

    if (!user.id) {
      console.error('CreateRide - User has no ID');
      toast.error("Ошибка пользователя. Перезайдите в приложение");
      return;
    }

    try {
      const rideData = {
        driver_id: user.id,
        from_city: formData.from,
        to_city: formData.to,
        departure_date: formData.date,
        departure_time: formData.time,
        available_seats: parseInt(formData.seats),
        price_per_seat: parseFloat(formData.price),
        duration_hours: parseInt(formData.duration),
        description: formData.description || undefined,
        car_model: formData.car || undefined,
        car_color: undefined,
        status: 'active' as const
      };

      console.log('CreateRide - Prepared ride data:', rideData);
      
      createRide(rideData);
      
      // Не переходим сразу, подождем результата mutation
      setTimeout(() => {
        navigate('/driver');
      }, 1000);
      
    } catch (error) {
      console.error('CreateRide - Error in handleSubmit:', error);
      toast.error("Произошла ошибка при создании поездки");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/driver')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <h1 className="text-xl font-bold">Создать поездку</h1>
            <div className="text-sm text-gray-500">{step}/4</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  num <= step ? 'bg-yoldosh-blue text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {num}
                </div>
                {num < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    num < step ? 'bg-yoldosh-blue' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-md mx-auto">
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-yoldosh-blue" />
                  Маршрут
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Откуда</Label>
                  <Select value={formData.from} onValueChange={(value) => handleInputChange('from', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите город" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Куда</Label>
                  <Select value={formData.to} onValueChange={(value) => handleInputChange('to', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите город" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleNext} className="w-full bg-yoldosh-blue hover:bg-blue-700">
                  Далее
                </Button>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-yoldosh-blue" />
                  Дата и время
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Дата</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label>Время</Label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                  />
                </div>
                <Button onClick={handleNext} className="w-full bg-yoldosh-blue hover:bg-blue-700">
                  Далее
                </Button>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="h-5 w-5 mr-2 text-yoldosh-blue" />
                  Детали поездки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Количество мест</Label>
                  <Select value={formData.seats} onValueChange={(value) => handleInputChange('seats', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите количество" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num} мест</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Длительность поездки (часы)</Label>
                  <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите длительность" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num} ч.</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Цена за место (сум)</Label>
                  <Input
                    type="number"
                    placeholder="50000"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Автомобиль</Label>
                  <Input
                    placeholder="Марка и модель"
                    value={formData.car}
                    onChange={(e) => handleInputChange('car', e.target.value)}
                  />
                </div>
                <Button onClick={handleNext} className="w-full bg-yoldosh-blue hover:bg-blue-700">
                  Далее
                </Button>
              </CardContent>
            </>
          )}

          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>Описание</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Дополнительная информация</Label>
                  <Textarea
                    placeholder="Расскажите о поездке: остановки, правила, предпочтения..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>
                
                {/* Summary */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <h3 className="font-medium">Сводка поездки:</h3>
                  <p className="text-sm"><span className="font-medium">Маршрут:</span> {formData.from} → {formData.to}</p>
                  <p className="text-sm"><span className="font-medium">Дата:</span> {formData.date} в {formData.time}</p>
                  <p className="text-sm"><span className="font-medium">Длительность:</span> {formData.duration} часов</p>
                  <p className="text-sm"><span className="font-medium">Мест:</span> {formData.seats}</p>
                  <p className="text-sm"><span className="font-medium">Цена:</span> {formData.price} сум за место</p>
                  <p className="text-sm"><span className="font-medium">Автомобиль:</span> {formData.car}</p>
                </div>
                
                <Button 
                  onClick={handleSubmit} 
                  disabled={isCreating}
                  className="w-full bg-yoldosh-green hover:bg-green-700"
                >
                  {isCreating ? 'Создание...' : 'Создать поездку'}
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CreateRide;
