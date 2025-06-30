
import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: string;
}

interface LocationMessageProps {
  locationData: LocationData;
  isOwnMessage: boolean;
}

const LocationMessage: React.FC<LocationMessageProps> = ({ locationData, isOwnMessage }) => {
  const handleOpenInMaps = () => {
    const { latitude, longitude } = locationData;
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className={`max-w-xs rounded-2xl p-4 ${
      isOwnMessage 
        ? 'bg-blue-500 text-white ml-auto' 
        : 'bg-gray-100 text-gray-900'
    }`}>
      <div className="flex items-center space-x-2 mb-2">
        <MapPin className="h-4 w-4" />
        <span className="text-sm font-medium">Местоположение</span>
      </div>
      
      {locationData.address && (
        <p className="text-sm mb-3 opacity-90">
          {locationData.address}
        </p>
      )}
      
      <div className="flex items-center justify-between">
        <span className="text-xs opacity-75">
          {formatTime(locationData.timestamp)}
        </span>
        <Button
          size="sm"
          variant={isOwnMessage ? "secondary" : "default"}
          onClick={handleOpenInMaps}
          className="h-7 px-2 text-xs"
        >
          <Navigation className="h-3 w-3 mr-1" />
          Открыть
        </Button>
      </div>
    </div>
  );
};

export default LocationMessage;
