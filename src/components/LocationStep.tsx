
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight, Search, Navigation } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="text-center pb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="text-3xl font-bold flex items-center justify-center mb-2">
            {icon || <MapPin className="h-8 w-8 mr-3" />}
            {title}
          </CardTitle>
          <p className="text-blue-100 text-lg">{subtitle}</p>
        </CardHeader>
        
        <CardContent className="p-8">
          {/* Элегантные табы */}
          <div className="flex bg-gray-50 rounded-2xl p-2 mb-8 shadow-inner">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-4 px-6 rounded-xl text-base font-semibold transition-all duration-300 flex items-center justify-center ${
                activeTab === 'search' 
                  ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <Search className="h-5 w-5 mr-2" />
              Поиск адреса
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`flex-1 py-4 px-6 rounded-xl text-base font-semibold transition-all duration-300 flex items-center justify-center ${
                activeTab === 'map' 
                  ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <Navigation className="h-5 w-5 mr-2" />
              Карта
            </button>
          </div>

          {/* Контент */}
          <div className="space-y-6">
            {activeTab === 'search' ? (
              <div className="space-y-6">
                <div className="relative">
                  <YandexAddressSearch
                    onAddressSelect={handleAddressSelect}
                    placeholder="Введите точный адрес..."
                    value={selectedAddress || ''}
                  />
                </div>
                
                {selectedAddress && (
                  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-sm">
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
              </div>
            ) : (
              <div className="space-y-4">
                <MapLocationPicker
                  onLocationSelect={handleLocationSelect}
                  placeholder="Выберите точку на карте"
                  selectedLocation={selectedLocation}
                />
              </div>
            )}

            {/* Кнопка продолжения */}
            {selectedLocation && selectedAddress && (
              <div className="pt-6">
                <Button 
                  onClick={onNext}
                  className="w-full h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Продолжить
                  <ArrowRight className="h-6 w-6 ml-3" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationStep;
