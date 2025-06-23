
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin, Calendar, Users, DollarSign } from 'lucide-react';
import { DatePicker } from '@/components/ui/datepicker';
import CitySelect from '@/components/CitySelect';
import AnimatedInput from '@/components/AnimatedInput';

const CreateRequest = () => {
  const navigate = useNavigate();
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [date, setDate] = useState<Date>();
  const [passengers, setPassengers] = useState('1');
  const [maxPrice, setMaxPrice] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic here
    alert('Заявка создана! Водители смогут откликнуться на неё.');
    navigate('/passenger');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/passenger')}
              className="rounded-xl hover:bg-yoldosh-primary/10 p-3"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад
            </Button>
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Создать заявку
              </h1>
              <p className="text-slate-600 mt-1">Водители откликнутся на вашу заявку</p>
            </div>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-800">Детали поездки</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Route */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CitySelect
                  value={fromCity}
                  onValueChange={setFromCity}
                  placeholder="Город отправления"
                  label="Откуда"
                />
                <CitySelect
                  value={toCity}
                  onValueChange={setToCity}
                  placeholder="Город назначения"
                  label="Куда"
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Дата поездки</label>
                <DatePicker
                  value={date}
                  onChange={setDate}
                  placeholder="Выберите дату"
                />
              </div>

              {/* Passengers and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatedInput
                  id="passengers"
                  label="Количество пассажиров"
                  type="number"
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  icon={<Users className="h-4 w-4" />}
                />
                <AnimatedInput
                  id="maxPrice"
                  label="Максимальная цена (сум)"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  icon={<DollarSign className="h-4 w-4" />}
                />
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Комментарий</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Дополнительная информация о поездке"
                  className="w-full h-32 p-4 rounded-xl border-2 border-slate-200 focus:border-yoldosh-primary focus:ring-4 focus:ring-yoldosh-primary/20 bg-white/80 backdrop-blur-sm transition-all duration-300"
                />
              </div>

              <Button
                type="submit"
                disabled={!fromCity || !toCity || !date}
                className="w-full h-14 text-lg bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-2xl shadow-lg"
              >
                Создать заявку
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateRequest;
