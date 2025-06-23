
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Car, Users, MapPin, Star, Shield } from 'lucide-react';

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white rounded-full p-4 shadow-lg">
              <Car className="h-12 w-12 text-yoldosh-blue" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Yoldosh
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Умная платформа для поиска попутчиков
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 animate-slide-up">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <MapPin className="h-8 w-8 text-white mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Удобный поиск</h3>
            <p className="text-white/80 text-sm">Находите поездки по маршруту и времени</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <Shield className="h-8 w-8 text-white mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Безопасность</h3>
            <p className="text-white/80 text-sm">Верификация водителей и система отзывов</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <Star className="h-8 w-8 text-white mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Надёжность</h3>
            <p className="text-white/80 text-sm">Рейтинги и отзывы от реальных пользователей</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-xl animate-bounce-soft">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
              Начните путешествие
            </h2>
            
            <div className="space-y-4">
              <Button
                onClick={() => navigate('/register')}
                className="w-full h-14 text-lg bg-yoldosh-blue hover:bg-blue-700 transition-colors"
              >
                <Users className="mr-2 h-5 w-5" />
                Присоединиться как пассажир
              </Button>
              
              <Button
                onClick={() => navigate('/register')}
                variant="outline"
                className="w-full h-14 text-lg border-yoldosh-green text-yoldosh-green hover:bg-yoldosh-green hover:text-white transition-colors"
              >
                <Car className="mr-2 h-5 w-5" />
                Стать водителем
              </Button>
            </div>
            
            <p className="text-gray-600 text-sm text-center mt-6">
              Уже есть аккаунт?{' '}
              <button 
                onClick={() => navigate('/register')}
                className="text-yoldosh-blue font-semibold hover:underline"
              >
                Войти
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
