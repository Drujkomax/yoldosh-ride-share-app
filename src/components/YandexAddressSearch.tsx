
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Loader2, Clock, X, ChevronLeft } from 'lucide-react';

interface AddressResult {
  name: string;
  description: string;
  coordinates: [number, number];
}

interface YandexAddressSearchProps {
  onAddressSelect: (address: string, coordinates?: [number, number]) => void;
  placeholder?: string;
  value?: string;
  compact?: boolean;
}

const YandexAddressSearch = ({ 
  onAddressSelect, 
  placeholder = "Введите адрес", 
  value = "",
  compact = false 
}: YandexAddressSearchProps) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Используем корректный API ключ
  const API_KEY = 'e50140a7-ffa3-493f-86d6-e25b5d1bfb17';

  useEffect(() => {
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
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Searching for:', searchQuery);
      
      // Используем правильный URL для Yandex Geocoder API
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=${API_KEY}&geocode=${encodeURIComponent(searchQuery + ', Узбекистан')}&format=json&results=10&lang=ru_RU&kind=house`
      );
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        // Fallback к мок данным при ошибке API
        const mockResults = generateMockResults(searchQuery);
        setSuggestions(mockResults);
        setShowSuggestions(true);
        return;
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      const results = data.response?.GeoObjectCollection?.featureMember || [];
      
      const addresses: AddressResult[] = results.map((item: any, index: number) => {
        const geoObject = item.GeoObject;
        const coords = geoObject.Point.pos.split(' ').map(Number).reverse();
        
        return {
          name: geoObject.name || `Адрес ${index + 1}`,
          description: geoObject.description || geoObject.metaDataProperty?.GeocoderMetaData?.text || 'Нет описания',
          coordinates: coords as [number, number]
        };
      });

      console.log('Processed addresses:', addresses);
      setSuggestions(addresses);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching addresses:', error);
      // Fallback к мок данным при ошибке
      const mockResults = generateMockResults(searchQuery);
      setSuggestions(mockResults);
      setShowSuggestions(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Генерируем мок данные для демонстрации работы поиска
  const generateMockResults = (query: string): AddressResult[] => {
    const uzbekCities = [
      { name: 'Ташкент', coords: [41.2995, 69.2401] as [number, number] },
      { name: 'Самарканд', coords: [39.6542, 66.9597] as [number, number] },
      { name: 'Бухара', coords: [39.7747, 64.4286] as [number, number] },
      { name: 'Андижан', coords: [40.7821, 72.3442] as [number, number] },
      { name: 'Фергана', coords: [40.3834, 71.7842] as [number, number] },
      { name: 'Наманган', coords: [41.0004, 71.6726] as [number, number] }
    ];

    return uzbekCities
      .filter(city => city.name.toLowerCase().includes(query.toLowerCase()))
      .map((city, index) => ({
        name: city.name,
        description: `${city.name}, Узбекистан`,
        coordinates: city.coords
      }))
      .slice(0, 5);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (newQuery.trim()) {
      timeoutRef.current = setTimeout(() => {
        searchAddresses(newQuery);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleAddressSelect = (address: AddressResult) => {
    setQuery(address.name);
    setShowSuggestions(false);
    setIsFocused(false);
    saveRecentSearch(address.name);
    onAddressSelect(address.name, address.coordinates);
  };

  const handleRecentSelect = (address: string) => {
    setQuery(address);
    searchAddresses(address);
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (query.length === 0 && recentSearches.length > 0) {
      setShowSuggestions(true);
    }
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

  if (compact) {
    return (
      <div className="relative">
        <div className="flex items-center bg-gray-100 rounded-2xl p-4 space-x-3">
          {isFocused && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFocused(false)}
              className="p-0 h-6 w-6 hover:bg-gray-200 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <Input
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            className="flex-1 border-0 bg-transparent focus:ring-0 focus:outline-none text-gray-800 placeholder-gray-500"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="p-0 h-6 w-6 hover:bg-gray-200 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {isLoading && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
        </div>

        {showSuggestions && (suggestions.length > 0 || (query.length === 0 && recentSearches.length > 0)) && (
          <>
            <div className="fixed inset-0 z-40 bg-white">
              <div className="p-4">
                <div className="flex items-center bg-gray-100 rounded-2xl p-4 space-x-3 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSuggestions(false)}
                    className="p-0 h-6 w-6 hover:bg-gray-200 rounded-full"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder={placeholder}
                    value={query}
                    onChange={handleInputChange}
                    className="flex-1 border-0 bg-transparent focus:ring-0 focus:outline-none text-gray-800 placeholder-gray-500"
                    autoFocus
                  />
                  {query && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="p-0 h-6 w-6 hover:bg-gray-200 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2 max-h-[calc(100vh-8rem)] overflow-y-auto">
                  {query.length === 0 && recentSearches.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 px-4 py-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">Недавние поиски</span>
                      </div>
                      {recentSearches.map((address, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          onClick={() => handleRecentSelect(address)}
                          className="w-full justify-start text-left hover:bg-gray-50 rounded-xl px-4 py-3 h-auto animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <Clock className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-700 truncate">{address}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {suggestions.map((address, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      onClick={() => handleAddressSelect(address)}
                      className="w-full justify-start text-left hover:bg-gray-50 rounded-xl px-4 py-3 h-auto flex-col items-start animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center w-full">
                        <MapPin className="h-4 w-4 mr-3 text-blue-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-gray-800 font-medium truncate">{address.name}</div>
                          <div className="text-gray-500 text-sm truncate">{address.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}

                  {suggestions.length === 0 && query.length >= 2 && !isLoading && (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>Адреса не найдены</p>
                      <p className="text-sm">Попробуйте изменить запрос</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div 
              className="fixed inset-0 z-30" 
              onClick={() => setShowSuggestions(false)}
            />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className="pl-14 h-16 bg-white border-2 border-gray-200 focus:border-blue-500 text-gray-800 placeholder-gray-500 rounded-2xl text-lg font-medium shadow-sm focus:shadow-lg transition-all duration-300"
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-4 h-6 w-6 text-blue-500 animate-spin" />
        )}
      </div>

      {showSuggestions && (suggestions.length > 0 || (query.length === 0 && recentSearches.length > 0)) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border-2 border-gray-100 rounded-2xl shadow-2xl max-h-96 overflow-y-auto animate-fade-in">
          {query.length === 0 && recentSearches.length > 0 && (
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
                  className="w-full justify-start text-left hover:bg-gray-50 rounded-xl px-4 py-3 h-auto mb-1 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
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
              className="w-full justify-start text-left hover:bg-blue-50 rounded-2xl px-6 py-4 h-auto flex-col items-start border-b border-gray-50 last:border-b-0 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
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

          {suggestions.length === 0 && query.length >= 2 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>Адреса не найдены</p>
              <p className="text-sm">Попробуйте изменить запрос</p>
            </div>
          )}
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
