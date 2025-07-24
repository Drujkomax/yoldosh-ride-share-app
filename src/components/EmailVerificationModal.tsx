import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  newEmail: string;
  onVerified: () => void;
}

export const EmailVerificationModal = ({ isOpen, onClose, newEmail, onVerified }: EmailVerificationModalProps) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const sendVerificationCode = async () => {
    setIsSending(true);
    try {
      // Отправляем код через edge function
      const { error } = await supabase.functions.invoke('send-verification-email', {
        body: { email: newEmail }
      });

      if (error) throw error;

      toast({
        title: "Код отправлен",
        description: `Код подтверждения отправлен на ${newEmail}`,
      });
    } catch (error) {
      console.error('Ошибка отправки кода:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить код подтверждения",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите код подтверждения",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Проверяем код (пока используем тестовый код "123456")
      if (verificationCode === "123456") {
        toast({
          title: "Email подтвержден",
          description: "Ваш новый email адрес успешно подтвержден",
        });
        onVerified();
        onClose();
      } else {
        toast({
          title: "Неверный код",
          description: "Введен неправильный код подтверждения",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Ошибка верификации:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось подтвердить код",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setVerificationCode('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Подтверждение email</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Для подтверждения нового email адреса {newEmail}, введите код, который мы отправили на эту почту.
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="verification-code">Код подтверждения</Label>
            <Input
              id="verification-code"
              placeholder="Введите код из письма"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={verifyCode}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Проверка...' : 'Подтвердить'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={sendVerificationCode}
              disabled={isSending}
              className="w-full"
            >
              {isSending ? 'Отправка...' : 'Отправить код повторно'}
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={handleClose}
              className="w-full"
            >
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};