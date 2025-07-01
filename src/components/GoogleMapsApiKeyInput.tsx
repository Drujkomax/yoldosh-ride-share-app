
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, ExternalLink, Info } from 'lucide-react';

interface GoogleMapsApiKeyInputProps {
  autoSetKey?: string;
}

const GoogleMapsApiKeyInput: React.FC<GoogleMapsApiKeyInputProps> = ({ autoSetKey }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidKey, setIsValidKey] = useState(false);

  useEffect(() => {
    // Проверяем, есть ли сохраненный ключ
    const savedKey = localStorage.getItem('google_maps_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsValidKey(true);
    } else if (autoSetKey) {
      // Автоматически устанавливаем переданный ключ
      setApiKey(autoSetKey);
      localStorage.setItem('google_maps_api_key', autoSetKey);
      setIsValidKey(true);
    }
  }, [autoSetKey]);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('google_maps_api_key', apiKey.trim());
      setIsValidKey(true);
      
      // Перезагружаем страницу для применения нового ключа
      window.location.reload();
    }
  };

  const handleRemoveKey = () => {
    localStorage.removeItem('google_maps_api_key');
    setApiKey('');
    setIsValidKey(false);
    window.location.reload();
  };

  if (isValidKey) {
    return (
      <Alert className="mb-4">
        <Info className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Google Maps API ключ настроен</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveKey}
            className="ml-2"
          >
            Изменить
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-800">
          <Key className="h-5 w-5 mr-2" />
          Настройка Google Maps API
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Для работы с картами необходим Google Maps API ключ. 
            <a 
              href="https://developers.google.com/maps/documentation/javascript/get-api-key" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center ml-1 text-blue-600 hover:text-blue-800"
            >
              Получить ключ
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Введите ваш Google Maps API ключ"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="font-mono text-sm"
          />
          <Button 
            onClick={handleSaveKey}
            disabled={!apiKey.trim()}
            className="w-full"
          >
            Сохранить ключ
          </Button>
        </div>
        
        <div className="text-xs text-gray-600 space-y-1">
          <p>• Ключ сохраняется локально в вашем браузере</p>
          <p>• Убедитесь, что включены APIs: Maps JavaScript API, Places API, Directions API</p>
          <p>• Для продакшн использования рекомендуется настроить ограничения ключа</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleMapsApiKeyInput;
