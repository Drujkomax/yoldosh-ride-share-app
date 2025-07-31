import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, Eye, EyeOff, User, Loader2 } from 'lucide-react';
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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [userName, setUserName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      console.log('LoginPage - User already authenticated, redirecting:', user);
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

  const getProfileByAuth = async (userId: string) => {
    try {
      console.log('LoginPage - Getting profile for user ID:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('LoginPage - Error getting profile:', error);
        return null;
      }

      console.log('LoginPage - Profile found:', data);
      return data;
    } catch (error) {
      console.error('LoginPage - Unexpected error getting profile:', error);
      return null;
    }
  };

  const createProfileFromAuth = async (authUser: any, additionalData: any = {}) => {
    try {
      console.log('LoginPage - Creating profile for auth user:', authUser);
      
      const profile = {
        id: authUser.id,
        email: authUser.email,
        phone: additionalData.phone || '',
        name: additionalData.name || authUser.user_metadata?.name || '',
        first_name: additionalData.firstName || authUser.user_metadata?.first_name || '',
        last_name: additionalData.lastName || authUser.user_metadata?.last_name || '',
        is_verified: false,
        total_rides: 0,
        rating: 0.0,
        onboarding_completed: true,
        privacy_consent: true,
        marketing_consent: false,
        registration_method: 'email',
      };

      console.log('LoginPage - Creating profile with data:', profile);

      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single();

      if (error) {
        console.error('LoginPage - Error creating profile:', error);
        return null;
      }

      console.log('LoginPage - Profile created successfully:', data);
      return data;
    } catch (error) {
      console.error('LoginPage - Unexpected error creating profile:', error);
      return null;
    }
  };

  const waitForUserContext = async (expectedUserId: string, maxWaitTime = 5000) => {
    console.log('LoginPage - Waiting for user context to update...');
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        const currentTime = Date.now();
        
        if (user && user.id === expectedUserId) {
          console.log('LoginPage - User context updated successfully');
          clearInterval(checkInterval);
          resolve(true);
        } else if (currentTime - startTime > maxWaitTime) {
          console.log('LoginPage - Timeout waiting for user context');
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 100);
    });
  };

  const handleLogin = async () => {
    if ((!email && !phone) || !password) {
      toast.error('Заполните все поля');
      return;
    }

    setIsLoading(true);
    setDebugInfo('Начинаем процесс входа...');
    
    try {
      const identifier = loginType === 'email' ? email : phone;
      const userEmail = loginType === 'email' ? email : `${phone.replace(/\D/g, '')}@temp.com`;
      
      console.log('LoginPage - Attempting login with:', { identifier, userEmail, loginType });
      setDebugInfo(`Попытка входа с ${loginType}: ${identifier}`);
      
      // First, try to authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password
      });

      if (authError) {
        console.error('LoginPage - Auth login error:', authError);
        setDebugInfo(`Ошибка аутентификации: ${authError.message}`);
        
        if (authError.message.includes('Invalid login credentials')) {
          toast.error('Неверный email/телефон или пароль');
        } else if (authError.message.includes('Email not confirmed')) {
          toast.error('Подтвердите email для входа');
        } else if (authError.message.includes('User not found')) {
          // User might not exist in auth, show registration modal
          setShowRegisterModal(true);
        } else {
          toast.error('Ошибка входа: ' + authError.message);
        }
        return;
      }

      if (authData.user) {
        console.log('LoginPage - Auth successful, user:', authData.user);
        setDebugInfo('Аутентификация успешна, проверяем профиль...');
        
        // User successfully authenticated, now check/create profile
        let userProfile = await getProfileByAuth(authData.user.id);
        
        if (!userProfile) {
          // Profile doesn't exist, create it from auth data
          console.log('LoginPage - Profile not found, creating from auth data');
          setDebugInfo('Профиль не найден, создаем новый...');
          
          userProfile = await createProfileFromAuth(authData.user, {
            phone: loginType === 'phone' ? phone : '',
            name: authData.user.user_metadata?.name || '',
            firstName: authData.user.user_metadata?.first_name || '',
            lastName: authData.user.user_metadata?.last_name || '',
          });
          
          if (!userProfile) {
            toast.error('Ошибка при создании профиля');
            setDebugInfo('Ошибка создания профиля');
            return;
          }
        }

        console.log('LoginPage - Profile ready:', userProfile);
        setDebugInfo('Профиль готов, обновляем контекст...');

        // Manually update the user context with the profile data
        setUser(userProfile);
        
        // Wait for context to update before navigating
        setDebugInfo('Ожидаем обновления контекста...');
        const contextUpdated = await waitForUserContext(userProfile.id);
        
        if (contextUpdated) {
          toast.success('Добро пожаловать!');
          setDebugInfo('Перенаправляем...');
          navigate('/passenger-search');
        } else {
          // Force navigation even if context didn't update in time
          console.log('LoginPage - Context update timeout, forcing navigation');
          toast.success('Добро пожаловать!');
          setDebugInfo('Принудительное перенаправление...');
          
          // Set user data in localStorage as backup
          localStorage.setItem('yoldosh_user', JSON.stringify(userProfile));
          
          setTimeout(() => {
            navigate('/passenger-search');
          }, 500);
        }
      }
    } catch (error) {
      console.error('LoginPage - Unexpected login error:', error);
      setDebugInfo(`Неожиданная ошибка: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    setDebugInfo('Начинаем регистрацию...');
    
    try {
      const identifier = loginType === 'email' ? email : phone;
      const userEmail = loginType === 'email' ? email : `${phone.replace(/\D/g, '')}@temp.com`;
      
      console.log('LoginPage - Attempting registration with:', { identifier, userEmail, userName });
      setDebugInfo(`Регистрация пользователя: ${userName}`);
      
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
        console.error('LoginPage - Registration error:', error);
        setDebugInfo(`Ошибка регистрации: ${error.message}`);
        toast.error('Ошибка при регистрации: ' + error.message);
        return;
      }

      if (data.user) {
        console.log('LoginPage - Registration successful:', data.user);
        setDebugInfo('Регистрация успешна!');
        
        toast.success('Регистрация прошла успешно!');
        setShowRegisterModal(false);
        
        // For email registration, user needs to confirm email first
        if (loginType === 'email') {
          toast.info('Проверьте email для подтверждения аккаунта');
          setDebugInfo('Ожидаем подтверждение email...');
        } else {
          // For phone registration, try to create profile immediately
          setDebugInfo('Создаем профиль...');
          const profile = await createProfileFromAuth(data.user, {
            name: userName,
            phone: phone,
          });
          
          if (profile) {
            setUser(profile);
            setTimeout(() => {
              navigate('/passenger-search');
            }, 1000);
          }
        }
      }
    } catch (error) {
      console.error('LoginPage - Unexpected registration error:', error);
      setDebugInfo(`Неожиданная ошибка регистрации: ${error instanceof Error ? error.message : 'Unknown'}`);
      toast.error('Произошла ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      toast.error('Введите email для восстановления пароля');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('LoginPage - Password reset error:', error);
        toast.error('Ошибка при отправке письма: ' + error.message);
        return;
      }

      toast.success('Письмо для восстановления пароля отправлено на ваш email');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error) {
      console.error('LoginPage - Unexpected password reset error:', error);
      toast.error('Произошла ошибка при восстановлении пароля');
    } finally {
      setIsLoading(false);
    }
  };

  // Test credentials for development
  const fillTestCredentials = () => {
    setEmail('test@example.com');
    setPassword('test123456');
    setLoginType('email');
    toast.info('Заполнены тестовые данные');
  };

  const currentInput = loginType === 'email' ? email : phone;

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-teal-500/10 rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-teal-600/10 rounded-full animate-float"></div>
      
      <div className="container mx-auto max-w-md px-4 relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-center pt-6 mb-6">
          <h1 className="text-2xl font-bold text-teal-900">Yoldosh</h1>
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={fillTestCredentials}
              className="ml-4 text-xs bg-orange-500 text-white px-2 py-1 rounded"
            >
              Test
            </button>
          )}
        </div>

        {/* Debug Info - только в development */}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <div className="mb-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
            <p className="text-xs text-blue-800">{debugInfo}</p>
            <div className="text-xs text-gray-600 mt-1">
              <div>User in context: {user ? '✅' : '❌'}</div>
              <div>Current step: {isLoading ? 'Loading...' : 'Ready'}</div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <div className="flex-1 flex items-center justify-center pb-6">
          <Card className="w-full animate-slide-up bg-white/95 backdrop-blur-lg border-0 rounded-2xl shadow-2xl">
            <CardHeader className="text-center pb-3">
              <CardTitle className="text-lg font-bold text-teal-900">
                Вход в аккаунт
              </CardTitle>
              <p className="text-gray-600 text-sm">
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
                disabled={isLoading}
              />
              
              <div className="relative">
                <AnimatedInput
                  id="password"
                  label="Пароль"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              <Button 
                onClick={handleLogin}
                disabled={isLoading || !currentInput || !password}
                className="w-full h-10 text-sm bg-teal-600 hover:bg-teal-700 hover:scale-105 transition-all duration-300 rounded-xl shadow-lg disabled:opacity-50 text-white"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Вход...</span>
                  </div>
                ) : (
                  'Войти'
                )}
              </Button>
              
              <div className="text-center pt-1 space-y-2">
                <button 
                  onClick={() => setShowForgotPassword(true)}
                  className="text-teal-600 hover:underline text-xs transition-all duration-200 block w-full"
                  disabled={isLoading}
                >
                  Забыли пароль?
                </button>
                <button 
                  onClick={() => navigate('/onboarding')}
                  className="text-teal-600 hover:underline text-xs transition-all duration-200"
                  disabled={isLoading}
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
              disabled={isLoading}
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
                className="flex-1 h-10 bg-teal-600 hover:bg-teal-700 rounded-xl text-sm text-white"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Создание...</span>
                  </div>
                ) : (
                  'Создать'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Modal */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg text-teal-900">Восстановление пароля</DialogTitle>
            <DialogDescription className="text-sm">
              Введите ваш email для получения ссылки восстановления пароля
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 pt-3">
            <AnimatedInput
              id="resetEmail"
              label="Email"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="example@mail.com"
              icon={<Mail className="h-4 w-4" />}
              disabled={isLoading}
            />
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowForgotPassword(false)}
                className="flex-1 h-10 rounded-xl text-sm"
                disabled={isLoading}
              >
                Отмена
              </Button>
              <Button
                onClick={handleForgotPassword}
                disabled={isLoading || !resetEmail.trim()}
                className="flex-1 h-10 bg-teal-600 hover:bg-teal-700 rounded-xl text-sm text-white"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Отправка...</span>
                  </div>
                ) : (
                  'Отправить'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;