
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, X, Clock, ChevronLeft } from 'lucide-react';
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
  const [recentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('yandex_recent_searches');
    return saved ? JSON.parse(saved) : [];
  });

  const handleLocationDetect = () => {
    setIsDetectingLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://geocode-maps.yandex.ru/1.x/?apikey=e50140a7-ffa3-493f-86d6-e25b5d1bfb17&geocode=${longitude},${latitude}&format=json&lang=ru_RU`
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
      onLocationSelect('Ташkent');
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
      <SheetContent side="bottom" className="h-full bg-white text-gray-900 border-0 rounded-t-3xl animate-slide-in-up">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center p-4 border-b border-gray-100">
            <Button variant="ghost" size="sm" onClick={onClose} className="mr-3">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>

          <div className="flex-1 p-4 space-y-4">
            {/* Search */}
            <div className="animate-fade-in">
              <YandexAddressSearch
                onAddressSelect={handleAddressSelect}
                placeholder="Введите полный адрес"
                value=""
                compact={true}
              />
            </div>

            {/* Current Location */}
            <Button
              onClick={handleLocationDetect}
              disabled={isDetectingLocation}
              className="w-full justify-between p-4 h-auto bg-white border border-gray-200 hover:bg-gray-50 rounded-2xl text-gray-900 animate-scale-in"
              style={{ animationDelay: '100ms' }}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Navigation className="h-5 w-5 text-blue-600" />
                </div>
                <span className="font-medium">
                  {isDetectingLocation ? 'Определяем местоположение...' : 'Использовать текущее местоположение'}
                </span>
              </div>
              <div className="text-gray-400">›</div>
            </Button>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-2 animate-scale-in" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center space-x-2 px-2 py-1">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Недавние поиски</span>
                </div>
                {recentSearches.slice(0, 3).map((address, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={() => handleLocationSelect(address)}
                    className="w-full justify-between p-4 h-auto bg-white border border-gray-200 hover:bg-gray-50 rounded-2xl animate-fade-in"
                    style={{ animationDelay: `${300 + index * 50}ms` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-full">
                        <Clock className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900 truncate">{address.split(',')[0]}</div>
                        <div className="text-sm text-gray-500 truncate">{address}</div>
                      </div>
                    </div>
                    <div className="text-gray-400">›</div>
                  </Button>
                ))}
              </div>
            )}

            {/* Popular Cities */}
            <div className="space-y-2 animate-scale-in" style={{ animationDelay: '400ms' }}>
              <div className="text-gray-600 text-sm font-medium px-2 py-1">Популярные города</div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {uzbekistanCities.map((city, index) => (
                  <Button
                    key={city}
                    variant="ghost"
                    onClick={() => handleLocationSelect(city)}
                    className={`w-full justify-start text-left hover:bg-gray-50 rounded-2xl px-4 py-3 h-auto animate-fade-in ${
                      city === currentLocation ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                    }`}
                    style={{ animationDelay: `${500 + index * 20}ms` }}
                  >
                    <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{city}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LocationSelector;
