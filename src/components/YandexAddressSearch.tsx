
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Loader2, Clock } from 'lucide-react';

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
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const API_KEY = 'fc46d1dc-d099-42f9-baf7-e6d468df0eef';

  useEffect(() => {
    // Загружаем недавние поиски из localStorage
    const saved = localStorage.getItem('yandex_recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const saveRecentSearch = (address: string) => {
    const updated = [address, ...recentSearches.filter(item => item !== address)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('yandex_recent_searches', JSON.stringify(updated));
  };

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
        const coords = geoObject.Point.pos.split(' ').map(Number).reverse();
        
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

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      searchAddresses(newQuery);
    }, 300);
  };

  const handleAddressSelect = (address: AddressResult) => {
    setQuery(address.name);
    setShowSuggestions(false);
    saveRecentSearch(address.name);
    onAddressSelect(address.name, address.coordinates);
  };

  const handleRecentSelect = (address: string) => {
    setQuery(address);
    searchAddresses(address);
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
        <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0 || recentSearches.length > 0) {
              setShowSuggestions(true);
            }
          }}
          className="pl-14 h-16 bg-white border-2 border-gray-200 focus:border-blue-500 text-gray-800 placeholder-gray-500 rounded-2xl text-lg font-medium shadow-sm focus:shadow-lg transition-all duration-300"
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-4 h-6 w-6 text-blue-500 animate-spin" />
        )}
      </div>

      {showSuggestions && (suggestions.length > 0 || (query.length < 3 && recentSearches.length > 0)) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border-2 border-gray-100 rounded-2xl shadow-2xl max-h-96 overflow-y-auto">
          {query.length < 3 && recentSearches.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">Недавние поиски</span>
              </div>
              {recentSearches.map((address, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  onClick={() => handleRecentSelect(address)}
                  className="w-full justify-start text-left hover:bg-gray-50 rounded-xl px-4 py-3 h-auto mb-1"
                >
                  <MapPin className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700 font-medium truncate">{address}</span>
                </Button>
              ))}
            </div>
          )}
          
          {suggestions.map((address, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => handleAddressSelect(address)}
              className="w-full justify-start text-left hover:bg-blue-50 rounded-2xl px-6 py-4 h-auto flex-col items-start border-b border-gray-50 last:border-b-0"
            >
              <div className="flex items-center w-full">
                <MapPin className="h-5 w-5 mr-4 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-gray-800 font-semibold truncate">{address.name}</div>
                  <div className="text-gray-500 text-sm truncate mt-1">{address.description}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      )}

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
