
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Navigation, Clock, ChevronRight, Home, Briefcase, MapPin } from 'lucide-react';
import { useGoogleGeocoding } from '@/hooks/useGoogleGeocoding';
import { useFrequentLocations } from '@/hooks/useFrequentLocations';

interface LocationStepProps {
  title: string;
  onLocationSelect: (coordinates: [number, number], address: string) => void;
  selectedLocation?: [number, number];
  selectedAddress?: string;
}

interface GeocodeResult {
  name: string;
  description: string;
  coordinates: [number, number];
}

// Статичные популярные места
const staticLocations = [
  { name: 'Ташкент', description: 'Ташкент, Узбекистан', coordinates: [41.2995, 69.2401] as [number, number] },
  { name: 'Самарканд', description: 'Самарканд, Узбекистан', coordinates: [39.6542, 66.9597] as [number, number] },
  { name: 'Бухара', description: 'Бухара, Узбекистан', coordinates: [39.7747, 64.4286] as [number, number] },
  { name: 'Андижан', description: 'Андижан, Узбекистан', coordinates: [40.7821, 72.3442] as [number, number] },
  { name: 'Фергана', description: 'Фергана, Узбекистан', coordinates: [40.3834, 71.7842] as [number, number] },
  { name: 'Наманган', description: 'Наманган, Узбекистан', coordinates: [41.0004, 71.6726] as [number, number] },
];

const LocationStep = ({
  title,
  onLocationSelect,
  selectedLocation,
  selectedAddress
}: LocationStepProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  const { geocodeAddress } = useGoogleGeocoding();
  const { frequentLocations } = useFrequentLocations();
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Поиск адресов через Google Maps API
  const searchAddresses = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const results = await geocodeAddress(searchQuery);
      setSuggestions(results);
    } catch (error) {
      console.error('Ошибка поиска адресов:', error);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setShowSuggestions(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (newQuery.trim()) {
      timeoutRef.current = setTimeout(() => {
        searchAddresses(newQuery);
      }, 300);
    } else {
      setSuggestions([]);
    }
  };

  const handleAddressSelect = (address: GeocodeResult) => {
    setQuery(address.name);
    setShowSuggestions(false);
    setIsFocused(false);
    onLocationSelect(address.coordinates, address.description);
  };

  const handleFrequentLocationSelect = (location: any) => {
    if (location.latitude && location.longitude) {
      setQuery(location.location_name);
      setShowSuggestions(false);
      setIsFocused(false);
      onLocationSelect([location.latitude, location.longitude], location.address);
    }
  };

  const handleCurrentLocation = () => {
    setIsLocating(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            setQuery('Текущее местоположение');
            onLocationSelect([latitude, longitude], address);
          } catch (error) {
            console.error('Ошибка получения адреса:', error);
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error('Ошибка получения местоположения:', error);
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    // Задержка чтобы обработать клик по suggestions
    setTimeout(() => {
      setIsFocused(false);
      if (query.length === 0) {
        setShowSuggestions(false);
      }
    }, 200);
  };

  const getLocationTypeIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="h-4 w-4" />;
      case 'work': return <Briefcase className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-6 pt-16 pb-8">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>

      {/* Search Input */}
      <div className="px-6 mb-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Введите полный адрес"
            className="w-full h-14 pl-12 pr-4 bg-gray-100 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Current Location Button */}
      <div className="px-6 mb-6">
        <Button
          onClick={handleCurrentLocation}
          disabled={isLocating}
          className="w-full h-14 bg-white border border-gray-200 rounded-xl flex items-center justify-between px-4 hover:bg-gray-50 text-gray-900"
          variant="outline"
        >
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-full mr-3">
              <Navigation className="h-5 w-5 text-gray-600" />
            </div>
            <span className="font-medium">
              {isLocating ? 'Определение местоположения...' : 'Использовать текущее местоположение'}
            </span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </Button>
      </div>

      {/* Static Popular Locations - Always Visible */}
      <div className="px-6 mb-6">
        <div className="mb-3">
          <span className="text-sm font-medium text-gray-600">Популярные города</span>
        </div>
        <div className="space-y-1">
          {staticLocations.map((location, index) => (
            <Button
              key={index}
              onClick={() => handleAddressSelect(location)}
              className="w-full h-14 bg-white border border-gray-200 rounded-xl flex items-center justify-between px-4 hover:bg-gray-50 text-left"
              variant="outline"
            >
              <div className="flex items-center flex-1 min-w-0">
                <div className="p-2 bg-blue-100 rounded-full mr-3 flex-shrink-0">
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{location.name}</div>
                  <div className="text-sm text-gray-500 truncate">{location.description}</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </Button>
          ))}
        </div>
      </div>

      {/* Dynamic Content */}
      <div className="px-6">
        {showSuggestions && isFocused ? (
          // Показывать результаты поиска когда пользователь печатает
          query.length > 0 && suggestions.length > 0 && (
            <div className="space-y-1">
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-600">Результаты поиска</span>
              </div>
              {suggestions.map((address, index) => (
                <Button
                  key={index}
                  onClick={() => handleAddressSelect(address)}
                  className="w-full h-14 bg-white border border-gray-200 rounded-xl flex items-center justify-between px-4 hover:bg-gray-50 text-left"
                  variant="outline"
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="p-2 bg-green-100 rounded-full mr-3 flex-shrink-0">
                      <Search className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{address.name}</div>
                      <div className="text-sm text-gray-500 truncate">{address.description}</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </Button>
              ))}
            </div>
          )
        ) : (
          // Показывать частые локации когда клавиатура не активна
          query.length === 0 && frequentLocations.length > 0 && (
            <div className="space-y-1">
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-600">Часто используемые</span>
              </div>
              {frequentLocations.slice(0, 4).map((location) => (
                <Button
                  key={location.id}
                  onClick={() => handleFrequentLocationSelect(location)}
                  className="w-full h-14 bg-white border border-gray-200 rounded-xl flex items-center justify-between px-4 hover:bg-gray-50 text-left"
                  variant="outline"
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="p-2 bg-gray-100 rounded-full mr-3 flex-shrink-0">
                      {getLocationTypeIcon(location.location_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{location.location_name}</div>
                      <div className="text-sm text-gray-500 truncate">{location.address}</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </Button>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default LocationStep;
