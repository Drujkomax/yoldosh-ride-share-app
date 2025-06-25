import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Users, MapPin, Star, Shield, Sparkles, Phone, User, ArrowLeft } from 'lucide-react';
import { useUser, UserRole } from '@/contexts/UserContext';
import { toast } from '@/hooks/use-toast';
import AnimatedInput from '@/components/AnimatedInput';

const WelcomePage = () => {
  const navigate = useNavigate();
  const { signInWithPhone, verifyOtp } = useUser();
  const [step, setStep] = useState<'welcome' | 'phone' | 'code'>('welcome');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [phone, setPhone] = useState('+998');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('phone');
  };

  const handlePhoneSubmit = async () => {
    if (phone.length < 13 || !name.trim()) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля корректно",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await signInWithPhone(phone);
      toast({
        title: "Код отправлен",
        description: "SMS с кодом подтверждения отправлен на ваш номер",
      });
      setStep('code');
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить код. Попробуйте снова.",
        variant: "destructive"
      });
    }
  };

  const handleCodeSubmit = async () => {
    if (code.length !== 4) {
      toast({
        title: "Ошибка",
        description: "Введите 4-значный код",
        variant: "destructive"
      });
      return;
    }

    try {
      await verifyOtp(phone, code, {
        name,
        role: selectedRole!
      });
      
      if (selectedRole === 'driver') {
        navigate('/driver');
      } else {
        navigate('/passenger');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Ошибка",
        description: "Неверный код. Попробуйте снова.",
        variant: "destructive"
      });
    }
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.startsWith('998')) {
      const formatted = numbers.replace(/(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 ($2) $3-$4-$5');
      return `+${formatted}`;
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.startsWith('+998')) {
      setPhone(formatPhoneNumber(value));
    }
  };

  const handleBack = () => {
    if (step === 'phone') setStep('welcome');
    else if (step === 'code') setStep('phone');
  };

  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Floating elements for visual interest */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-yoldosh-primary/20 rounded-full animate-float"></div>
      <div className="absolute top-40 right-16 w-12 h-12 bg-yoldosh-secondary/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-32 left-20 w-16 h-16 bg-yoldosh-accent/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 pt-4">
          {step !== 'welcome' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-white hover:bg-white/10 rounded-xl p-3 hover:scale-105 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад
            </Button>
          )}
          <h1 className="text-3xl font-bold text-white mx-auto">Yoldosh</h1>
          <div className="w-12"></div>
        </div>

        {step === 'welcome' && (
          <div className="max-w-4xl mx-auto">
            {/* Logo and title */}
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
              <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                Yoldosh
              </h2>
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

            {/* Role Selection */}
            <div className="max-w-lg mx-auto">
              <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-10 shadow-2xl animate-scale-in border border-white/30">
                <h2 className="text-3xl font-bold text-slate-800 text-center mb-8">
                  Выберите роль
                </h2>
                
                <div className="space-y-6">
                  <Button
                    onClick={() => handleRoleSelect('passenger')}
                    variant="outline"
                    className="w-full h-24 text-lg border-2 border-slate-200 hover:border-yoldosh-primary hover:bg-yoldosh-primary/10 rounded-2xl transition-all duration-300 group hover:scale-105"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <span className="font-bold text-slate-800">Пассажир</span>
                      <span className="text-sm text-slate-500 mt-1">Ищу поездку</span>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => handleRoleSelect('driver')}
                    variant="outline"
                    className="w-full h-24 text-lg border-2 border-slate-200 hover:border-yoldosh-secondary hover:bg-yoldosh-secondary/10 rounded-2xl transition-all duration-300 group hover:scale-105"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                        <Car className="h-6 w-6 text-white" />
                      </div>
                      <span className="font-bold text-slate-800">Водитель</span>
                      <span className="text-sm text-slate-500 mt-1">Предлагаю поездки</span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'phone' && (
          <div className="max-w-md mx-auto">
            <Card className="animate-slide-up bg-white/95 backdrop-blur-lg border-0 rounded-3xl shadow-2xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-slate-800">
                  Регистрация
                </CardTitle>
                <p className="text-slate-600 mt-2">
                  Введите ваши данные для регистрации
                </p>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <AnimatedInput
                  id="name"
                  label="Имя и фамилия"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Введите ваше имя"
                  icon={<User className="h-4 w-4" />}
                />
                
                <AnimatedInput
                  id="phone"
                  label="Номер телефона"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+998 (XX) XXX-XX-XX"
                  maxLength={19}
                  icon={<Phone className="h-4 w-4" />}
                />
                
                <Button 
                  onClick={handlePhoneSubmit}
                  className="w-full h-14 text-lg bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-2xl shadow-lg"
                >
                  Получить код
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'code' && (
          <div className="max-w-md mx-auto">
            <Card className="animate-scale-in bg-white/95 backdrop-blur-lg border-0 rounded-3xl shadow-2xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-slate-800">
                  Код подтверждения
                </CardTitle>
                <p className="text-slate-600 mt-2">
                  Введите код из SMS на номер<br />
                  <span className="font-semibold text-yoldosh-primary">{phone}</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                <AnimatedInput
                  id="code"
                  label="Код подтверждения"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="XXXX"
                  maxLength={4}
                  className="text-center text-2xl tracking-widest font-bold"
                />
                
                <Button 
                  onClick={handleCodeSubmit}
                  className="w-full h-14 text-lg bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-2xl shadow-lg"
                >
                  Подтвердить
                </Button>
                
                <button 
                  onClick={() => setStep('phone')}
                  className="w-full text-yoldosh-primary hover:underline text-sm transition-all duration-200 py-2 hover:scale-105"
                >
                  Изменить данные
                </button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomePage;
