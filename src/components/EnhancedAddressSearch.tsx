import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Clock, X, ChevronLeft, Home, Briefcase, Navigation } from 'lucide-react';
import { usePopularStops, PopularStop } from '@/hooks/usePopularStops';
import { useFrequentLocations, FrequentLocation } from '@/hooks/useFrequentLocations';

interface AddressResult {
  name: string;
  description: string;
  coordinates: [number, number];
  category?: string;
  isPopular?: boolean;
  isFrequent?: boolean;
}

interface EnhancedAddressSearchProps {
  onAddressSelect: (address: string, coordinates?: [number, number]) => void;
  placeholder?: string;
  value?: string;
  compact?: boolean;
  cityContext?: string;
}

const EnhancedAddressSearch = ({ 
  onAddressSelect, 
  placeholder = "Введите адрес или выберите место", 
  value = "",
  compact = false,
  cityContext
}: EnhancedAddressSearchProps) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const { getPopularStopsForCity, getPopularStopsByCategory } = usePopularStops();
  const { frequentLocations, addFrequentLocation } = useFrequentLocations();
  
  const timeoutRef = useRef<NodeJS.Timeout>();

  const categories = [
    { id: 'all', name: 'Все', icon: '📍' },
    { id: 'transport_hub', name: 'Транспорт', icon: '🚌' },
    { id: 'shopping', name: 'Торговые центры', icon: '🛍️' },
    { id: 'landmark', name: 'Достопримечательности', icon: '🏛️' },
  ];

  const uzbekistanCities = [
    'Ташкент', 'Самарканд', 'Бухара', 'Андижан', 'Наманган', 'Фергана',
    'Карши', 'Термез', 'Ургенч', 'Нукус', 'Джизак', 'Навои', 'Гулистан',
    'Коканд', 'Маргилан', 'Чирчик', 'Ангрен', 'Олмалык'
  ];

  const searchAddresses = async (searchQuery: string) => {
    if (searchQuery.length < 1) {
      setSuggestions([]);
      return;
    }

    const results: AddressResult[] = [];

    // Поиск популярных остановок в контексте города
    if (cityContext) {
      try {
        const popularStops = activeCategory === 'all' 
          ? await getPopularStopsForCity(cityContext)
          : await getPopularStopsByCategory(cityContext, activeCategory);
        
        const filteredPopular = popularStops
          .filter(stop => 
            stop.stop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stop.address.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 5)
          .map(stop => ({
            name: stop.stop_name,
            description: stop.address,
            coordinates: [stop.latitude, stop.longitude] as [number, number],
            category: stop.category,
            isPopular: true,
          }));
        
        results.push(...filteredPopular);
      } catch (error) {
        console.error('Ошибка поиска популярных остановок:', error);
      }
    }

    // Поиск городов
    const filteredCities = uzbekistanCities
      .filter(city => city.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 3)
      .map(city => ({
        name: city,
        description: `${city}, Узбекистан`,
        coordinates: getCityCoordinates(city),
      }));

    results.push(...filteredCities);

    setSuggestions(results.slice(0, 10));
    setShowSuggestions(true);
  };

  const getCityCoordinates = (city: string): [number, number] => {
    const cityCoords: { [key: string]: [number, number] } = {
      'Ташкент': [41.2995, 69.2401],
      'Самарканд': [39.6542, 66.9597],
      'Бухара': [39.7747, 64.4286],
      'Андижан': [40.7821, 72.3442],
      'Фергана': [40.3834, 71.7842],
      'Наманган': [41.0004, 71.6726],
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
    
    // Добавляем в частые локации если это не город
    if (!uzbekistanCities.includes(address.name)) {
      addFrequentLocation({
        location_name: address.name,
        address: address.description,
        latitude: address.coordinates[0],
        longitude: address.coordinates[1],
        location_type: 'frequent',
      });
    }
    
    onAddressSelect(address.name, address.coordinates);
  };

  const handleFrequentSelect = (location: FrequentLocation) => {
    setQuery(location.location_name);
    onAddressSelect(location.location_name, [location.latitude || 0, location.longitude || 0]);
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (query.length === 0) {
      setShowSuggestions(true);
    }
  };

  const getCategoryIcon = (category?: string) => {
    const categoryData = categories.find(c => c.id === category);
    return categoryData?.icon || '📍';
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

  useEffect(() => {
    setQuery(value);
  }, [value]);

  if (compact) {
    return (
      <div className="relative">
        <div className="flex items-center bg-gray-100 rounded-2xl p-4 space-x-3">
          <Search className="h-5 w-5 text-gray-400" />
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
        </div>

        {showSuggestions && (
          <>
            <div className="fixed inset-0 z-40 bg-white">
              <div className="p-4">
                {/* Search Header */}
                <div className="flex items-center bg-gray-100 rounded-2xl p-4 space-x-3 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSuggestions(false)}
                    className="p-0 h-6 w-6 hover:bg-gray-200 rounded-full"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Search className="h-5 w-5 text-gray-400" />
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

                {/* Categories */}
                {cityContext && (
                  <div className="flex space-x-2 mb-4 overflow-x-auto">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={activeCategory === category.id ? "default" : "ghost"}
                        size="sm"
                        onClick={() => {
                          setActiveCategory(category.id);
                          if (query) {
                            searchAddresses(query);
                          }
                        }}
                        className={`flex-shrink-0 ${
                          activeCategory === category.id 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span className="mr-1">{category.icon}</span>
                        {category.name}
                      </Button>
                    ))}
                  </div>
                )}

                <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
                  {/* Frequent Locations */}
                  {query.length === 0 && frequentLocations.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 px-4 py-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">Часто используемые</span>
                      </div>
                      {frequentLocations.slice(0, 3).map((location) => (
                        <Button
                          key={location.id}
                          variant="ghost"
                          onClick={() => handleFrequentSelect(location)}
                          className="w-full justify-start text-left hover:bg-gray-50 rounded-xl px-4 py-3 h-auto"
                        >
                          <div className="flex items-center space-x-3 w-full">
                            <div className="p-2 bg-gray-100 rounded-full text-gray-500">
                              {getLocationTypeIcon(location.location_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">{location.location_name}</div>
                              <div className="text-sm text-gray-500 truncate">{location.address}</div>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {/* Search Results */}
                  {suggestions.map((address, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      onClick={() => handleAddressSelect(address)}
                      className="w-full justify-start text-left hover:bg-gray-50 rounded-xl px-4 py-3 h-auto flex-col items-start"
                    >
                      <div className="flex items-center w-full">
                        <div className="text-xl mr-3">
                          {address.isPopular ? getCategoryIcon(address.category) : '📍'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-gray-800 font-medium truncate flex items-center">
                            {address.name}
                            {address.isPopular && (
                              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                                Популярное
                              </span>
                            )}
                          </div>
                          <div className="text-gray-500 text-sm truncate">{address.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}

                  {suggestions.length === 0 && query.length >= 1 && (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>Место не найдено</p>
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
      </div>

      {showSuggestions && (suggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border-2 border-gray-100 rounded-2xl shadow-2xl max-h-96 overflow-y-auto animate-fade-in">
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

export default EnhancedAddressSearch;
