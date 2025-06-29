
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Navigation, Star, Clock, ChevronRight } from 'lucide-react';
import { MapProvider2Gis } from '@/components/2GisMapProvider';
import MapLocationPicker2Gis from '@/components/MapLocationPicker2Gis';
import { useFrequentLocations } from '@/hooks/useFrequentLocations';
import { usePopularStops } from '@/hooks/usePopularStops';

interface LocationStepProps {
  title: string;
  subtitle: string;
  onLocationSelect: (coordinates: [number, number], address: string) => void;
  onNext: () => void;
  selectedLocation?: [number, number];
  selectedAddress?: string;
  icon: React.ReactNode;
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
  const [showMap, setShowMap] = useState(false);
  const { frequentLocations } = useFrequentLocations();
  const { getPopularStopsForCity } = usePopularStops();
  const [popularStops, setPopularStops] = useState([]);

  const handleLocationSelect = (coordinates: [number, number], address: string) => {
    onLocationSelect(coordinates, address);
    setShowMap(false);
  };

  const handleFrequentLocationSelect = async (location: any) => {
    if (location.latitude && location.longitude) {
      onLocationSelect([location.latitude, location.longitude], location.address);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'home': return '🏠';
      case 'work': return '💼';
      case 'transport_hub': return '🚌';
      case 'shopping': return '🛍️';
      case 'landmark': return '🏛️';
      default: return '📍';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4">
      <Card className="max-w-3xl mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            {icon}
          </div>
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
          <p className="text-purple-100 text-lg">{subtitle}</p>
        </div>

        <CardContent className="p-8">
          {/* Выбранная локация */}
          {selectedAddress && (
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500 rounded-full">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-green-800 text-lg">Выбрано</div>
                  <div className="text-green-700">{selectedAddress}</div>
                </div>
              </div>
            </div>
          )}

          {/* Частые локации */}
          {frequentLocations.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Star className="h-6 w-6 mr-2 text-yellow-500" />
                Частые места
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {frequentLocations.slice(0, 3).map((location) => (
                  <Button
                    key={location.id}
                    variant="ghost"
                    onClick={() => handleFrequentLocationSelect(location)}
                    className="h-auto p-4 bg-white border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 rounded-2xl text-left transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4 w-full">
                      <div className="text-2xl">
                        {getCategoryIcon(location.location_type)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{location.location_name}</div>
                        <div className="text-sm text-gray-500 truncate">{location.address}</div>
                        <div className="flex items-center mt-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {location.usage_count} раз
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Выбор на карте */}
          <div className="space-y-4">
            <Button
              onClick={() => setShowMap(true)}
              className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <Navigation className="h-6 w-6 mr-3" />
              Выбрать на карте
            </Button>

            {selectedAddress && (
              <Button
                onClick={onNext}
                className="w-full h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Продолжить
                <ChevronRight className="h-6 w-6 ml-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Карта */}
      {showMap && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl h-5/6 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Выберите точку на карте</h3>
              <Button variant="ghost" onClick={() => setShowMap(false)}>
                ✕
              </Button>
            </div>
            <div className="h-full">
              <MapLocationPicker2Gis
                onLocationSelect={handleLocationSelect}
                initialLocation={selectedLocation}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationStep;
