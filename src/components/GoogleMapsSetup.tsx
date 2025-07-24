import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Key, ExternalLink, Info, CheckCircle } from 'lucide-react';

const GoogleMapsSetup: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('google_maps_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsValid(true);
    }
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    
    setIsSaving(true);
    
    try {
      localStorage.setItem('google_maps_api_key', apiKey.trim());
      setIsValid(true);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to save API key:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    localStorage.removeItem('google_maps_api_key');
    setApiKey('');
    setIsValid(false);
    setShowSuccess(false);
  };

  const isKeyValid = apiKey.trim().length > 20; // Basic validation

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Google Maps API Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isValid && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Google Maps API key is configured and ready to use.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your Google Maps API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Need an API key? 
              <a 
                href="https://developers.google.com/maps/documentation/javascript/get-api-key" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center ml-1 text-blue-600 hover:text-blue-800"
              >
                Get one here <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Enable: Maps JavaScript API</p>
            <p>• Enable: Places API</p>
            <p>• Enable: Directions API</p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSave}
              disabled={!isKeyValid || isSaving}
              className="flex-1"
            >
              {isSaving ? 'Saving...' : showSuccess ? 'Saved!' : 'Save'}
            </Button>
            
            {isValid && (
              <Button 
                variant="outline" 
                onClick={handleClear}
                disabled={isSaving}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleMapsSetup;