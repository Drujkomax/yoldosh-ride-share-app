import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsLayout } from '@/components/ui/settings-layout';
import { Eye, EyeOff, Lock, AlertCircle, Check } from 'lucide-react';
import AnimatedInput from '@/components/AnimatedInput';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { passwordSchema } from '@/lib/validation';
import { checkRateLimit } from '@/lib/validation';
import { supabase } from '@/integrations/supabase/client';

const PasswordChangePage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPasswordValid, setCurrentPasswordValid] = useState(false);

  const { signIn, updatePassword, user, session } = useSecureAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const validateCurrentPassword = async (password: string) => {
    if (!password || !user?.email) return;
    
    try {
      console.log('Validating password for email:', user.email);
      
      // Store current session
      const currentSession = session;
      
      // Try to sign in with the password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });
      
      console.log('Password validation result:', { error: error?.message, success: !error });
      
      if (!error) {
        setCurrentPasswordValid(true);
        // Restore the original session if it was different
        if (currentSession && data.session?.access_token !== currentSession.access_token) {
          await supabase.auth.setSession(currentSession);
        }
      } else {
        setCurrentPasswordValid(false);
      }
    } catch (error: any) {
      console.error('Password validation error:', error);
      setCurrentPasswordValid(false);
    }
  };

  const handleCurrentPasswordBlur = () => {
    if (currentPassword) {
      validateCurrentPassword(currentPassword);
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;
  const isNewPasswordValid = passwordStrength >= 3;

  const isFormValid = currentPasswordValid && isNewPasswordValid && passwordsMatch;

  // Debug информация
  console.log('Password validation state:', {
    currentPasswordValid,
    isNewPasswordValid,
    passwordsMatch,
    passwordStrength,
    newPasswordLength: newPassword.length,
    confirmPasswordLength: confirmPassword.length,
    isFormValid
  });

  const getStrengthColor = (strength: number) => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-orange-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-green-500';
    return 'bg-emerald-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 1) return 'Слабый';
    if (strength <= 2) return 'Удовлетворительный';
    if (strength <= 3) return 'Хороший';
    if (strength <= 4) return 'Сильный';
    return 'Очень сильный';
  };

  const handlePasswordChange = async () => {
    console.log('handlePasswordChange called', { isFormValid, isLoading });
    
    if (!isFormValid) {
      console.log('Form is not valid, aborting. Validation state:', {
        currentPasswordValid,
        isNewPasswordValid,
        passwordsMatch,
        passwordStrength,
        newPasswordLength: newPassword.length,
        confirmPasswordLength: confirmPassword.length
      });
      
      // Показываем пользователю конкретную ошибку
      if (!currentPasswordValid) {
        toast({
          title: "Ошибка валидации",
          description: "Введите правильный текущий пароль",
          variant: "destructive"
        });
      } else if (!isNewPasswordValid) {
        toast({
          title: "Ошибка валидации", 
          description: "Новый пароль должен содержать минимум 8 символов и соответствовать требованиям безопасности",
          variant: "destructive"
        });
      } else if (!passwordsMatch) {
        toast({
          title: "Ошибка валидации",
          description: "Пароли не совпадают. Проверьте поле подтверждения пароля",
          variant: "destructive"
        });
      }
      return;
    }

    if (!user?.email) {
      console.log('No user email found');
      toast({
        title: "Ошибка",
        description: "Пользователь не авторизован",
        variant: "destructive"
      });
      return;
    }

    // Rate limiting check
    const rateLimitKey = `password_change_${user?.id}`;
    if (!checkRateLimit(rateLimitKey, 3, 300000, 900000)) {
      toast({
        title: "Слишком много попыток",
        description: "Попробуйте снова через 15 минут",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    console.log('Starting password update process');

    try {
      console.log('Starting password update with Supabase...');
      
      // Update password using Supabase auth
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      console.log('Password update completed:', { 
        success: !error, 
        error: error?.message,
        hasUser: !!data?.user
      });
      
      if (error) {
        console.error('Password update failed:', error);
        toast({
          title: "Ошибка смены пароля",
          description: error.message || "Не удалось обновить пароль",
          variant: "destructive"
        });
        return;
      }

      if (!data?.user) {
        console.error('No user data returned after password update');
        toast({
          title: "Ошибка",
          description: "Не удалось подтвердить обновление пароля",
          variant: "destructive"
        });
        return;
      }

      console.log('Password successfully updated, clearing form...');
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPasswordValid(false);

      toast({
        title: "Пароль успешно изменен",
        description: "Ваш новый пароль сохранен"
      });

      // Small delay before redirect to ensure toast is visible
      setTimeout(() => {
        console.log('Redirecting to profile page');
        navigate('/profile');
      }, 1000);
      
    } catch (error: any) {
      console.error('Unexpected error during password change:', error);
      toast({
        title: "Ошибка",
        description: error?.message || "Произошла неожиданная ошибка при смене пароля",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      console.log('Password change process completed');
    }
  };

  return (
    <SettingsLayout title="Смена пароля" backTo="/profile">
      <div className="p-4">
        <Card className="w-full bg-background border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Изменить пароль
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Для безопасности введите текущий пароль и создайте новый
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Current Password */}
            <div className="space-y-2">
              <div className="relative">
                <AnimatedInput
                  id="currentPassword"
                  label="Текущий пароль"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  onBlur={handleCurrentPasswordBlur}
                  placeholder="Введите текущий пароль"
                  icon={<Lock className="h-4 w-4" />}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {currentPassword && (
                <div className="flex items-center gap-2 text-xs">
                  {currentPasswordValid ? (
                    <>
                      <Check className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">Пароль верный</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="text-red-500">Неверный пароль</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <div className="relative">
                <AnimatedInput
                  id="newPassword"
                  label="Новый пароль"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Введите новый пароль"
                  icon={<Lock className="h-4 w-4" />}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="text-xs">
                    <div className="grid grid-cols-2 gap-1">
                      <span className={newPassword.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}>
                        ✓ Минимум 8 символов
                      </span>
                      <span className={/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-muted-foreground'}>
                        ✓ Заглавная буква
                      </span>
                      <span className={/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-muted-foreground'}>
                        ✓ Строчная буква
                      </span>
                      <span className={/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-muted-foreground'}>
                        ✓ Цифра
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <div className="relative">
                <AnimatedInput
                  id="confirmPassword"
                  label="Подтвердите новый пароль"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите новый пароль"
                  icon={<Lock className="h-4 w-4" />}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="flex items-center gap-2 text-xs">
                  {passwordsMatch ? (
                    <>
                      <Check className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">Пароли совпадают</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="text-red-500">Пароли не совпадают</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Save Button */}
            <Button 
              onClick={() => {
                console.log('Save button clicked');
                handlePasswordChange();
              }}
              disabled={!isFormValid || isLoading}
              className="w-full h-11 text-sm font-medium disabled:opacity-50"
            >
              {isLoading ? "Сохранение..." : "Сохранить новый пароль"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
};

export default PasswordChangePage;