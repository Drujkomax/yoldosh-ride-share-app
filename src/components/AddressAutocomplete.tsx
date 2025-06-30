
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Navigation, MapPin, Clock, ChevronLeft } from 'lucide-react';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
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
  const { predictions, isLoading, searchPlaces, getPlaceDetails, getCurrentLocation } = useGooglePlaces();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen) {
      setInputValue(currentValue);
      // Загружаем недавние поиски из localStorage
      const saved = localStorage.getItem('recent_address_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
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
      onSelect(location.address, [location.lat, location.lng]);
      onClose();
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  const handleRecentSelect = (address: string) => {
    onSelect(address);
    onClose();
  };

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
            <Input
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={placeholder}
              className="h-12 text-base"
              autoFocus
            />
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
            {inputValue.length > 0 && predictions.length > 0 && (
              <div className="p-4">
                <div className="space-y-2">
                  {predictions.map((prediction) => (
                    <Button
                      key={prediction.place_id}
                      onClick={() => handleSelectPrediction(prediction)}
                      variant="ghost"
                      className="w-full justify-start p-4 h-auto rounded-xl hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className="p-2 bg-gray-100 rounded-full flex-shrink-0">
                          <MapPin className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {prediction.structured_formatting.main_text}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {prediction.structured_formatting.secondary_text}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {inputValue.length === 0 && recentSearches.length > 0 && (
              <div className="p-4">
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-600">Недавние поиски</span>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((address, index) => (
                    <Button
                      key={index}
                      onClick={() => handleRecentSelect(address)}
                      variant="ghost"
                      className="w-full justify-start p-4 h-auto rounded-xl hover:bg-gray-50"
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
