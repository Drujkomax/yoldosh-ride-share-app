import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, Eye, EyeOff, User, Loader2, AlertCircle } from 'lucide-react';
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
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // Debug logging function
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log('LoginPage -', message);
    setDebugLogs(prev => [...prev.slice(-20), logEntry]); // Keep last 20 logs
    setDebugInfo(message);
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      addDebugLog(`User already authenticated: ${user.id}, redirecting`);
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

  // Test Supabase connection
  const testSupabaseConnection = async () => {
    try {
      addDebugLog('Testing Supabase connection...');
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        addDebugLog(`Supabase connection error: ${error.message}`);
        return false;
      }
      
      addDebugLog('Supabase connection successful');
      return true;
    } catch (error) {
      addDebugLog(`Supabase connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  // Test user creation manually
  const testUserCreation = async () => {
    try {
      addDebugLog('Testing user creation...');
      
      const testUser = {
        id: 'test-user-id-' + Date.now(),
        email: 'test@example.com',
        name: 'Test User',
        phone: '+998901234567',
        first_name: 'Test',
        last_name: 'User',
        is_verified: false,
        total_rides: 0,
        rating: 0.0,
        onboarding_completed: true,
        privacy_consent: true,
        marketing_consent: false,
        registration_method: 'email',
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(testUser)
        .select()
        .single();

      if (error) {
        addDebugLog(`User creation test failed: ${error.message}`);
        return false;
      }

      addDebugLog('User creation test successful');
      
      // Clean up test user
      await supabase.from('profiles').delete().eq('id', testUser.id);
      
      return true;
    } catch (error) {
      addDebugLog(`User creation test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const getProfileByAuth = async (userId: string) => {
    try {
      addDebugLog(`Getting profile for user ID: ${userId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        addDebugLog(`Error getting profile: ${error.message}`);
        return null;
      }

      if (data) {
        addDebugLog(`Profile found: ${data.name || data.email}`);
      } else {
        addDebugLog('No profile found for user');
      }
      
      return data;
    } catch (error) {
      addDebugLog(`Unexpected error getting profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  const createProfileFromAuth = async (authUser: any, additionalData: any = {}) => {
    try {
      addDebugLog(`Creating profile for auth user: ${authUser.email}`);
      
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

      addDebugLog(`Creating profile with data: ${JSON.stringify(profile, null, 2)}`);

      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single();

      if (error) {
        addDebugLog(`Error creating profile: ${error.message}`);
        
        // Check if it's a RLS policy error
        if (error.message.includes('RLS') || error.message.includes('policy')) {
          addDebugLog('This might be a Row Level Security policy issue');
        }
        
        return null;
      }

      addDebugLog(`Profile created successfully: ${data.name || data.email}`);
      return data;
    } catch (error) {
      addDebugLog(`Unexpected error creating profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  const handleLogin = async () => {
    if ((!email && !phone) || !password) {
      toast.error('Заполните все поля');
      return;
    }

    setIsLoading(true);
    setDebugLogs([]); // Clear previous logs
    addDebugLog('=== STARTING LOGIN PROCESS ===');
    
    try {
      const identifier = loginType === 'email' ? email : phone;
      const userEmail = loginType === 'email' ? email : `${phone.replace(/\D/g, '')}@temp.com`;
      
      addDebugLog(`Login attempt - Type: ${loginType}, Identifier: ${identifier}, Email: ${userEmail}`);
      
      // Test Supabase connection first
      const connectionOk = await testSupabaseConnection();
      if (!connectionOk) {
        toast.error('Проблема с подключением к серверу');
        return;
      }

      // Attempt authentication
      addDebugLog('Attempting Supabase Auth login...');
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password
      });

      if (authError) {
        addDebugLog(`Auth error: ${authError.message}`);
        
        if (authError.message.includes('Invalid login credentials')) {
          toast.error('Неверный email/телефон или пароль');
        } else if (authError.message.includes('Email not confirmed')) {
          toast.error('Подтвердите email для входа');
        } else if (authError.message.includes('User not found') || authError.message.includes('Invalid')) {
          addDebugLog('User not found, showing registration modal');
          setShowRegisterModal(true);
        } else {
          toast.error('Ошибка входа: ' + authError.message);
        }
        return;
      }

      if (authData.user) {
        addDebugLog(`Auth successful! User ID: ${authData.user.id}, Email: ${authData.user.email}`);
        addDebugLog(`Auth user metadata: ${JSON.stringify(authData.user.user_metadata, null, 2)}`);
        
        // Check current auth session
        const { data: sessionData } = await supabase.auth.getSession();
        addDebugLog(`Current session: ${sessionData.session ? 'Active' : 'None'}`);

        // Get or create profile
        let userProfile = await getProfileByAuth(authData.user.id);
        
        if (!userProfile) {
          addDebugLog('Profile not found, creating new profile...');
          userProfile = await createProfileFromAuth(authData.user, {
            phone: loginType === 'phone' ? phone : '',
            name: authData.user.user_metadata?.name || '',
            firstName: authData.user.user_metadata?.first_name || '',
            lastName: authData.user.user_metadata?.last_name || '',
          });
          
          if (!userProfile) {
            addDebugLog('Failed to create profile, trying manual approach...');
            toast.error('Ошибка при создании профиля');
            return;
          }
        }

        addDebugLog(`Profile ready: ${JSON.stringify(userProfile, null, 2)}`);

        // Update user context
        addDebugLog('Updating user context...');
        
        // Force update context
        setUser(userProfile);
        
        // Verify context update
        setTimeout(() => {
          addDebugLog(`Context updated - User in context: ${user ? 'Yes' : 'No'}`);
          
          if (user) {
            addDebugLog('Context update successful, redirecting...');
            toast.success('Добро пожаловать!');
            navigate('/passenger-search');
          } else {
            addDebugLog('Context update failed, trying alternative approach...');
            
            // Alternative: store user data and force navigation
            localStorage.setItem('yoldosh_user_data', JSON.stringify(userProfile));
            addDebugLog('User data saved to localStorage, forcing navigation...');
            
            toast.success('Добро пожаловать!');
            navigate('/passenger-search');
          }
        }, 500);
      }
    } catch (error) {
      addDebugLog(`Unexpected login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Full error object:', error);
      toast.error('Произошла ошибка при входе');
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleRegister = async () => {
    if (!userName.trim()) {
      toast.error('Введите ваше имя');
      return;
    }

    setIsLoading(true);
    addDebugLog('=== STARTING REGISTRATION PROCESS ===');
    
    try {
      const identifier = loginType === 'email' ? email : phone;
      const userEmail = loginType === 'email' ? email : `${phone.replace(/\D/g, '')}@temp.com`;
      
      addDebugLog(`Registration attempt - Name: ${userName}, Email: ${userEmail}`);
      
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
        addDebugLog(`Registration error: ${error.message}`);
        toast.error('Ошибка при регистрации: ' + error.message);
        return;
      }

      if (data.user) {
        addDebugLog(`Registration successful! User ID: ${data.user.id}`);
        
        toast.success('Регистрация прошла успешно!');
        setShowRegisterModal(false);
        
        // For email registration, user needs to confirm email first
        if (loginType === 'email') {
          toast.info('Проверьте email для подтверждения аккаунта');
          addDebugLog('Email confirmation required');
        } else {
          // For phone registration, create profile immediately
          addDebugLog('Creating profile for phone registration...');
          const profile = await createProfileFromAuth(data.user, {
            name: userName,
            phone: phone,
          });
          
          if (profile) {
            setUser(profile);
            addDebugLog('Profile created, redirecting...');
            setTimeout(() => {
              navigate('/passenger-search');
            }, 1000);
          }
        }
      }
    } catch (error) {
      addDebugLog(`Unexpected registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        console.error('Password reset error:', error);
        toast.error('Ошибка при отправке письма: ' + error.message);
        return;
      }

      toast.success('Письмо для восстановления пароля отправлено на ваш email');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error) {
      console.error('Unexpected password reset error:', error);
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

  const runDiagnostics = async () => {
    addDebugLog('=== RUNNING DIAGNOSTICS ===');
    
    // Test 1: Supabase connection
    await testSupabaseConnection();
    
    // Test 2: User creation
    await testUserCreation();
    
    // Test 3: Current auth state
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    addDebugLog(`Current auth user: ${currentUser ? currentUser.email : 'None'}`);
    
    // Test 4: Context state
    addDebugLog(`User context state: ${user ? user.email || user.id : 'Empty'}`);
    
    setShowDebugModal(true);
  };

  const currentInput = loginType === 'email' ? email : phone;

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-teal-500/10 rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-teal-600/10 rounded-full animate-float"></div>
      
      <div className="container mx-auto max-w-md px-4 relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pt-6 mb-6">
          <h1 className="text-2xl font-bold text-teal-900">Yoldosh</h1>
          {process.env.NODE_ENV === 'development' && (
            <div className="flex space-x-2">
              <button
                onClick={fillTestCredentials}
                className="text-xs bg-orange-500 text-white px-2 py-1 rounded"
              >
                Test
              </button>
              <button
                onClick={runDiagnostics}
                className="text-xs bg-purple-500 text-white px-2 py-1 rounded"
              >
                Debug
              </button>
            </div>
          )}
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <div className="mb-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
            <p className="text-xs text-blue-800">{debugInfo}</p>
            <div className="text-xs text-gray-600 mt-1">
              <div>User in context: {user ? '✅' : '❌'}</div>
              <div>Current step: {isLoading ? 'Loading...' : 'Ready'}</div>
              <div>Auth State: <span id="auth-state">Checking...</span></div>
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

      {/* Debug Modal */}
      <Dialog open={showDebugModal} onOpenChange={setShowDebugModal}>
        <DialogContent className="max-w-lg max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Debug Information</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {debugLogs.map((log, index) => (
              <div key={index} className="text-xs font-mono bg-gray-100 p-2 rounded">
                {log}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

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