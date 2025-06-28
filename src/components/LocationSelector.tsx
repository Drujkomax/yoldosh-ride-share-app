
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, X } from 'lucide-react';
import YandexAddressSearch from './YandexAddressSearch';

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: string) => void;
  title: string;
  currentLocation: string;
}

const uzbekistanCities = [
  'Ташкент', 'Самарканд', 'Бухара', 'Андижан', 'Наманган', 'Фергана',
  'Карши', 'Термез', 'Ургенч', 'Нукус', 'Джизак', 'Навои', 'Гулистан',
  'Коканд', 'Маргилан', 'Чирчик', 'Ангрен', 'Олмалык', 'Шахрисабз', 'Турткуль'
];

const LocationSelector = ({ isOpen, onClose, onLocationSelect, title, currentLocation }: LocationSelectorProps) => {
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const handleLocationDetect = () => {
    setIsDetectingLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Используем координаты для получения адреса через Яндекс API
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://geocode-maps.yandex.ru/1.x/?apikey=fc46d1dc-d099-42f9-baf7-e6d468df0eef&geocode=${longitude},${latitude}&format=json&lang=ru_RU`
            );
            
            if (response.ok) {
              const data = await response.json();
              const geoObject = data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
              if (geoObject) {
                const address = geoObject.name || geoObject.description || 'Ташкент';
                onLocationSelect(address);
              } else {
                onLocationSelect('Ташкент');
              }
            } else {
              onLocationSelect('Ташкент');
            }
          } catch (error) {
            console.error('Error getting address:', error);
            onLocationSelect('Ташкент');
          } finally {
            setIsDetectingLocation(false);
            onClose();
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          onLocationSelect('Ташкент');
          setIsDetectingLocation(false);
          onClose();
        }
      );
    } else {
      onLocationSelect('Ташкент');
      setIsDetectingLocation(false);
      onClose();
    }
  };

  const handleLocationSelect = (location: string) => {
    onLocationSelect(location);
    onClose();
  };

  const handleAddressSelect = (address: string, coordinates?: [number, number]) => {
    console.log('Selected address:', address, 'Coordinates:', coordinates);
    handleLocationSelect(address);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-full bg-gray-900 text-white border-0 rounded-t-3xl">
        <SheetHeader className="text-left mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold text-white">{title}</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-gray-800">
              <X className="h-6 w-6" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Yandex Address Search */}
          <YandexAddressSearch
            onAddressSelect={handleAddressSelect}
            placeholder="Введите точный адрес"
            value=""
          />

          {/* Location Detection Button */}
          <Button
            onClick={handleLocationDetect}
            disabled={isDetectingLocation}
            className="w-full h-14 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl text-lg font-medium flex items-center justify-between px-6"
          >
            <div className="flex items-center">
              <Navigation className="h-6 w-6 mr-4" />
              {isDetectingLocation ? 'Определяем местоположение...' : 'Использовать мое местоположение'}
            </div>
            <div className="text-gray-400">›</div>
          </Button>

          {/* Popular Cities */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <div className="text-gray-400 text-sm font-medium px-2 mb-3">Популярные города</div>
            {uzbekistanCities.map((city) => (
              <Button
                key={city}
                variant="ghost"
                onClick={() => handleLocationSelect(city)}
                className={`w-full h-14 justify-start text-left hover:bg-gray-800 rounded-2xl px-6 ${
                  city === currentLocation ? 'bg-gray-800 text-blue-400' : 'text-white'
                }`}
              >
                <MapPin className="h-5 w-5 mr-4 text-gray-400" />
                <span className="text-lg">{city}</span>
              </Button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LocationSelector;
