
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Users, ArrowLeft, Phone, User } from 'lucide-react';
import { useUser, UserRole } from '@/contexts/UserContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import AnimatedInput from '@/components/AnimatedInput';

const RegistrationPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const { signUp, signIn, loading } = useAuth();
  const [step, setStep] = useState<'role' | 'phone' | 'code'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [phone, setPhone] = useState('+998');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isNewUser, setIsNewUser] = useState(true);
  const [existingUser, setExistingUser] = useState<any>(null);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user) {
      if (user.role === 'driver') {
        navigate('/driver');
      } else {
        navigate('/passenger');
      }
    }
  }, [user, navigate]);

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

    // Проверяем, существует ли пользователь
    console.log('Checking if user exists for phone:', phone);
    const result = await signIn(phone);
    
    if (result.exists && result.user) {
      // Пользователь существует
      setExistingUser(result.user);
      setIsNewUser(false);
      setStep('code');
      toast({
        title: "Пользователь найден",
        description: "Введите код подтверждения для входа",
      });
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

    if (isNewUser && selectedRole) {
      // Создаем нового пользователя
      console.log('Creating new user:', { phone, name, role: selectedRole });
      const result = await signUp(phone, name, selectedRole);
      
      if (result.error) {
        console.error('Registration error:', result.error);
        toast({
          title: "Ошибка регистрации",
          description: "Не удалось создать аккаунт. Попробуйте еще раз.",
          variant: "destructive"
        });
      } else {
        // Устанавливаем пользователя в контекст
        const newUser = {
          id: result.data.id,
          phone: result.data.phone,
          role: result.data.role as UserRole,
          isVerified: result.data.is_verified,
          name: result.data.name,
          totalRides: result.data.total_rides,
          rating: result.data.rating,
          avatarUrl: result.data.avatar_url
        };
        
        setUser(newUser);
        
        toast({
          title: "Регистрация завершена",
          description: "Добро пожаловать в Yoldosh!",
        });
        
        // Перенаправляем в зависимости от роли
        if (selectedRole === 'driver') {
          navigate('/driver');
        } else {
          navigate('/passenger');
        }
      }
    } else if (!isNewUser && existingUser) {
      // Входим существующим пользователем
      const userForContext = {
        id: existingUser.id,
        phone: existingUser.phone,
        role: existingUser.role as UserRole,
        isVerified: existingUser.is_verified,
        name: existingUser.name,
        totalRides: existingUser.total_rides,
        rating: existingUser.rating,
        avatarUrl: existingUser.avatar_url
      };
      
      setUser(userForContext);
      
      toast({
        title: "Добро пожаловать!",
        description: "Вы успешно вошли в систему",
      });
      
      // Перенаправляем в зависимости от роли
      if (existingUser.role === 'driver') {
        navigate('/driver');
      } else {
        navigate('/passenger');
      }
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
            onClick={() => step === 'role' ? navigate('/') : setStep(step === 'code' ? 'phone' : 'role')}
            className="text-white hover:bg-white/10 rounded-xl p-3 hover:scale-105 transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Назад
          </Button>
          <h1 className="text-3xl font-bold text-white">Yoldosh</h1>
          <div className="w-12"></div>
        </div>

        {step === 'role' && (
          <Card className="animate-fade-in bg-white/95 backdrop-blur-lg border-0 rounded-3xl shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-slate-800">Выберите роль</CardTitle>
              <p className="text-slate-600 mt-2">Как вы планируете использовать приложение?</p>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
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
            </CardContent>
          </Card>
        )}

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
                disabled={loading}
                className="w-full h-14 text-lg bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-2xl shadow-lg"
              >
                {loading ? 'Проверяем...' : 'Продолжить'}
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
                disabled={loading}
                className="w-full h-14 text-lg bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-2xl shadow-lg"
              >
                {loading ? 'Подтверждаем...' : 'Подтвердить'}
              </Button>
              
              <button 
                onClick={() => setStep('phone')}
                className="w-full text-yoldosh-primary hover:underline text-sm transition-all duration-200 py-2 hover:scale-105"
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
