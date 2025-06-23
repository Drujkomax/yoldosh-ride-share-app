
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, Camera, FileText, CheckCircle, Upload } from 'lucide-react';
import PhotoUpload from '@/components/PhotoUpload';

const VerificationPage = () => {
  const navigate = useNavigate();
  const [selfieWithLicense, setSelfieWithLicense] = useState<string | null>(null);
  const [carDocuments, setCarDocuments] = useState<string | null>(null);
  const [additionalDocs, setAdditionalDocs] = useState<string[]>([]);
  const [step, setStep] = useState(1);

  const handleAddAdditionalDoc = (doc: string) => {
    setAdditionalDocs([...additionalDocs, doc]);
  };

  const handleRemoveAdditionalDoc = (index: number) => {
    setAdditionalDocs(additionalDocs.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Simulate verification submission
    alert('Документы отправлены на проверку!');
    navigate('/driver');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
                <Camera className="h-6 w-6 mr-3 text-yoldosh-primary" />
                Селфи с водительскими правами
              </CardTitle>
              <p className="text-slate-600">
                Сделайте селфи, держа водительские права рядом с лицом
              </p>
            </CardHeader>
            <CardContent>
              <PhotoUpload
                value={selfieWithLicense}
                onChange={setSelfieWithLicense}
                placeholder="Сделайте селфи с правами"
                cameraOnly={true}
              />
              {selfieWithLicense && (
                <div className="mt-4 flex items-center space-x-2 text-yoldosh-success">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Фото загружено</span>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
                <FileText className="h-6 w-6 mr-3 text-yoldosh-secondary" />
                Документы на автомобиль
              </CardTitle>
              <p className="text-slate-600">
                Загрузите технический паспорт автомобиля
              </p>
            </CardHeader>
            <CardContent>
              <PhotoUpload
                value={carDocuments}
                onChange={setCarDocuments}
                placeholder="Загрузите техпаспорт"
              />
              {carDocuments && (
                <div className="mt-4 flex items-center space-x-2 text-yoldosh-success">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Документ загружен</span>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
                <Upload className="h-6 w-6 mr-3 text-yoldosh-accent" />
                Дополнительные документы
                <Badge className="ml-3 bg-slate-100 text-slate-600">Необязательно</Badge>
              </CardTitle>
              <p className="text-slate-600">
                Загрузите любые дополнительные документы (страховка, справки и т.д.)
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <PhotoUpload
                value={null}
                onChange={(doc) => doc && handleAddAdditionalDoc(doc)}
                placeholder="Загрузить дополнительный документ"
              />
              
              {additionalDocs.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-800">Загруженные документы:</h4>
                  {additionalDocs.map((doc, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                      <img src={doc} alt={`Документ ${index + 1}`} className="w-12 h-12 object-cover rounded-lg" />
                      <span className="flex-1 text-sm text-slate-600">Документ {index + 1}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveAdditionalDoc(index)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Удалить
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="rounded-xl hover:bg-yoldosh-primary/10 p-3"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад
            </Button>
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Верификация
              </h1>
              <p className="text-slate-600 mt-1">Шаг {step} из 3</p>
            </div>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  stepNum <= step
                    ? 'bg-gradient-primary text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {stepNum}
              </div>
            ))}
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current Step */}
        {renderStep()}

        {/* Navigation Buttons */}
        <div className="flex space-x-4 mt-8">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="flex-1 h-14 rounded-2xl"
            >
              Назад
            </Button>
          )}
          
          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !selfieWithLicense) ||
                (step === 2 && !carDocuments)
              }
              className="flex-1 h-14 bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-2xl"
            >
              Далее
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!selfieWithLicense || !carDocuments}
              className="flex-1 h-14 bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-2xl"
            >
              <Shield className="h-5 w-5 mr-2" />
              Отправить на проверку
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
