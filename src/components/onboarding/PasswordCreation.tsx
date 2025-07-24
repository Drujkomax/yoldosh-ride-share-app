import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import AnimatedInput from '@/components/AnimatedInput';

interface PasswordCreationProps {
  password: string;
  confirmPassword: string;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (confirmPassword: string) => void;
  onNext: () => void;
}

const PasswordCreation = ({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  onNext,
}: PasswordCreationProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isValid = passwordStrength >= 3 && passwordsMatch;

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

        {/* Password Form */}
        <div className="flex-1 flex items-center justify-center pb-6">
          <Card className="w-full animate-slide-up bg-white/95 backdrop-blur-lg border-0 rounded-2xl shadow-2xl">
            <CardHeader className="text-center pb-3">
              <CardTitle className="text-lg font-bold text-slate-800">
                Создайте пароль
              </CardTitle>
              <p className="text-slate-600 text-sm">
                Придумайте надежный пароль для входа
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4 p-5">
              <div className="relative">
                <AnimatedInput
                  id="password"
                  label="Пароль"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  placeholder="Введите пароль"
                  icon={<Lock className="h-4 w-4" />}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    <div className="grid grid-cols-2 gap-1">
                      <span className={password.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                        ✓ Минимум 8 символов
                      </span>
                      <span className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                        ✓ Заглавная буква
                      </span>
                      <span className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                        ✓ Строчная буква
                      </span>
                      <span className={/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                        ✓ Цифра
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="relative">
                <AnimatedInput
                  id="confirmPassword"
                  label="Подтвердите пароль"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => onConfirmPasswordChange(e.target.value)}
                  placeholder="Повторите пароль"
                  icon={<Lock className="h-4 w-4" />}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="flex items-center gap-2 text-xs">
                  {passwordsMatch ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
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
              
              <Button 
                onClick={onNext}
                disabled={!isValid}
                className="w-full h-10 text-sm bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-xl shadow-lg disabled:opacity-50"
              >
                Продолжить
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PasswordCreation;