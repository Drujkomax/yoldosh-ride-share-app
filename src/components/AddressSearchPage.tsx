import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Clock, Search, Loader2 } from 'lucide-react';
import { useUzbekistanPlaces } from '@/hooks/useUzbekistanPlaces';

interface AddressSearchPageProps {
  title: string;
  onAddressSelect: (address: string, coordinates: [number, number]) => void;
  onBack: () => void;
  placeholder?: string;
  previousSelection?: string;
}

const AddressSearchPage = ({ 
  title, 
  onAddressSelect, 
  onBack,
  placeholder = "Введите адрес",
  previousSelection
}: AddressSearchPageProps) => {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const { predictions, isLoading, searchPlaces, getPlaceDetails, getCurrentLocation } = useUzbekistanPlaces();

  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Загружаем недавние поиски из localStorage
    const saved = localStorage.getItem('recent_address_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing recent searches:', error);
        setRecentSearches([]);
      }
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setError(''); // Clear error when user starts typing
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        searchPlaces(value);
      }
    }, 300);
  };

  const handleSuggestionSelect = async (prediction: any) => {
    const address = prediction.description;
    
    // Check if the selected address is the same as the previous selection
    if (previousSelection && address === previousSelection) {
      setError('Нельзя выбрать одинаковые города отправления и прибытия');
      return;
    }

    try {
      const details = await getPlaceDetails(prediction.place_id);
      const coordinates: [number, number] = details ? [details.geometry.location.lat, details.geometry.location.lng] : [0, 0];
      
      // Сохраняем в недавние поиски
      const newRecentSearches = [address, ...recentSearches.filter(item => item !== address)].slice(0, 5);
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recent_address_searches', JSON.stringify(newRecentSearches));
      
      setQuery(''); // Clear the input after successful selection
      setError(''); // Clear any previous error
      onAddressSelect(address, coordinates);
    } catch (error) {
      console.error('Error getting place details:', error);
      setError('Ошибка при получении деталей места');
    }
  };

  const handleCurrentLocation = async () => {
    const currentLocationText = 'Текущее местоположение';
    if (previousSelection && currentLocationText === previousSelection) {
      setError('Нельзя выбрать одинаковые города отправления и прибытия');
      return;
    }
    
    try {
      const location = await getCurrentLocation();
      
      // Сохраняем текущее местоположение в недавние поиски
      const newRecentSearches = [location.address, ...recentSearches.filter(item => item !== location.address)].slice(0, 5);
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recent_address_searches', JSON.stringify(newRecentSearches));
      
      setQuery(''); // Clear the input
      setError(''); // Clear any previous error
      onAddressSelect(location.address, [location.lat, location.lng]);
    } catch (error) {
      console.error('Error getting current location:', error);
      setError('Ошибка при получении текущего местоположения');
    }
  };

  const handleRecentSelect = (address: string) => {
    if (previousSelection && address === previousSelection) {
      setError('Нельзя выбрать одинаковые города отправления и прибытия');
      return;
    }
    
    setQuery('');
    setError('');
    onAddressSelect(address, [0, 0]); // Default coordinates for recent searches
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4">
        {/* Search Input */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-2xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-lg"
            autoFocus
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Current Location Button */}
        <Button
          variant="ghost"
          className="w-full justify-start text-left p-4 h-auto hover:bg-gray-50 mb-4"
          onClick={handleCurrentLocation}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-blue-600 font-medium">
              Использовать текущее местоположение
            </span>
          </div>
        </Button>

        {/* Suggestions */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        )}

        <div className="space-y-2">
          {predictions.map((prediction) => (
            <Button
              key={prediction.place_id}
              variant="ghost"
              onClick={() => handleSuggestionSelect(prediction)}
              className="w-full justify-start text-left p-4 h-auto hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-full">
                  <MapPin className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {prediction.structured_formatting?.main_text || prediction.description}
                  </div>
                  {prediction.structured_formatting?.secondary_text && (
                    <div className="text-sm text-gray-500 truncate">
                      {prediction.structured_formatting.secondary_text}
                    </div>
                  )}
                </div>
              </div>
            </Button>
          ))}
          
          {/* No results message */}
          {query.length >= 2 && !isLoading && predictions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Места не найдены</p>
              <p className="text-xs">Попробуйте изменить запрос</p>
            </div>
          )}
        </div>

        {/* Recent Searches */}
        {query === '' && recentSearches.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Недавние поиски</h3>
            <div className="space-y-2">
              {recentSearches.map((address, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  onClick={() => handleRecentSelect(address)}
                  className="w-full justify-start text-left p-4 h-auto hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <Clock className="h-4 w-4 text-gray-500" />
                    </div>
                    <span className="text-gray-700 truncate">{address}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressSearchPage;