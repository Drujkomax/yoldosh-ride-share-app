
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MapPin, Calendar, Users, Car } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const CreateRide = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    time: '',
    seats: '',
    price: '',
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
        toast({
          title: "Ошибка",
          description: "Выберите города отправления и назначения",
          variant: "destructive"
        });
        return;
      }
      if (formData.from === formData.to) {
        toast({
          title: "Ошибка",
          description: "Города отправления и назначения должны отличаться",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (step === 2) {
      if (!formData.date || !formData.time) {
        toast({
          title: "Ошибка",
          description: "Выберите дату и время",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (step === 3) {
      if (!formData.seats || !formData.price || !formData.car) {
        toast({
          title: "Ошибка",
          description: "Заполните все поля",
          variant: "destructive"
        });
        return;
      }
    }
    
    setStep(step + 1);
  };

  const handleSubmit = () => {
    toast({
      title: "Поездка создана!",
      description: "Ваша поездка успешно опубликована",
    });
    navigate('/driver');
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
                  <p className="text-sm"><span className="font-medium">Мест:</span> {formData.seats}</p>
                  <p className="text-sm"><span className="font-medium">Цена:</span> {formData.price} сум за место</p>
                  <p className="text-sm"><span className="font-medium">Автомобиль:</span> {formData.car}</p>
                </div>
                
                <Button onClick={handleSubmit} className="w-full bg-yoldosh-green hover:bg-green-700">
                  Создать поездку
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
