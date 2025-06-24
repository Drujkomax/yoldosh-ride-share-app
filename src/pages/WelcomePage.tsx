import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Car, Users, MapPin, Star, Shield, Sparkles } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const WelcomePage = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const selectRole = (role: 'driver' | 'passenger') => {
    setUser({
      id: '1',
      name: role === 'driver' ? 'Водитель' : 'Пассажир',
      role: role,
      phone: '+998901234567',
      isVerified: false,
      totalRides: 0
    });
    
    if (role === 'driver') {
      navigate('/driver');
    } else {
      navigate('/passenger');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Floating elements for visual interest */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-yoldosh-primary/20 rounded-full animate-float"></div>
      <div className="absolute top-40 right-16 w-12 h-12 bg-yoldosh-secondary/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-32 left-20 w-16 h-16 bg-yoldosh-accent/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="bg-gradient-primary rounded-3xl p-6 shadow-2xl animate-bounce-soft">
                <Car className="h-16 w-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-8 w-8 text-yoldosh-accent animate-pulse-slow" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Yoldosh
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 font-light">
            Умная платформа для попутчиков
          </p>
          <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full"></div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 animate-slide-up">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center border border-white/20 hover:bg-white/20 transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-white font-bold text-xl mb-3">Быстрый поиск</h3>
            <p className="text-slate-300 text-sm leading-relaxed">Найдите идеальную поездку за секунды</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center border border-white/20 hover:bg-white/20 transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-white font-bold text-xl mb-3">Безопасность</h3>
            <p className="text-slate-300 text-sm leading-relaxed">Проверенные водители и пассажиры</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center border border-white/20 hover:bg-white/20 transition-all duration-300 group">
            <div className="w-16 h-16 bg-yoldosh-accent rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-white font-bold text-xl mb-3">Доверие</h3>
            <p className="text-slate-300 text-sm leading-relaxed">Система рейтингов и отзывов</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-lg mx-auto">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-10 shadow-2xl animate-scale-in border border-white/30">
            <h2 className="text-3xl font-bold text-slate-800 text-center mb-8">
              Присоединяйтесь
            </h2>
            
            <div className="space-y-6">
              <Button
                onClick={() => selectRole('passenger')}
                className="w-full h-16 text-lg bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-2xl shadow-lg border-0 animate-button-press active:scale-95"
              >
                <div className="flex items-center justify-center">
                  <Users className="mr-3 h-6 w-6" />
                  <span className="font-semibold">Я пассажир</span>
                </div>
              </Button>
              
              <Button
                onClick={() => selectRole('driver')}
                className="w-full h-16 text-lg bg-gradient-secondary hover:scale-105 transition-all duration-300 rounded-2xl shadow-lg border-0 animate-button-press active:scale-95"
              >
                <div className="flex items-center justify-center">
                  <Car className="mr-3 h-6 w-6" />
                  <span className="font-semibold">Я водитель</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
