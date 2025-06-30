
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Navigation, MapPin, Clock, ChevronLeft, Loader2 } from 'lucide-react';
import { useUzbekistanPlaces } from '@/hooks/useUzbekistanPlaces';
import { cn } from '@/lib/utils';

interface AddressAutocompleteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (address: string, coordinates?: [number, number]) => void;
  title: string;
  currentValue: string;
  placeholder?: string;
}

const AddressAutocomplete = ({
  isOpen,
  onClose,
  onSelect,
  title,
  currentValue,
  placeholder = "Введите адрес"
}: AddressAutocompleteProps) => {
  const [inputValue, setInputValue] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { predictions, isLoading, searchPlaces, getPlaceDetails, getCurrentLocation } = useUzbekistanPlaces();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen) {
      setInputValue(currentValue);
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
    }
  }, [isOpen, currentValue]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      searchPlaces(value);
    }, 300);
  };

  const handleSelectPrediction = async (prediction: any) => {
    const details = await getPlaceDetails(prediction.place_id);
    const address = prediction.description;
    
    // Сохраняем в недавние поиски
    const newRecentSearches = [address, ...recentSearches.filter(item => item !== address)].slice(0, 5);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recent_address_searches', JSON.stringify(newRecentSearches));
    
    const coordinates = details ? [details.geometry.location.lat, details.geometry.location.lng] as [number, number] : undefined;
    onSelect(address, coordinates);
    onClose();
  };

  const handleCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      
      // Сохраняем текущее местоположение в недавние поиски
      const locationAddress = location.address;
      const newRecentSearches = [locationAddress, ...recentSearches.filter(item => item !== locationAddress)].slice(0, 5);
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recent_address_searches', JSON.stringify(newRecentSearches));
      
      onSelect(location.address, [location.lat, location.lng]);
      onClose();
    } catch (error) {
      console.error('Error getting current location:', error);
      // Можно показать toast с ошибкой
    }
  };

  const handleRecentSelect = (address: string) => {
    onSelect(address);
    onClose();
  };

  const clearInput = () => {
    setInputValue('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Категоризируем результаты
  const categorizedResults = React.useMemo(() => {
    const cities = predictions.filter(p => 
      p.types.includes('locality') || p.types.includes('political')
    );
    const streets = predictions.filter(p => 
      p.types.includes('route') || p.types.includes('street_address') || 
      p.types.includes('establishment')
    );
    const others = predictions.filter(p => 
      !cities.includes(p) && !streets.includes(p)
    );

    return { cities, streets, others };
  }, [predictions]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-full bg-white">
        <div className="h-full flex flex-col">
          {/* Header */}
          <SheetHeader className="flex-shrink-0 border-b pb-4">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={onClose} className="mr-3 p-0">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>
            </div>
          </SheetHeader>

          {/* Search Input */}
          <div className="p-4 border-b flex-shrink-0">
            <div className="relative">
              <Input
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={placeholder}
                className="h-12 text-base pr-10"
                autoFocus
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
              {inputValue && !isLoading && (
                <Button
                  onClick={clearInput}
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
                >
                  <span className="text-gray-400">×</span>
                </Button>
              )}
            </div>
          </div>

          {/* Current Location Button */}
          <div className="p-4 border-b flex-shrink-0">
            <Button
              onClick={handleCurrentLocation}
              variant="ghost"
              className="w-full justify-start p-4 h-auto rounded-xl hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Navigation className="h-5 w-5 text-blue-600" />
                </div>
                <span className="font-medium">Использовать текущее местоположение</span>
              </div>
            </Button>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {inputValue.length > 0 && (
              <div className="p-4">
                {/* Cities */}
                {categorizedResults.cities.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-600 mb-2 px-2">Города</div>
                    <div className="space-y-1">
                      {categorizedResults.cities.map((prediction) => (
                        <Button
                          key={prediction.place_id}
                          onClick={() => handleSelectPrediction(prediction)}
                          variant="ghost"
                          className="w-full justify-start p-3 h-auto rounded-xl hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-3 w-full">
                            <div className="p-2 bg-green-100 rounded-full flex-shrink-0">
                              <MapPin className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {prediction.structured_formatting.main_text}
                              </div>
                              {prediction.structured_formatting.secondary_text && (
                                <div className="text-sm text-gray-500 truncate">
                                  {prediction.structured_formatting.secondary_text}
                                </div>
                              )}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Streets and Others */}
                {(categorizedResults.streets.length > 0 || categorizedResults.others.length > 0) && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-600 mb-2 px-2">Улицы и адреса</div>
                    <div className="space-y-1">
                      {[...categorizedResults.streets, ...categorizedResults.others].map((prediction) => (
                        <Button
                          key={prediction.place_id}
                          onClick={() => handleSelectPrediction(prediction)}
                          variant="ghost"
                          className="w-full justify-start p-3 h-auto rounded-xl hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-3 w-full">
                            <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                              <MapPin className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {prediction.structured_formatting.main_text}
                              </div>
                              {prediction.structured_formatting.secondary_text && (
                                <div className="text-sm text-gray-500 truncate">
                                  {prediction.structured_formatting.secondary_text}
                                </div>
                              )}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* No results */}
                {predictions.length === 0 && !isLoading && inputValue.length >= 2 && (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Места не найдены</p>
                    <p className="text-xs">Попробуйте изменить запрос</p>
                  </div>
                )}
              </div>
            )}

            {/* Recent Searches */}
            {inputValue.length === 0 && recentSearches.length > 0 && (
              <div className="p-4">
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-600">Недавние поиски</span>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((address, index) => (
                    <Button
                      key={index}
                      onClick={() => handleRecentSelect(address)}
                      variant="ghost"
                      className="w-full justify-start p-3 h-auto rounded-xl hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className="p-2 bg-gray-100 rounded-full flex-shrink-0">
                          <Clock className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{address}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddressAutocomplete;
