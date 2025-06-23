
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Users, ArrowLeft, Phone } from 'lucide-react';
import { useUser, UserRole } from '@/contexts/UserContext';
import { toast } from '@/hooks/use-toast';

const RegistrationPage = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [step, setStep] = useState<'role' | 'phone' | 'code'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [phone, setPhone] = useState('+998');
  const [code, setCode] = useState('');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('phone');
  };

  const handlePhoneSubmit = () => {
    if (phone.length < 13) {
      toast({
        title: "Ошибка",
        description: "Введите корректный номер телефона",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate sending SMS code
    toast({
      title: "Код отправлен",
      description: "SMS с кодом подтверждения отправлен на ваш номер",
    });
    setStep('code');
  };

  const handleCodeSubmit = () => {
    if (code.length !== 4) {
      toast({
        title: "Ошибка",
        description: "Введите 4-значный код",
        variant: "destructive"
      });
      return;
    }

    // Simulate successful verification
    const newUser = {
      id: Date.now().toString(),
      phone,
      role: selectedRole!,
      isVerified: selectedRole === 'passenger', // Passengers verified immediately
    };

    setUser(newUser);
    
    if (selectedRole === 'driver') {
      navigate('/verification');
    } else {
      navigate('/passenger');
    }
  };

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
      setPhone(formatPhoneNumber(value));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary p-4">
      <div className="container mx-auto max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => step === 'role' ? navigate('/') : setStep(step === 'code' ? 'phone' : 'role')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <h1 className="text-2xl font-bold text-white">Yoldosh</h1>
          <div></div>
        </div>

        {step === 'role' && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Выберите роль</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => handleRoleSelect('passenger')}
                variant="outline"
                className="w-full h-20 text-lg border-2 hover:border-yoldosh-blue hover:bg-blue-50"
              >
                <div className="flex flex-col items-center">
                  <Users className="h-8 w-8 mb-2 text-yoldosh-blue" />
                  <span>Пассажир</span>
                  <span className="text-sm text-gray-500">Ищу поездку</span>
                </div>
              </Button>
              
              <Button
                onClick={() => handleRoleSelect('driver')}
                variant="outline"
                className="w-full h-20 text-lg border-2 hover:border-yoldosh-green hover:bg-green-50"
              >
                <div className="flex flex-col items-center">
                  <Car className="h-8 w-8 mb-2 text-yoldosh-green" />
                  <span>Водитель</span>
                  <span className="text-sm text-gray-500">Предлагаю поездку</span>
                </div>
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'phone' && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-center text-xl">
                Номер телефона
              </CardTitle>
              <p className="text-center text-gray-600">
                Введите номер для подтверждения
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="phone">Номер телефона</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="+998 (XX) XXX-XX-XX"
                    className="pl-10"
                    maxLength={19}
                  />
                </div>
              </div>
              
              <Button 
                onClick={handlePhoneSubmit}
                className="w-full bg-yoldosh-blue hover:bg-blue-700"
              >
                Получить код
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'code' && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-center text-xl">
                Код подтверждения
              </CardTitle>
              <p className="text-center text-gray-600">
                Введите код из SMS на номер<br />
                <span className="font-semibold">{phone}</span>
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="code">Код подтверждения</Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="XXXX"
                  className="text-center text-2xl tracking-widest"
                  maxLength={4}
                />
              </div>
              
              <Button 
                onClick={handleCodeSubmit}
                className="w-full bg-yoldosh-blue hover:bg-blue-700"
              >
                Подтвердить
              </Button>
              
              <button 
                onClick={() => setStep('phone')}
                className="w-full text-yoldosh-blue hover:underline text-sm"
              >
                Изменить номер телефона
              </button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RegistrationPage;
