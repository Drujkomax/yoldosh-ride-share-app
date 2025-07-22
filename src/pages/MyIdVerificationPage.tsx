import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Clock, AlertCircle } from 'lucide-react';
import MobilePageLayout from '@/components/MobilePageLayout';

const MyIdVerificationPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/profile');
  };

  return (
    <MobilePageLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleBack}
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-gray-900">Верификация MyID</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-6">
          {/* Main Card */}
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-teal-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Верификация паспорта через MyID
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-center space-x-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-800 font-medium">
                  Интеграция в разработке
                </span>
              </div>

              {/* Description */}
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  В ближайшее время будет интегрирован API MyID для быстрой и безопасной верификации вашего паспорта.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <h4 className="font-medium text-blue-900 mb-1">
                        Что это даст?
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Мгновенная верификация документов</li>
                        <li>• Повышение доверия других пользователей</li>
                        <li>• Доступ к дополнительным функциям</li>
                        <li>• Безопасность всех участников поездок</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coming Soon */}
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 font-medium">
                    Скоро будет доступно
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                О верификации MyID
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  MyID — это государственная система цифровой идентификации, которая позволяет быстро и безопасно подтвердить личность онлайн.
                </p>
                <p>
                  После интеграции вы сможете пройти верификацию за несколько минут, используя свои паспортные данные.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobilePageLayout>
  );
};

export default MyIdVerificationPage;