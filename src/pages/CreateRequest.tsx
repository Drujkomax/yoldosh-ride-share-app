import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, MapPin, Calendar, Users, DollarSign, FileText } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useRideRequests } from '@/hooks/useRideRequests';
import { toast } from 'sonner';
import BottomNavigation from '@/components/BottomNavigation';

const CreateRequest = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { createRequest } = useRideRequests();

  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [passengersCount, setPassengersCount] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('Необходимо войти в систему');
      return;
    }

    try {
      await createRequest({
        passenger_id: user.id,
        from_city: fromCity,
        to_city: toCity,
        preferred_date: preferredDate,
        passengers_count: parseInt(passengersCount),
        max_price_per_seat: maxPrice ? parseFloat(maxPrice) : null,
        description
      });
      
      toast.success('Заявка успешно создана!');
      navigate('/passenger');
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Ошибка при создании заявки');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 pb-20">
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
              <p className="text-slate-600 mt-1">Опубликуйте заявку и найдите водителя</p>
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
              <FileText className="h-6 w-6 mr-3 text-yoldosh-primary" />
              Детали заявки
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* From City */}
              <div>
                <label htmlFor="fromCity" className="block text-sm font-medium text-slate-700">Откуда</label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    id="fromCity"
                    value={fromCity}
                    onChange={(e) => setFromCity(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-slate-200 focus:border-yoldosh-primary focus:ring-4 focus:ring-yoldosh-primary/20 bg-white/80 backdrop-blur-sm transition-all duration-300"
                    placeholder="Город отправления"
                    required
                  />
                </div>
              </div>

              {/* To City */}
              <div>
                <label htmlFor="toCity" className="block text-sm font-medium text-slate-700">Куда</label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    id="toCity"
                    value={toCity}
                    onChange={(e) => setToCity(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-slate-200 focus:border-yoldosh-primary focus:ring-4 focus:ring-yoldosh-primary/20 bg-white/80 backdrop-blur-sm transition-all duration-300"
                    placeholder="Город прибытия"
                    required
                  />
                </div>
              </div>

              {/* Preferred Date */}
              <div>
                <label htmlFor="preferredDate" className="block text-sm font-medium text-slate-700">Предпочитаемая дата</label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="date"
                    id="preferredDate"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-slate-200 focus:border-yoldosh-primary focus:ring-4 focus:ring-yoldosh-primary/20 bg-white/80 backdrop-blur-sm transition-all duration-300"
                    required
                  />
                </div>
              </div>

              {/* Passengers Count */}
              <div>
                <label htmlFor="passengersCount" className="block text-sm font-medium text-slate-700">Количество пассажиров</label>
                <div className="relative mt-1">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="number"
                    id="passengersCount"
                    value={passengersCount}
                    onChange={(e) => setPassengersCount(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-slate-200 focus:border-yoldosh-primary focus:ring-4 focus:ring-yoldosh-primary/20 bg-white/80 backdrop-blur-sm transition-all duration-300"
                    placeholder="Сколько пассажиров?"
                    required
                  />
                </div>
              </div>

              {/* Max Price */}
              <div>
                <label htmlFor="maxPrice" className="block text-sm font-medium text-slate-700">Максимальная цена за место (необязательно)</label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="number"
                    id="maxPrice"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-slate-200 focus:border-yoldosh-primary focus:ring-4 focus:ring-yoldosh-primary/20 bg-white/80 backdrop-blur-sm transition-all duration-300"
                    placeholder="Макс. цена"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700">Описание</label>
                <div className="relative mt-1">
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full pl-4 pr-4 rounded-xl border-2 border-slate-200 focus:border-yoldosh-primary focus:ring-4 focus:ring-yoldosh-primary/20 bg-white/80 backdrop-blur-sm transition-all duration-300"
                    placeholder="Дополнительная информация"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-14 bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-2xl text-lg font-semibold"
              >
                <Plus className="h-6 w-6 mr-3" />
                Создать заявку
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default CreateRequest;
