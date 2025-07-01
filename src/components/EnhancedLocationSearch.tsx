
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Navigation, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LocationResult {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number];
  type: 'recent' | 'suggestion' | 'current';
}

interface EnhancedLocationSearchProps {
  title: string;
  placeholder?: string;
  onLocationSelect: (location: LocationResult) => void;
  onBack?: () => void;
  initialValue?: string;
  showMap?: boolean;
}

// Расширенный список городов и мест Узбекистана
const uzbekistanLocations = [
  { name: 'Ташкент', description: 'Ташкент, Узбекистан', coordinates: [41.2995, 69.2401] as [number, number] },
  { name: 'Самарканд', description: 'Самарканд, Узбекистан', coordinates: [39.6542, 66.9597] as [number, number] },
  { name: 'Бухара', description: 'Бухара, Узбекистан', coordinates: [39.7747, 64.4286] as [number, number] },
  { name: 'Андижан', description: 'Андижан, Узбекистан', coordinates: [40.7821, 72.3442] as [number, number] },
  { name: 'Фергана', description: 'Фергана, Узбекистан', coordinates: [40.3834, 71.7842] as [number, number] },
  { name: 'Наманган', description: 'Наманган, Узбекистан', coordinates: [41.0004, 71.6726] as [number, number] },
  { name: 'Карши', description: 'Карши, Узбекистан', coordinates: [38.8606, 65.7975] as [number, number] },
  { name: 'Термез', description: 'Термез, Узбекистан', coordinates: [37.2242, 67.2783] as [number, number] },
  { name: 'Ургенч', description: 'Ургенч, Узбекистан', coordinates: [41.5504, 60.6317] as [number, number] },
  { name: 'Нукус', description: 'Нукус, Узбекистан', coordinates: [42.4612, 59.6103] as [number, number] },
  
  // Популярные места в Ташкенте
  { name: 'Аэропорт Ташкент', description: 'Международный аэропорт им. Ислама Каримова, Ташкент', coordinates: [41.2579, 69.2811] as [number, number] },
  { name: 'Железнодорожный вокзал Ташкент', description: 'Центральный ж/д вокзал, Ташкент', coordinates: [41.2975, 69.2727] as [number, number] },
  { name: 'Чорсу', description: 'Рынок Чорсу, Ташкент', coordinates: [41.3264, 69.2401] as [number, number] },
  { name: 'Ташкент Сити', description: 'Международный бизнес-центр, Ташкент', coordinates: [41.3111, 69.2797] as [number, number] },
  { name: 'Мирзо Улугбек', description: 'Район Мирзо Улугбек, Ташкент', coordinates: [41.3447, 69.3344] as [number, number] },
  { name: 'Яшнабод', description: 'Район Яшнабод, Ташкент', coordinates: [41.2278, 69.2892] as [number, number] },
  
  // Другие важные места
  { name: 'Регистан', description: 'Площадь Регистан, Самарканд', coordinates: [39.6547, 66.9750] as [number, number] },
  { name: 'Ляби-Хауз', description: 'Комплекс Ляби-Хауз, Бухара', coordinates: [39.7754, 64.4208] as [number, number] },
  { name: 'Дворец Худоярхана', description: 'Дворец Худоярхана, Коканд', coordinates: [40.5281, 70.9424] as [number, number] }
];

const EnhancedLocationSearch: React.FC<EnhancedLocationSearchProps> = ({
  title,
  placeholder = "Введите полный адрес",
  onLocationSelect,
  onBack,
  initialValue = "",
  showMap = false
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<LocationResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Загружаем недавние поиски из localStorage
    const saved = localStorage.getItem('recent_location_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (query.trim().length > 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        searchLocations(query);
      }, 300);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  const searchLocations = (searchQuery: string) => {
    const filtered = uzbekistanLocations
      .filter(location => 
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 8)
      .map(location => ({
        id: `suggestion-${location.name}`,
        name: location.name,
        description: location.description,
        coordinates: location.coordinates,
        type: 'suggestion' as const
      }));

    setSuggestions(filtered);
    setShowSuggestions(true);
  };

  const handleLocationSelect = (location: LocationResult) => {
    setQuery(location.name);
    setShowSuggestions(false);
    
    // Сохраняем в недавние поиски
    const updatedRecent = [
      { ...location, type: 'recent' as const },
      ...recentSearches.filter(item => item.name !== location.name)
    ].slice(0, 5);
    
    setRecentSearches(updatedRecent);
    localStorage.setItem('recent_location_searches', JSON.stringify(updatedRecent));
    
    onLocationSelect(location);
  };

  const handleCurrentLocation = () => {
    setIsDetectingLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation: LocationResult = {
            id: 'current-location',
            name: 'Текущее местоположение',
            description: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
            coordinates: [position.coords.latitude, position.coords.longitude],
            type: 'current'
          };
          
          handleLocationSelect(currentLocation);
          setIsDetectingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsDetectingLocation(false);
        }
      );
    } else {
      setIsDetectingLocation(false);
    }
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 z-10">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-semibold text-gray-900 flex-1">{title}</h1>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4">
        <div className="relative">
          <div className="flex items-center bg-gray-100 rounded-lg p-4">
            <Search className="h-5 w-5 text-gray-400 mr-3" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleInputFocus}
              className="flex-1 bg-transparent border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none"
              autoFocus
            />
            {query && (
              <Button variant="ghost" size="sm" onClick={clearSearch} className="p-1 ml-2">
                <X className="h-4 w-4 text-gray-500" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Current Location Button */}
      <div className="px-4 pb-4">
        <Button
          variant="ghost"
          onClick={handleCurrentLocation}
          disabled={isDetectingLocation}
          className="w-full justify-start text-left p-4 h-auto hover:bg-gray-50"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Navigation className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-blue-600 font-medium">
              {isDetectingLocation ? 'Определяем местоположение...' : 'Использовать текущее местоположение'}
            </span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
        </Button>
      </div>

      {/* Results */}
      <div className="px-4 space-y-1">
        {/* Recent Searches */}
        {query.length === 0 && recentSearches.length > 0 && (
          <div className="space-y-2 mb-6">
            {recentSearches.map((location, index) => (
              <Button
                key={`${location.id}-${index}`}
                variant="ghost"
                onClick={() => handleLocationSelect(location)}
                className="w-full justify-start text-left p-4 h-auto hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{location.name}</div>
                    <div className="text-sm text-gray-500 truncate">{location.description}</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 ml-auto flex-shrink-0" />
              </Button>
            ))}
          </div>
        )}

        {/* Search Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-1">
            {suggestions.map((location, index) => (
              <Button
                key={`${location.id}-${index}`}
                variant="ghost"
                onClick={() => handleLocationSelect(location)}
                className="w-full justify-start text-left p-4 h-auto hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{location.name}</div>
                    <div className="text-sm text-gray-500 truncate">{location.description}</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 ml-auto flex-shrink-0" />
              </Button>
            ))}
          </div>
        )}

        {/* No Results */}
        {query.length > 0 && suggestions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="font-medium">Местоположение не найдено</p>
            <p className="text-sm">Попробуйте изменить запрос</p>
          </div>
        )}
      </div>

      {/* Map Option */}
      {showMap && (
        <div className="px-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Выбрать на карте</div>
                    <div className="text-sm text-gray-500">Точное местоположение</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedLocationSearch;
