
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight } from 'lucide-react';
import MapLocationPicker from './MapLocationPicker';
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

  const handleLocationSelect = (coordinates: [number, number], address: string) => {
    onLocationSelect(coordinates, address);
  };

  const handleAddressSelect = (address: string, coordinates?: [number, number]) => {
    if (coordinates) {
      onLocationSelect(coordinates, address);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-slate-800 flex items-center justify-center">
          {icon || <MapPin className="h-6 w-6 mr-3 text-yoldosh-primary" />}
          {title}
        </CardTitle>
        <p className="text-slate-600 mt-1">{subtitle}</p>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Табы для переключения между поиском и картой */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'search' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Поиск адреса
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'map' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Выбор на карте
          </button>
        </div>

        {/* Содержимое в зависимости от активного таба */}
        {activeTab === 'search' ? (
          <div className="space-y-4">
            <YandexAddressSearch
              onAddressSelect={handleAddressSelect}
              placeholder="Введите точный адрес"
              value={selectedAddress || ''}
            />
            {selectedAddress && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800 font-medium">Выбранный адрес:</span>
                </div>
                <div className="text-sm text-green-700 mt-1">{selectedAddress}</div>
              </div>
            )}
          </div>
        ) : (
          <MapLocationPicker
            onLocationSelect={handleLocationSelect}
            placeholder="Выберите точку на карте"
            selectedLocation={selectedLocation}
          />
        )}

        {/* Кнопка продолжения */}
        {selectedLocation && selectedAddress && (
          <Button 
            onClick={onNext}
            className="w-full h-14 bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-2xl text-lg font-semibold"
          >
            Продолжить
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationStep;
