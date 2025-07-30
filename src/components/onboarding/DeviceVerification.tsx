
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Shield } from 'lucide-react';
import AnimatedInput from '@/components/AnimatedInput';

interface DeviceVerificationProps {
  phone: string;
  onPhoneChange: (phone: string) => void;
  onNext: () => void;
}

const DeviceVerification = ({ phone, onPhoneChange, onNext }: DeviceVerificationProps) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.startsWith('998')) {
      const formatted = numbers.replace(/(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 ($2) $3-$4-$5');
      return `+${formatted}`;
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.startsWith('+998')) {
      onPhoneChange(formatPhoneNumber(value));
    }
  };

  const handleSendCode = () => {
    if (phone.length >= 13) {
      setIsCodeSent(true);
    }
  };

  const handleVerify = () => {
    if (verificationCode.length === 4) {
      onNext();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 flex flex-col justify-center p-6">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Верификация</h1>
          <p className="text-gray-600">Подтвердите номер телефона</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-lg text-center flex items-center justify-center space-x-2">
              <Shield className="h-5 w-5 text-teal-600" />
              <span>Безопасность</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isCodeSent ? (
              <>
                <AnimatedInput
                  id="phone"
                  label="Номер телефона"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+998 (XX) XXX-XX-XX"
                  maxLength={19}
                  icon={<Smartphone className="h-4 w-4" />}
                />
                
                <Button 
                  onClick={handleSendCode}
                  disabled={phone.length < 13}
                  className={`w-full h-12 text-base font-medium rounded-xl transition-all duration-300 ${
                    phone.length >= 13
                      ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Отправить код
                </Button>
              </>
            ) : (
              <>
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <p className="text-sm text-teal-700 mb-2">
                    Код отправлен на номер:
                  </p>
                  <p className="font-medium text-teal-800">{phone}</p>
                </div>

                <AnimatedInput
                  id="code"
                  label="Код подтверждения"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="1234"
                  maxLength={4}
                  className="text-center text-2xl tracking-widest font-bold"
                />
                
                <p className="text-xs text-gray-500 text-center">
                  Для демо введите любой 4-значный код
                </p>

                <Button 
                  onClick={handleVerify}
                  disabled={verificationCode.length !== 4}
                  className={`w-full h-12 text-base font-medium rounded-xl transition-all duration-300 ${
                    verificationCode.length === 4
                      ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Подтвердить
                </Button>

                <button
                  onClick={() => setIsCodeSent(false)}
                  className="w-full text-teal-600 hover:text-teal-700 text-sm py-2 hover:underline transition-colors"
                >
                  Изменить номер
                </button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeviceVerification;
