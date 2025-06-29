
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Car, Users, MapPin, Star, Shield, Sparkles } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useUser();

  React.useEffect(() => {
    if (!loading && user) {
      navigate('/search-rides');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400/20 rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-16 w-12 h-12 bg-purple-400/20 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-32 left-20 w-16 h-16 bg-indigo-400/20 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
      
      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Logo and title */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-6 shadow-2xl">
                <Car className="h-16 w-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-8 w-8 text-purple-500 animate-pulse" />
              </div>
            </div>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 tracking-tight">
            Yoldosh
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 font-light max-w-2xl mx-auto leading-relaxed">
            Умная платформа для поиска попутчиков по всему Узбекистану
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 text-center border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-gray-900 font-bold text-xl mb-3">Быстрый поиск</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Находите идеальную поездку за секунды по всем направлениям</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 text-center border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-gray-900 font-bold text-xl mb-3">Безопасность</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Все пользователи проходят верификацию для вашей безопасности</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 text-center border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-gray-900 font-bold text-xl mb-3">Доверие</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Система рейтингов и отзывов от реальных пользователей</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-lg mx-auto">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-10 shadow-2xl border border-white/50">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Начните путешествие
            </h2>
            
            <div className="space-y-4">
              <Button
                onClick={() => navigate('/onboarding')}
                className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="flex flex-col items-center">
                  <span>Присоединиться к Yoldosh</span>
                  <span className="text-sm opacity-90">Быстрая регистрация</span>
                </div>
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Уже есть аккаунт?</p>
                <Button
                  onClick={() => navigate('/onboarding')}
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 rounded-xl px-6 py-2 transition-all duration-300"
                >
                  Войти
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom info */}
        <div className="text-center mt-16">
          <p className="text-gray-500 text-sm">
            Присоединяйтесь к тысячам довольных пользователей
          </p>
          <div className="flex justify-center items-center mt-4 space-x-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">10,000+ пользователей</span>
            </div>
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">1,000+ поездок в день</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
