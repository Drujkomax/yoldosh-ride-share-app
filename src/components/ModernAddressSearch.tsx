
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Clock, X, ChevronLeft, Navigation } from 'lucide-react';

interface AddressResult {
  name: string;
  description: string;
  coordinates: [number, number];
  type: 'recent' | 'suggestion' | 'current';
}

interface ModernAddressSearchProps {
  onAddressSelect: (address: string, coordinates?: [number, number]) => void;
  placeholder?: string;
  value?: string;
  title?: string;
  onBack?: () => void;
  fullScreen?: boolean;
}

const uzbekistanCities = [
  'Ташкент', 'Самарканд', 'Бухара', 'Андижан', 'Наманган', 'Фергана', 'Карши', 'Термез', 'Ургенч', 'Нукус',
  'Джизак', 'Навои', 'Гулистан', 'Коканд', 'Маргилан', 'Чирчик', 'Ангрен', 'Олмалык', 'Шахрисабз',
  'Алтыарык', 'Ахангаран', 'Беруний', 'Газалкент', 'Денау', 'Зарафшан', 'Китаб', 'Кувасай', 'Кунград',
  'Мубарек', 'Нурота', 'Пайтуг', 'Риштан', 'Турткуль', 'Учкудук', 'Хазарасп', 'Янгиабад', 'Янгибазар'
];

const ModernAddressSearch = ({ 
  onAddressSelect, 
  placeholder = "Введите полный адрес", 
  value = "",
  title = "Куда вы едете?",
  onBack,
  fullScreen = false
}: ModernAddressSearchProps) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const searchCities = (searchQuery: string) => {
    if (searchQuery.length < 1) {
      setSuggestions([]);
      return;
    }

    const filteredCities = uzbekistanCities
      .filter(city => city.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 10)
      .map(city => ({
        name: city,
        description: `${city}, Узбекистан`,
        coordinates: getCityCoordinates(city),
        type: 'suggestion' as const
      }));

    setSuggestions(filteredCities);
  };

  const getCityCoordinates = (city: string): [number, number] => {
    const cityCoords: { [key: string]: [number, number] } = {
      'Ташкент': [41.2995, 69.2401],
      'Самарканд': [39.6542, 66.9597],
      'Бухара': [39.7747, 64.4286],
      'Андижан': [40.7821, 72.3442],
      'Фергана': [40.3834, 71.7842],
      'Наманган': [41.0004, 71.6726],
      'Карши': [38.8606, 65.7975],
      'Термез': [37.2242, 67.2783],
      'Ургенч': [41.5504, 60.6317],
      'Нукус': [42.4612, 59.6103]
    };
    return cityCoords[city] || [41.2995, 69.2401];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (newQuery.trim()) {
      timeoutRef.current = setTimeout(() => {
        searchCities(newQuery);
      }, 300);
    } else {
      setSuggestions([]);
    }
  };

  const handleAddressSelect = (address: AddressResult) => {
    setQuery(address.name);
    
    const updated = [address.name, ...recentSearches.filter(item => item !== address.name)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
    
    onAddressSelect(address.name, address.coordinates);
  };

  const handleCurrentLocation = () => {
    setIsDetectingLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation: AddressResult = {
            name: 'Текущее местоположение',
            description: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
            coordinates: [position.coords.latitude, position.coords.longitude],
            type: 'current'
          };
          
          handleAddressSelect(currentLocation);
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

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  if (fullScreen) {
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
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-4">
            <Search className="h-5 w-5 text-gray-400 mr-3" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={handleInputChange}
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

        {/* Current Location */}
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
          </Button>
        </div>

        {/* Results */}
        <div className="px-4 space-y-1">
          {/* Recent Searches */}
          {query.length === 0 && recentSearches.length > 0 && (
            <div className="space-y-2 mb-6">
              {recentSearches.map((address, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  onClick={() => handleAddressSelect({
                    name: address,
                    description: `${address}, Узбекистан`,
                    coordinates: getCityCoordinates(address),
                    type: 'recent'
                  })}
                  className="w-full justify-start text-left p-4 h-auto hover:bg-gray-50"
                >
                  <Clock className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="text-gray-700 font-medium">{address}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {suggestions.map((address, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => handleAddressSelect(address)}
              className="w-full justify-start text-left p-4 h-auto hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3 w-full">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{address.name}</div>
                  <div className="text-sm text-gray-500 truncate">{address.description}</div>
                </div>
              </div>
            </Button>
          ))}

          {/* No Results */}
          {query.length > 0 && suggestions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="font-medium">Город не найден</p>
              <p className="text-sm">Попробуйте изменить запрос</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Compact version
  return (
    <div className="relative">
      <div className="flex items-center bg-gray-100 rounded-2xl p-4 space-x-3">
        <Input
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          className="flex-1 border-0 bg-transparent focus:ring-0 focus:outline-none text-gray-800 placeholder-gray-500"
        />
        {query && (
          <Button variant="ghost" size="sm" onClick={clearSearch} className="p-0 h-6 w-6">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Suggestions dropdown for compact mode */}
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-96 overflow-y-auto">
          {suggestions.map((address, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => handleAddressSelect(address)}
              className="w-full justify-start text-left hover:bg-gray-50 rounded-none border-b border-gray-100 last:border-b-0 px-4 py-3 h-auto"
            >
              <MapPin className="h-4 w-4 mr-3 text-gray-400" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{address.name}</div>
                <div className="text-sm text-gray-500 truncate">{address.description}</div>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModernAddressSearch;
