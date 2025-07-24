import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Phone, Mail, Eye, EyeOff, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import AnimatedInput from '@/components/AnimatedInput';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+998');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [userName, setUserName] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/passenger-search');
    }
  }, [user, navigate]);

  // Auto-detect input type
  const handleInputChange = (value: string) => {
    if (value.includes('@')) {
      setLoginType('email');
      setEmail(value);
    } else {
      setLoginType('phone');
      if (value.startsWith('+998')) {
        setPhone(formatPhoneNumber(value));
      } else {
        setPhone(value);
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

  const checkUserExists = async (identifier: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, phone')
        .or(`email.eq.${identifier},phone.eq.${identifier}`)
        .maybeSingle();

      if (error) {
        console.error('Error checking user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error:', error);
      return null;
    }
  };

  const handleLogin = async () => {
    if ((!email && !phone) || !password) {
      toast.error('Заполните все поля');
      return;
    }

    setIsLoading(true);
    
    try {
      const identifier = loginType === 'email' ? email : phone;
      console.log('Checking if user exists:', identifier);
      
      // Check if user exists in our profiles table
      const existingUser = await checkUserExists(identifier);
      
      if (!existingUser) {
        // User doesn't exist, show registration modal
        setShowRegisterModal(true);
        setIsLoading(false);
        return;
      }

      // User exists, try to sign in with Supabase Auth
      const signInData = loginType === 'email' 
        ? { email, password }
        : { email: existingUser.email || `${phone}@temp.com`, password };

      const { data, error } = await supabase.auth.signInWithPassword(signInData);

      if (error) {
        console.error('Login error:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Неверный пароль');
        } else {
          // If auth fails but user exists, might need to create auth account
          setShowRegisterModal(true);
        }
        return;
      }

      if (data.user) {
        // Successfully logged in
        toast.success('Добро пожаловать!');
        
        // Load user profile
        const userProfile = {
          id: existingUser.id,
          phone: existingUser.phone || '',
          name: existingUser.name || '',
          email: existingUser.email || '',
          isVerified: false,
          totalRides: 0,
          rating: 0.0
        };

        setUser(userProfile);
        navigate('/passenger-search');
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast.error('Произошла ошибка при входе');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!userName.trim()) {
      toast.error('Введите ваше имя');
      return;
    }

    setIsLoading(true);
    
    try {
      const identifier = loginType === 'email' ? email : phone;
      const userEmail = loginType === 'email' ? email : `${phone.replace(/\D/g, '')}@temp.com`;
      
      // Create Supabase Auth user
      const { data, error } = await supabase.auth.signUp({
        email: userEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: userName,
            phone: loginType === 'phone' ? phone : '',
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        toast.error('Ошибка при регистрации: ' + error.message);
        return;
      }

      if (data.user) {
        toast.success('Регистрация прошла успешно!');
        setShowRegisterModal(false);
        
        // The trigger will automatically create the profile
        // Wait a bit for the trigger to execute
        setTimeout(() => {
          navigate('/passenger-search');
        }, 1000);
      }
    } catch (error) {
      console.error('Unexpected registration error:', error);
      toast.error('Произошла ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  const currentInput = loginType === 'email' ? email : phone;

  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-yoldosh-primary/10 rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-yoldosh-secondary/10 rounded-full animate-float"></div>
      
      <div className="container mx-auto max-w-md px-4 relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-center pt-6 mb-6">
          <h1 className="text-2xl font-bold text-white">Yoldosh</h1>
        </div>

        {/* Login Form */}
        <div className="flex-1 flex items-center justify-center pb-6">
          <Card className="w-full animate-slide-up bg-white/95 backdrop-blur-lg border-0 rounded-2xl shadow-2xl">
            <CardHeader className="text-center pb-3">
              <CardTitle className="text-lg font-bold text-slate-800">
                Вход в аккаунт
              </CardTitle>
              <p className="text-slate-600 text-sm">
                Введите ваши данные для входа
              </p>
            </CardHeader>
            
            <CardContent className="space-y-3 p-5">
              <AnimatedInput
                id="identifier"
                label="Email или телефон"
                type={loginType === 'email' ? 'email' : 'tel'}
                value={currentInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={loginType === 'email' ? 'example@mail.com' : '+998 (XX) XXX-XX-XX'}
                maxLength={loginType === 'phone' ? 19 : undefined}
                icon={loginType === 'email' ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
              />
              
              <div className="relative">
                <AnimatedInput
                  id="password"
                  label="Пароль"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              <Button 
                onClick={handleLogin}
                disabled={isLoading || !currentInput || !password}
                className="w-full h-10 text-sm bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-xl shadow-lg disabled:opacity-50"
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </Button>
              
              <div className="text-center pt-1">
                <button 
                  onClick={() => navigate('/onboarding')}
                  className="text-yoldosh-primary hover:underline text-xs transition-all duration-200"
                >
                  Нет аккаунта? Зарегистрироваться
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Registration Modal */}
      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg">Создать аккаунт</DialogTitle>
            <DialogDescription className="text-sm">
              Пользователь не найден. Хотите создать новый аккаунт?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 pt-3">
            <AnimatedInput
              id="name"
              label="Ваше имя"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Введите ваше имя"
              icon={<User className="h-4 w-4" />}
            />
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRegisterModal(false)}
                className="flex-1 h-10 rounded-xl text-sm"
                disabled={isLoading}
              >
                Отмена
              </Button>
              <Button
                onClick={handleRegister}
                disabled={isLoading || !userName.trim()}
                className="flex-1 h-10 bg-gradient-primary rounded-xl text-sm"
              >
                {isLoading ? 'Создание...' : 'Создать'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;