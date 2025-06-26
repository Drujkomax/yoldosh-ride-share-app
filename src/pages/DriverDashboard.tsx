
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import ChatPanel from '@/components/ChatPanel';
import DriverBottomNavigation from '@/components/DriverBottomNavigation';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleCreateRide = () => {
    navigate('/create-ride');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 pb-24">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-high-contrast">
                Создать поездку
              </h1>
              <p className="text-slate-700 mt-1">Опубликуйте свою поездку и найдите пассажиров</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Create Ride Main Action */}
        <Card className="card-high-contrast rounded-3xl shadow-xl animate-fade-in">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-yoldosh-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-bold text-high-contrast text-2xl mb-2">Создать новую поездку</h3>
              <p className="text-slate-600 text-lg">
                Опубликуйте свою поездку и найдите пассажиров для совместного путешествия
              </p>
            </div>
            <Button 
              onClick={handleCreateRide}
              className="bg-yoldosh-primary hover:bg-blue-700 text-white hover:scale-105 transition-all duration-300 rounded-xl shadow-lg text-lg px-8 py-4"
            >
              <Plus className="h-6 w-6 mr-3" />
              Создать поездку
            </Button>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-high-contrast rounded-2xl shadow-md animate-fade-in">
            <CardContent className="p-6">
              <h4 className="font-bold text-lg mb-3 text-high-contrast">💡 Советы для водителей</h4>
              <ul className="space-y-2 text-slate-600">
                <li>• Указывайте точное время отправления</li>
                <li>• Добавьте описание автомобиля</li>
                <li>• Будьте готовы к общению с пассажирами</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="card-high-contrast rounded-2xl shadow-md animate-fade-in">
            <CardContent className="p-6">
              <h4 className="font-bold text-lg mb-3 text-high-contrast">🚗 Безопасность</h4>
              <ul className="space-y-2 text-slate-600">
                <li>• Проверьте техническое состояние авто</li>
                <li>• Соблюдайте правила дорожного движения</li>
                <li>• Общайтесь вежливо с пассажирами</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Driver Bottom Navigation */}
      <DriverBottomNavigation />

      {/* Chat Panel */}
      <ChatPanel />
    </div>
  );
};

export default DriverDashboard;
