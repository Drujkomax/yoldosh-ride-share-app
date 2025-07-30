
import React from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import PrivacySettings from '@/components/onboarding/PrivacySettings';
import RegistrationMethod from '@/components/onboarding/RegistrationMethod';
import EmailRegistration from '@/components/onboarding/EmailRegistration';
import DeviceVerification from '@/components/onboarding/DeviceVerification';
import PersonalInfo from '@/components/onboarding/PersonalInfo';
import PasswordCreation from '@/components/onboarding/PasswordCreation';
import DateOfBirth from '@/components/onboarding/DateOfBirth';

const OnboardingPage = () => {
  const {
    currentStep,
    onboardingData,
    isLoading,
    updateOnboardingData,
    nextStep,
    prevStep,
    completeRegistration,
  } = useOnboarding();

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PrivacySettings
            privacyConsent={onboardingData.privacyConsent}
            marketingConsent={onboardingData.marketingConsent}
            onPrivacyChange={(checked) => updateOnboardingData({ privacyConsent: checked })}
            onMarketingChange={(checked) => updateOnboardingData({ marketingConsent: checked })}
            onNext={nextStep}
          />
        );
      
      case 1:
        return (
          <RegistrationMethod
            selectedMethod={onboardingData.registrationMethod}
            onMethodSelect={(method) => updateOnboardingData({ registrationMethod: method })}
            onNext={nextStep}
          />
        );
      
      case 2:
        return (
          <EmailRegistration
            email={onboardingData.email || ''}
            marketingConsent={onboardingData.marketingConsent}
            onEmailChange={(email) => updateOnboardingData({ email })}
            onMarketingChange={(consent) => updateOnboardingData({ marketingConsent: consent })}
            onNext={nextStep}
          />
        );
      
      case 3:
        return (
          <DeviceVerification
            phone={onboardingData.phone}
            onPhoneChange={(phone) => updateOnboardingData({ phone })}
            onNext={nextStep}
          />
        );
      
      case 4:
        return (
          <PersonalInfo
            firstName={onboardingData.firstName}
            lastName={onboardingData.lastName}
            onFirstNameChange={(firstName) => updateOnboardingData({ firstName })}
            onLastNameChange={(lastName) => updateOnboardingData({ lastName })}
            onNext={nextStep}
          />
        );
      
      case 5:
        return (
          <PasswordCreation
            password={onboardingData.password || ''}
            confirmPassword={onboardingData.confirmPassword || ''}
            onPasswordChange={(password) => updateOnboardingData({ password })}
            onConfirmPasswordChange={(confirmPassword) => updateOnboardingData({ confirmPassword })}
            onNext={nextStep}
          />
        );
      
      case 6:
        return (
          <DateOfBirth
            dateOfBirth={onboardingData.dateOfBirth}
            onDateChange={(dateOfBirth) => updateOnboardingData({ dateOfBirth })}
            onNext={() => completeRegistration()}
            onSkip={() => completeRegistration()}
          />
        );
      
      default:
        return (
          <PrivacySettings
            privacyConsent={onboardingData.privacyConsent}
            marketingConsent={onboardingData.marketingConsent}
            onPrivacyChange={(checked) => updateOnboardingData({ privacyConsent: checked })}
            onMarketingChange={(checked) => updateOnboardingData({ marketingConsent: checked })}
            onNext={nextStep}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Завершаем регистрацию...</p>
        </div>
      </div>
    );
  }

  return renderStep();
};

export default OnboardingPage;
