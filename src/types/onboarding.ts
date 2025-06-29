
export interface OnboardingData {
  privacyConsent: boolean;
  marketingConsent: boolean;
  registrationMethod: 'email' | 'facebook' | 'apple';
  email?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  phone: string;
  verificationCode?: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<any>;
}
