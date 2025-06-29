
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Eye, Bell } from 'lucide-react';

interface PrivacySettingsProps {
  privacyConsent: boolean;
  marketingConsent: boolean;
  onPrivacyChange: (checked: boolean) => void;
  onMarketingChange: (checked: boolean) => void;
  onNext: () => void;
}

const PrivacySettings = ({
  privacyConsent,
  marketingConsent,
  onPrivacyChange,
  onMarketingChange,
  onNext
}: PrivacySettingsProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center p-6">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Настройки приватности</h1>
          <p className="text-gray-600">Мы заботимся о ваших данных</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-lg">Управление данными</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
              <Checkbox
                id="privacy"
                checked={privacyConsent}
                onCheckedChange={onPrivacyChange}
              />
              <div className="flex-1">
                <label htmlFor="privacy" className="text-sm font-medium text-gray-900 cursor-pointer">
                  Согласие на обработку персональных данных
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Обязательно для использования сервиса
                </p>
              </div>
              <Eye className="h-5 w-5 text-blue-600" />
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <Checkbox
                id="marketing"
                checked={marketingConsent}
                onCheckedChange={onMarketingChange}
              />
              <div className="flex-1">
                <label htmlFor="marketing" className="text-sm font-medium text-gray-900 cursor-pointer">
                  Согласие на маркетинговые уведомления
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Получать уведомления о скидках и новостях
                </p>
              </div>
              <Bell className="h-5 w-5 text-gray-400" />
            </div>

            <Button 
              onClick={onNext}
              disabled={!privacyConsent}
              className={`w-full h-12 text-base font-medium rounded-xl transition-all duration-300 ${
                privacyConsent 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Продолжить
            </Button>
            
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              Нажимая "Продолжить", вы соглашаетесь с нашими{' '}
              <span className="text-blue-600 underline">Условиями использования</span> и{' '}
              <span className="text-blue-600 underline">Политикой конфиденциальности</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacySettings;
