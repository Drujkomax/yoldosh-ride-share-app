import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  onVerificationSuccess: () => void;
}

const PhoneVerificationModal = ({ 
  isOpen, 
  onClose, 
  phoneNumber, 
  onVerificationSuccess 
}: PhoneVerificationModalProps) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const sendVerificationCode = async () => {
    setIsSendingCode(true);
    try {
      // Здесь будет логика отправки SMS кода
      // Пока что имитируем отправку
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // В реальном приложении здесь будет вызов к edge function или SMS провайдеру
      toast.success(`Код верификации отправлен на номер ${phoneNumber}`);
      setCountdown(60); // 60 секунд до возможности повторной отправки
    } catch (error) {
      console.error('Ошибка отправки SMS:', error);
      toast.error('Ошибка при отправке кода верификации');
    } finally {
      setIsSendingCode(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Введите 6-значный код');
      return;
    }

    setIsLoading(true);
    try {
      // Здесь будет логика проверки кода
      // Пока что имитируем проверку - принимаем код "123456"
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (verificationCode === '123456') {
        toast.success('Номер телефона успешно подтвержден');
        onVerificationSuccess();
        onClose();
      } else {
        toast.error('Неверный код верификации');
      }
    } catch (error) {
      console.error('Ошибка верификации:', error);
      toast.error('Ошибка при проверке кода');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setVerificationCode('');
    setCountdown(0);
    onClose();
  };

  // Автоматически отправляем код при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      sendVerificationCode();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Подтверждение номера телефона</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600">
              Мы отправили код подтверждения на номер:
            </p>
            <p className="font-semibold text-lg">{phoneNumber}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Введите 6-значный код
            </label>
            <Input
              type="text"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="text-center text-xl tracking-widest"
            />
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={verifyCode}
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Подтвердить номер
            </Button>

            <Button 
              variant="outline"
              onClick={sendVerificationCode}
              disabled={isSendingCode || countdown > 0}
              className="w-full"
            >
              {isSendingCode && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {countdown > 0 
                ? `Повторить через ${countdown}с`
                : 'Отправить код повторно'
              }
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Не получили код? Проверьте правильность номера телефона</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhoneVerificationModal;