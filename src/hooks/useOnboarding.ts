
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
    marketingConsent: false,
    registrationMethod: 'email',
    firstName: '',
    lastName: '',
    phone: '+998',
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
      
      const userId = generateUUID();
      
      // Создаем профиль пользователя с полными данными onboarding
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            phone: onboardingData.phone,
            name: `${onboardingData.firstName} ${onboardingData.lastName}`,
            first_name: onboardingData.firstName,
            last_name: onboardingData.lastName,
            email: onboardingData.email,
            date_of_birth: onboardingData.dateOfBirth ? onboardingData.dateOfBirth.toISOString().split('T')[0] : null,
            marketing_consent: onboardingData.marketingConsent,
            privacy_consent: onboardingData.privacyConsent,
            registration_method: onboardingData.registrationMethod,
            terms_accepted_at: new Date().toISOString(),
            onboarding_completed: true,
            is_verified: false,
            total_rides: 0,
            rating: 0.0
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Registration error:', error);
        if (error.code === '23505') {
          toast.error('Пользователь с таким номером или email уже существует');
        } else {
          toast.error('Ошибка при регистрации');
        }
        return false;
      }

      // Сохраняем пользователя в контексте
      const userProfile = {
        id: profile.id,
        phone: profile.phone,
        name: profile.name,
        isVerified: profile.is_verified || false,
        totalRides: profile.total_rides || 0,
        rating: profile.rating || 0.0,
        avatarUrl: profile.avatar_url
      };

      setUser(userProfile);
      
      toast.success('Регистрация завершена успешно!');
      navigate('/passenger-search');
      return true;
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
