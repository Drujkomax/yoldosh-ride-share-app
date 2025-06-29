
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Phone, User } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import AnimatedInput from '@/components/AnimatedInput';

const RegistrationPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const { register, login, isLoading } = useAuth();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('+998');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isNewUser, setIsNewUser] = useState(true);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user) {
      navigate('/passenger'); // Все пользователи начинают как пассажиры
    }
  }, [user, navigate]);

  const handlePhoneSubmit = async () => {
    if (phone.length < 13 || !name.trim()) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля корректно",
        variant: "destructive"
      });
      return;
    }

    // Проверяем, существует ли пользователь
    console.log('Checking if user exists for phone:', phone);
    const result = await login(phone);
    
    if (result) {
      // Пользователь существует и успешно вошел
      toast({
        title: "Пользователь найден",
        description: "Введите код подтверждения для входа",
      });
      setIsNewUser(false);
      setStep('code');
    } else {
      // Новый пользователь
      setIsNewUser(true);
      setStep('code');
      toast({
        title: "Код подтверждения",
        description: "Введите код подтверждения для завершения регистрации",
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

    // Для демо принимаем любой 4-значный код
    if (!/^\d{4}$/.test(code)) {
      toast({
        title: "Ошибка",
        description: "Код должен содержать только цифры",
        variant: "destructive"
      });
      return;
    }

    if (isNewUser) {
      // Создаем нового пользователя БЕЗ роли
      console.log('Creating new user:', { phone, name });
      const result = await register(phone, name, 'passenger'); // Временно для совместимости
      
      if (result) {
        // Все пользователи начинают как пассажиры
        navigate('/passenger');
      }
    } else {
      // Входим существующим пользователем
      toast({
        title: "Добро пожаловать!",
        description: "Вы успешно вошли в систему",
      });
      
      // Все пользователи попадают на главную страницу поиска
      navigate('/passenger');
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

  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-yoldosh-primary/10 rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-yoldosh-secondary/10 rounded-full animate-float"></div>
      
      <div className="container mx-auto max-w-md px-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 pt-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => step === 'code' ? setStep('phone') : navigate('/')}
            className="text-white hover:bg-white/10 rounded-xl p-3 hover:scale-105 transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Назад
          </Button>
          <h1 className="text-3xl font-bold text-white">Yoldosh</h1>
          <div className="w-12"></div>
        </div>

        {step === 'phone' && (
          <Card className="animate-slide-up bg-white/95 backdrop-blur-lg border-0 rounded-3xl shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-slate-800">
                Вход / Регистрация
              </CardTitle>
              <p className="text-slate-600 mt-2">
                Введите ваши данные
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
                disabled={isLoading}
                className="w-full h-14 text-lg bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-2xl shadow-lg"
              >
                {isLoading ? 'Проверяем...' : 'Продолжить'}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'code' && (
          <Card className="animate-scale-in bg-white/95 backdrop-blur-lg border-0 rounded-3xl shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-slate-800">
                Код подтверждения
              </CardTitle>
              <p className="text-slate-600 mt-2">
                {isNewUser ? 'Для завершения регистрации' : 'Для входа в аккаунт'}<br />
                <span className="font-semibold text-yoldosh-primary">{phone}</span>
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Для демо введите любой 4-значный код
              </p>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <AnimatedInput
                id="code"
                label="Код подтверждения"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="1234"
                maxLength={4}
                className="text-center text-2xl tracking-widest font-bold"
              />
              
              <Button 
                onClick={handleCodeSubmit}
                disabled={isLoading}
                className="w-full h-14 text-lg bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-2xl shadow-lg"
              >
                {isLoading ? 'Подтверждаем...' : 'Подтвердить'}
              </Button>
              
              <button 
                onClick={() => setStep('phone')}
                disabled={isLoading}
                className="w-full text-yoldosh-primary hover:underline text-sm transition-all duration-200 py-2 hover:scale-105 disabled:opacity-50"
              >
                Изменить данные
              </button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RegistrationPage;
