import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, Shield, ExternalLink, Eye, EyeOff } from 'lucide-react';

interface ApiKey {
  name: string;
  value: string;
  description: string;
  required: boolean;
  visible: boolean;
}

const SecurityApiKeysForm: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      name: 'Google Maps API Key',
      value: localStorage.getItem('google_maps_api_key') || '',
      description: 'Required for Google Maps integration and geocoding services',
      required: true,
      visible: false
    }
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleKeyChange = (index: number, value: string) => {
    const newKeys = [...apiKeys];
    newKeys[index].value = value;
    setApiKeys(newKeys);
    setSaved(false);
  };

  const toggleVisibility = (index: number) => {
    const newKeys = [...apiKeys];
    newKeys[index].visible = !newKeys[index].visible;
    setApiKeys(newKeys);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Save to localStorage (encrypted in production)
      apiKeys.forEach(key => {
        const storageKey = key.name.toLowerCase().replace(/\s+/g, '_').replace('api_key', 'api_key');
        if (key.value.trim()) {
          localStorage.setItem(storageKey, key.value.trim());
        } else {
          localStorage.removeItem(storageKey);
        }
      });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save API keys:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const validateApiKey = (key: ApiKey): boolean => {
    if (!key.required) return true;
    return key.value.trim().length > 0;
  };

  const allRequiredKeysValid = apiKeys.filter(key => key.required).every(validateApiKey);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Notice:</strong> API keys are stored locally in your browser. 
          For production applications, these should be managed server-side for better security.
        </AlertDescription>
      </Alert>

      {apiKeys.map((key, index) => (
        <Card key={key.name} className={`border-2 ${key.required && !validateApiKey(key) ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Key className="h-5 w-5 mr-2" />
              {key.name}
              {key.required && <span className="text-red-500 ml-1">*</span>}
            </CardTitle>
            <p className="text-sm text-gray-600">{key.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                type={key.visible ? 'text' : 'password'}
                placeholder={`Enter your ${key.name}`}
                value={key.value}
                onChange={(e) => handleKeyChange(index, e.target.value)}
                className="pr-10 font-mono text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => toggleVisibility(index)}
              >
                {key.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {key.name === 'Google Maps API Key' && (
              <div className="text-xs text-gray-600 space-y-1">
                <p>• Required APIs: Maps JavaScript API, Places API, Directions API</p>
                <p>• <a 
                    href="https://developers.google.com/maps/documentation/javascript/get-api-key" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    Get your API key <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </p>
              </div>
            )}
            
            {key.name === 'Yandex Maps API Key' && (
              <div className="text-xs text-gray-600">
                <p>• <a 
                    href="https://developer.tech.yandex.ru/services/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    Get your API key <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </p>
              </div>
            )}
            
            {key.name === '2GIS API Key' && (
              <div className="text-xs text-gray-600">
                <p>• <a 
                    href="https://api.2gis.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    Get your API key <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end space-x-4">
        <Button
          onClick={handleSave}
          disabled={isSaving || !allRequiredKeysValid}
          className="px-6"
        >
          {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save API Keys'}
        </Button>
      </div>

      {!allRequiredKeysValid && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            Please provide all required API keys before proceeding.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SecurityApiKeysForm;