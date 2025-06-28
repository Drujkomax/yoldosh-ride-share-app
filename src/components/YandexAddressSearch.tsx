
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Loader2 } from 'lucide-react';

interface AddressResult {
  name: string;
  description: string;
  coordinates: [number, number];
}

interface YandexAddressSearchProps {
  onAddressSelect: (address: string, coordinates?: [number, number]) => void;
  placeholder?: string;
  value?: string;
}

const YandexAddressSearch = ({ onAddressSelect, placeholder = "Введите адрес", value = "" }: YandexAddressSearchProps) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const API_KEY = 'fc46d1dc-d099-42f9-baf7-e6d468df0eef';

  const searchAddresses = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=${API_KEY}&geocode=${encodeURIComponent(searchQuery)}&format=json&results=5&lang=ru_RU`
      );
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const results = data.response?.GeoObjectCollection?.featureMember || [];
      
      const addresses: AddressResult[] = results.map((item: any) => {
        const geoObject = item.GeoObject;
        const coords = geoObject.Point.pos.split(' ').map(Number).reverse(); // Яндекс возвращает lon,lat, нам нужно lat,lon
        
        return {
          name: geoObject.name || '',
          description: geoObject.description || '',
          coordinates: coords as [number, number]
        };
      });

      setSuggestions(addresses);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching addresses:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    // Очищаем предыдущий таймаут
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Устанавливаем новый таймаут для поиска
    timeoutRef.current = setTimeout(() => {
      searchAddresses(newQuery);
    }, 300);
  };

  const handleAddressSelect = (address: AddressResult) => {
    setQuery(address.name);
    setShowSuggestions(false);
    onAddressSelect(address.name, address.coordinates);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          className="pl-12 h-14 bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-2xl text-lg focus:border-blue-500 focus:ring-blue-500"
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-4 h-5 w-5 text-gray-400 animate-spin" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-gray-800 border border-gray-700 rounded-2xl shadow-xl max-h-80 overflow-y-auto">
          {suggestions.map((address, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => handleAddressSelect(address)}
              className="w-full justify-start text-left hover:bg-gray-700 rounded-2xl px-6 py-4 h-auto flex-col items-start"
            >
              <div className="flex items-center w-full">
                <MapPin className="h-5 w-5 mr-3 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{address.name}</div>
                  <div className="text-gray-400 text-sm truncate">{address.description}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      )}

      {/* Overlay to close suggestions when clicking outside */}
      {showSuggestions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
};

export default YandexAddressSearch;
