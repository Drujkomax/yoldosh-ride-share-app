
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import CitySelect from '@/components/CitySelect';
import { useRides } from '@/hooks/useRides';
import { toast } from 'sonner';

const EditRide = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { rides, updateRide, isUpdating } = useRides();
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    from_city: '',
    to_city: '',
    departure_date: '',
    departure_time: '',
    price_per_seat: 0,
    available_seats: 1,
    description: '',
    car_model: '',
    car_color: ''
  });

  // Находим поездку по ID
  const ride = rides.find(r => r.id === id);

  useEffect(() => {
    if (ride) {
      setFormData({
        from_city: ride.from_city,
        to_city: ride.to_city,
        departure_date: ride.departure_date,
        departure_time: ride.departure_time,
        price_per_seat: Number(ride.price_per_seat),
        available_seats: ride.available_seats,
        description: ride.description || '',
        car_model: ride.car_model || '',
        car_color: ride.car_color || ''
      });
      setLoading(false);
    } else if (rides.length > 0) {
      // Если поездки загружены, но поездка не найдена
      toast.error('Поездка не найдена');
      navigate('/driver');
    }
  }, [ride, rides, navigate]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!ride) return;

    // Валидация данных
    if (!formData.from_city || !formData.to_city) {
      toast.error('Выберите города отправления и назначения');
      return;
    }

    if (!formData.departure_date || !formData.departure_time) {
      toast.error('Укажите дату и время отправления');
      return;
    }

    if (formData.price_per_seat <= 0) {
      toast.error('Цена должна быть больше 0');
      return;
    }

    if (formData.available_seats <= 0) {
      toast.error('Количество мест должно быть больше 0');
      return;
    }

    updateRide({ 
      id: ride.id, 
      updates: formData 
    });
  };

  const handleCancel = () => {
    navigate('/driver');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Поездка не найдена</h2>
            <Button onClick={() => navigate('/driver')} className="bg-gradient-secondary">
              Вернуться к поездкам
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
              disabled={isUpdating}
              className="bg-gradient-secondary hover:scale-105 transition-all duration-300 rounded-xl"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Сохранить
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-6">
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
                  value={formData.from_city}
                  onValueChange={(value) => handleInputChange('from_city', value)}
                  placeholder="Выберите город отправления"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to" className="text-sm font-medium text-slate-700">Куда</Label>
                <CitySelect
                  value={formData.to_city}
                  onValueChange={(value) => handleInputChange('to_city', value)}
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
                  value={formData.departure_date}
                  onChange={(e) => handleInputChange('departure_date', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-yoldosh-secondary focus:ring-yoldosh-secondary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm font-medium text-slate-700">Время</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.departure_time}
                  onChange={(e) => handleInputChange('departure_time', e.target.value)}
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
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price_per_seat}
                  onChange={(e) => handleInputChange('price_per_seat', parseInt(e.target.value) || 0)}
                  className="rounded-xl border-slate-200 focus:border-yoldosh-secondary focus:ring-yoldosh-secondary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seats" className="text-sm font-medium text-slate-700">
                  Количество мест
                </Label>
                <Input
                  id="seats"
                  type="number"
                  value={formData.available_seats}
                  onChange={(e) => handleInputChange('available_seats', parseInt(e.target.value) || 1)}
                  min="1"
                  max="8"
                  className="rounded-xl border-slate-200 focus:border-yoldosh-secondary focus:ring-yoldosh-secondary/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Car Info */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">Информация об автомобиле</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="car_model" className="text-sm font-medium text-slate-700">Модель</Label>
                <Input
                  id="car_model"
                  value={formData.car_model}
                  onChange={(e) => handleInputChange('car_model', e.target.value)}
                  placeholder="Например: Chevrolet Lacetti"
                  className="rounded-xl border-slate-200 focus:border-yoldosh-secondary focus:ring-yoldosh-secondary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="car_color" className="text-sm font-medium text-slate-700">Цвет</Label>
                <Input
                  id="car_color"
                  value={formData.car_color}
                  onChange={(e) => handleInputChange('car_color', e.target.value)}
                  placeholder="Например: Белый"
                  className="rounded-xl border-slate-200 focus:border-yoldosh-secondary focus:ring-yoldosh-secondary/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
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
            disabled={isUpdating}
            className="flex-1 h-12 bg-gradient-secondary hover:scale-105 transition-all duration-300 rounded-xl"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Сохранить изменения
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditRide;
