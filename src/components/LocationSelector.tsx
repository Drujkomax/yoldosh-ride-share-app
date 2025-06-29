
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, X, Clock, ChevronLeft, Map } from 'lucide-react';
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
  const [showMapPicker, setShowMapPicker] = useState(false);
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

  const handleMapPicker = () => {
    setShowMapPicker(true);
    // В реальном проекте здесь бы открывалась карта для выбора местоположения
    // Пока что просто выбираем Ташкент как заглушку
    setTimeout(() => {
      handleLocationSelect('Ташкент, выбрано на карте');
      setShowMapPicker(false);
    }, 1000);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-full bg-white text-gray-900 border-0 rounded-t-3xl animate-slide-in-up">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center p-4 border-b border-gray-100 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={onClose} className="mr-3">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-gray-100 flex-shrink-0">
              <YandexAddressSearch
                onAddressSelect={handleAddressSelect}
                placeholder="Введите полный адрес"
                value=""
                compact={true}
              />
            </div>

            {/* Action Buttons */}
            <div className="p-4 space-y-3 border-b border-gray-100 flex-shrink-0">
              <Button
                onClick={handleLocationDetect}
                disabled={isDetectingLocation}
                className="w-full justify-start p-4 h-auto bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 hover:from-blue-100 hover:to-blue-150 hover:border-blue-300 rounded-2xl text-blue-700 font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className="p-2 bg-blue-500 rounded-full shadow-md">
                    <Navigation className={`h-5 w-5 text-white ${isDetectingLocation ? 'animate-pulse' : ''}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-left">
                      {isDetectingLocation ? 'Определяем местоположение...' : 'Использовать текущее местоположение'}
                    </div>
                    <div className="text-sm text-blue-600 opacity-80 text-left">
                      GPS определение вашей позиции
                    </div>
                  </div>
                  <div className="text-blue-400 text-xl">›</div>
                </div>
              </Button>

              <Button
                onClick={handleMapPicker}
                disabled={showMapPicker}
                className="w-full justify-start p-4 h-auto bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 hover:from-green-100 hover:to-green-150 hover:border-green-300 rounded-2xl text-green-700 font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className="p-2 bg-green-500 rounded-full shadow-md">
                    <Map className={`h-5 w-5 text-white ${showMapPicker ? 'animate-pulse' : ''}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-left">
                      {showMapPicker ? 'Открываем карту...' : 'Выбрать на карте'}
                    </div>
                    <div className="text-sm text-green-600 opacity-80 text-left">
                      Точное указание места на карте
                    </div>
                  </div>
                  <div className="text-green-400 text-xl">›</div>
                </div>
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="p-4 space-y-3 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Недавние поиски</span>
                  </div>
                  {recentSearches.slice(0, 3).map((address, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      onClick={() => handleLocationSelect(address)}
                      className="w-full justify-start p-4 h-auto bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-2xl transition-all duration-200 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <Clock className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-medium text-gray-900 truncate">{address.split(',')[0]}</div>
                          <div className="text-sm text-gray-500 truncate">{address}</div>
                        </div>
                        <div className="text-gray-400">›</div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}

              {/* Popular Cities */}
              <div className="p-4 space-y-3">
                <div className="text-gray-600 text-sm font-medium">Популярные города</div>
                <div className="space-y-2">
                  {uzbekistanCities.map((city, index) => (
                    <Button
                      key={city}
                      variant="ghost"
                      onClick={() => handleLocationSelect(city)}
                      className={`w-full justify-start text-left hover:bg-gray-50 hover:border-gray-300 rounded-2xl px-4 py-3 h-auto border transition-all duration-200 animate-fade-in ${
                        city === currentLocation 
                          ? 'bg-blue-50 text-blue-600 border-blue-200' 
                          : 'text-gray-900 border-gray-100'
                      }`}
                      style={{ animationDelay: `${index * 20}ms` }}
                    >
                      <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                      <span>{city}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LocationSelector;
