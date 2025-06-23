
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/hooks/use-toast';

const VerificationPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [step, setStep] = useState(1);
  const [documents, setDocuments] = useState({
    license: null as File | null,
    registration: null as File | null,
    selfie: null as File | null
  });

  const handleFileUpload = (type: keyof typeof documents) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocuments(prev => ({ ...prev, [type]: file }));
      toast({
        title: "Файл загружен",
        description: `${file.name} успешно загружен`,
      });
    }
  };

  const handleNext = () => {
    if (step === 1 && !documents.license) {
      toast({
        title: "Ошибка",
        description: "Загрузите фото водительских прав",
        variant: "destructive"
      });
      return;
    }
    
    if (step === 2 && !documents.registration) {
      toast({
        title: "Ошибка",
        description: "Загрузите фото техпаспорта",
        variant: "destructive"
      });
      return;
    }
    
    if (step === 3 && !documents.selfie) {
      toast({
        title: "Ошибка",
        description: "Сделайте селфи для верификации",
        variant: "destructive"
      });
      return;
    }
    
    setStep(step + 1);
  };

  const handleSubmit = () => {
    // Simulate verification process
    if (user) {
      setUser({ ...user, isVerified: true });
    }
    
    toast({
      title: "Верификация отправлена!",
      description: "Ваши документы отправлены на проверку. Результат придет в течение 24 часов.",
    });
    
    navigate('/driver');
  };

  const DocumentUpload = ({ 
    title, 
    description, 
    icon: Icon, 
    file, 
    onUpload, 
    accept = "image/*" 
  }: {
    title: string;
    description: string;
    icon: any;
    file: File | null;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    accept?: string;
  }) => (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-yoldosh-blue transition-colors">
      <Icon className={`h-12 w-12 mx-auto mb-4 ${file ? 'text-green-500' : 'text-gray-400'}`} />
      <h3 className="font-medium mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      
      {file ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center text-green-600">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Загружено: {file.name}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => document.getElementById(`upload-${title}`)?.click()}>
            Заменить файл
          </Button>
        </div>
      ) : (
        <Button 
          variant="outline" 
          onClick={() => document.getElementById(`upload-${title}`)?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Загрузить
        </Button>
      )}
      
      <input
        id={`upload-${title}`}
        type="file"
        accept={accept}
        onChange={onUpload}
        className="hidden"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/driver')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <h1 className="text-xl font-bold">Верификация водителя</h1>
            <div className="text-sm text-gray-500">{step}/4</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  num <= step ? 'bg-yoldosh-blue text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {num}
                </div>
                {num < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    num < step ? 'bg-yoldosh-blue' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-2xl mx-auto">
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Шаг 1: Водительские права</CardTitle>
                <p className="text-gray-600">Загрузите четкое фото ваших водительских прав</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <DocumentUpload
                  title="Водительские права"
                  description="Загрузите фото лицевой стороны прав"
                  icon={Upload}
                  file={documents.license}
                  onUpload={handleFileUpload('license')}
                />
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Требования к фото:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Все данные должны быть четко видны</li>
                        <li>Без бликов и размытости</li>
                        <li>Формат JPG или PNG</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleNext} 
                  className="w-full bg-yoldosh-blue hover:bg-blue-700"
                  disabled={!documents.license}
                >
                  Далее
                </Button>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Шаг 2: Техпаспорт автомобиля</CardTitle>
                <p className="text-gray-600">Загрузите фото технического паспорта вашего автомобиля</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <DocumentUpload
                  title="Техпаспорт"
                  description="Загрузите фото первой страницы техпаспорта"
                  icon={Upload}
                  file={documents.registration}
                  onUpload={handleFileUpload('registration')}
                />
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium mb-1">Проверяемые данные:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Марка и модель автомобиля</li>
                        <li>Государственный номер</li>
                        <li>Данные владельца</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleNext} 
                  className="w-full bg-yoldosh-blue hover:bg-blue-700"
                  disabled={!documents.registration}
                >
                  Далее
                </Button>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Шаг 3: Селфи для верификации</CardTitle>
                <p className="text-gray-600">Сделайте селфи с водительскими правами для подтверждения личности</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <DocumentUpload
                  title="Селфи с правами"
                  description="Сделайте селфи, держа права рядом с лицом"
                  icon={Camera}
                  file={documents.selfie}
                  onUpload={handleFileUpload('selfie')}
                  accept="image/*"
                />
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Инструкции для селфи:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Держите права рядом с лицом</li>
                        <li>Убедитесь, что лицо и права хорошо видны</li>
                        <li>Используйте хорошее освещение</li>
                        <li>Не используйте маски или очки</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleNext} 
                  className="w-full bg-yoldosh-blue hover:bg-blue-700"
                  disabled={!documents.selfie}
                >
                  Далее
                </Button>
              </CardContent>
            </>
          )}

          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>Шаг 4: Подтверждение</CardTitle>
                <p className="text-gray-600">Проверьте загруженные документы перед отправкой</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Водительские права</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Техпаспорт автомобиля</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Селфи для верификации</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Важно:</span> Процесс верификации может занять до 24 часов. 
                    Вы получите уведомление о результате проверки.
                  </p>
                </div>
                
                <Button 
                  onClick={handleSubmit} 
                  className="w-full bg-yoldosh-green hover:bg-green-700"
                >
                  Отправить на проверку
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default VerificationPage;
