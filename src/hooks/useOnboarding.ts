
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { OnboardingData } from '@/types/onboarding';
import { toast } from 'sonner';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const useOnboarding = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    privacyConsent: false,
    marketingConsent: true,
    registrationMethod: 'email',
    firstName: '',
    lastName: '',
    phone: '+998',
    password: '',
    confirmPassword: '',
  });

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const completeRegistration = async () => {
    setIsLoading(true);
    try {
      console.log('Completing registration with data:', onboardingData);
      
      if (!onboardingData.password) {
        toast.error('Пароль не указан');
        return false;
      }

      // Создаем пользователя в Supabase Auth
      const userEmail = onboardingData.email || `${onboardingData.phone.replace(/\D/g, '')}@temp.com`;
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userEmail,
        password: onboardingData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            firstName: onboardingData.firstName,
            lastName: onboardingData.lastName,
            phone: onboardingData.phone,
            registrationMethod: onboardingData.registrationMethod,
          }
        }
      });

      if (authError) {
        console.error('Auth registration error:', authError);
        if (authError.message.includes('User already registered')) {
          toast.error('Пользователь с таким email уже зарегистрирован');
        } else {
          toast.error('Ошибка при создании аккаунта: ' + authError.message);
        }
        return false;
      }

      if (authData.user) {
        // Профиль будет создан автоматически через триггер
        // Обновляем дополнительные данные профиля
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            first_name: onboardingData.firstName,
            last_name: onboardingData.lastName,
            date_of_birth: onboardingData.dateOfBirth ? onboardingData.dateOfBirth.toISOString().split('T')[0] : null,
            marketing_consent: onboardingData.marketingConsent,
            privacy_consent: onboardingData.privacyConsent,
            registration_method: onboardingData.registrationMethod,
            terms_accepted_at: new Date().toISOString(),
            onboarding_completed: true,
          })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('Profile update error:', updateError);
          // Не фейлим регистрацию из-за ошибки обновления профиля
        }

        // Останавливаем загрузку ПЕРЕД навигацией
        setIsLoading(false);
        
        toast.success('Регистрация завершена успешно!');
        
        // Даем время для обновления состояния и навигации
        setTimeout(() => {
          navigate('/passenger-search');
        }, 100);
        
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Unexpected registration error:', error);
      toast.error('Произошла неожиданная ошибка при регистрации');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentStep,
    onboardingData,
    isLoading,
    updateOnboardingData,
    nextStep,
    prevStep,
    completeRegistration,
  };
};
