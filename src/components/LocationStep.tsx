
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight, Search, Navigation, ChevronLeft, Clock } from 'lucide-react';
import MapLocationPicker2Gis from './MapLocationPicker2Gis';
import YandexAddressSearch from './YandexAddressSearch';

interface LocationStepProps {
  title: string;
  subtitle: string;
  onLocationSelect: (coordinates: [number, number], address: string) => void;
  onNext: () => void;
  selectedLocation?: [number, number];
  selectedAddress?: string;
  icon?: React.ReactNode;
}

const LocationStep = ({ 
  title, 
  subtitle, 
  onLocationSelect, 
  onNext,
  selectedLocation,
  selectedAddress,
  icon
}: LocationStepProps) => {
  const [activeTab, setActiveTab] = useState<'search' | 'map'>('search');
  const [recentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('recent_searches');
    return saved ? JSON.parse(saved) : [];
  });

  const handleLocationSelect = (coordinates: [number, number], address: string) => {
    onLocationSelect(coordinates, address);
  };

  const handleAddressSelect = (address: string, coordinates?: [number, number]) => {
    if (coordinates) {
      onLocationSelect(coordinates, address);
    }
  };

  const handleRecentAddressSelect = (address: string) => {
    // Для недавних поисков пытаемся найти координаты через 2GIS API
    const geocodeAddress = async () => {
      try {
        const response = await fetch(
          `https://catalog.api.2gis.com/3.0/items/geocode?q=${encodeURIComponent(address)}&key=e50140a7-ffa3-493f-86d6-e25b5d1bfb17&location=69.240073,41.311081&radius=50000&fields=items.point&locale=ru_RU`
        );
        
        if (response.ok) {
          const data = await response.json();
          const item = data.result?.items?.[0];
          if (item) {
            const coords: [number, number] = [item.point.lat, item.point.lon];
            onLocationSelect(coords, address);
          }
        }
      } catch (error) {
        console.error('Error geocoding address:', error);
      }
    };
    geocodeAddress();
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          
          try {
            const response = await fetch(
              `https://catalog.api.2gis.com/3.0/items/geocode?lat=${coords[0]}&lon=${coords[1]}&key=e50140a7-ffa3-493f-86d6-e25b5d1bfb17&fields=items.point&locale=ru_RU`
            );
            
            if (response.ok) {
              const data = await response.json();
              const item = data.result?.items?.[0];
              const address = item?.full_name || item?.address_name || 'Текущее местоположение';
              onLocationSelect(coords, address);
            } else {
              onLocationSelect(coords, 'Текущее местоположение');
            }
          } catch (error) {
            console.error('Error getting address:', error);
            onLocationSelect(coords, 'Текущее местоположение');
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      {/* Header с кнопкой назад */}
      <div className="bg-white shadow-sm">
        <div className="flex items-center p-4">
          <Button variant="ghost" size="sm" className="mr-3">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Кнопки быстрого выбора - расположены горизонтально */}
        <div className="flex space-x-2 animate-scale-in" style={{ animationDelay: '100ms' }}>
          <Button
            onClick={handleUseCurrentLocation}
            variant="ghost"
            className="flex-1 justify-center p-3 h-auto bg-white rounded-2xl shadow-sm hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-300"
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <Navigation className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-blue-700 font-medium text-sm">Текущее</span>
            </div>
          </Button>

          <Button
            onClick={() => setActiveTab('map')}
            variant="ghost"
            className="flex-1 justify-center p-3 h-auto bg-white rounded-2xl shadow-sm hover:bg-green-50 border-2 border-green-200 hover:border-green-300"
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="p-2 bg-green-100 rounded-full">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-green-700 font-medium text-sm">На карте</span>
            </div>
          </Button>
        </div>

        {/* Поиск адреса */}
        <div className="bg-white rounded-2xl p-4 shadow-sm animate-scale-in" style={{ animationDelay: '200ms' }}>
          <YandexAddressSearch
            onAddressSelect={handleAddressSelect}
            placeholder="Введите полный адрес"
            value={selectedAddress || ''}
            compact={true}
          />
        </div>

        {/* Недавние поиски */}
        {recentSearches.length > 0 && (
          <div className="space-y-2 animate-scale-in" style={{ animationDelay: '300ms' }}>
            {recentSearches.slice(0, 4).map((address, index) => (
              <Button
                key={index}
                onClick={() => handleRecentAddressSelect(address)}
                variant="ghost"
                className="w-full justify-between p-4 h-auto bg-white rounded-2xl shadow-sm hover:bg-gray-50 animate-fade-in"
                style={{ animationDelay: `${400 + index * 50}ms` }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Clock className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="text-left">
                    <div className="text-gray-900 font-medium truncate">{address.split(',')[0]}</div>
                    <div className="text-gray-500 text-sm truncate">{address}</div>
                  </div>
                </div>
                <div className="text-gray-400">›</div>
              </Button>
            ))}
          </div>
        )}

        {/* Отображение выбранного адреса */}
        {selectedAddress && (
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-sm animate-scale-in">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-green-500 rounded-full">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-800 mb-1">Выбранный адрес</h3>
                <p className="text-green-700 leading-relaxed">{selectedAddress}</p>
              </div>
            </div>
          </div>
        )}

        {/* Кнопка продолжения */}
        {selectedLocation && selectedAddress && (
          <div className="pt-4 animate-scale-in">
            <Button 
              onClick={onNext}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Продолжить
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        )}
      </div>

      {/* Полноэкранная карта */}
      {activeTab === 'map' && (
        <div className="fixed inset-0 z-50 bg-white animate-slide-in-right">
          <div className="flex flex-col h-full">
            <div className="bg-white shadow-sm p-4 flex items-center">
              <Button 
                onClick={() => setActiveTab('search')} 
                variant="ghost" 
                size="sm" 
                className="mr-3"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold">Выберите на карте</h2>
            </div>
            <div className="flex-1">
              <MapLocationPicker2Gis
                onLocationSelect={handleLocationSelect}
                selectedLocation={selectedLocation}
                placeholder="Выберите точку на карте"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationStep;
