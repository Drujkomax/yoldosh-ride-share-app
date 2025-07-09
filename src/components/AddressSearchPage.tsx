import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Clock, Search } from 'lucide-react';

interface AddressSearchPageProps {
  title: string;
  onAddressSelect: (address: string, coordinates: [number, number]) => void;
  onBack: () => void;
  placeholder?: string;
}

const AddressSearchPage = ({ 
  title, 
  onAddressSelect, 
  onBack,
  placeholder = "Введите адрес" 
}: AddressSearchPageProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    const initializeGoogleServices = () => {
      if (window.google?.maps?.places?.AutocompleteService) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        geocoder.current = new window.google.maps.Geocoder();
      }
    };

    if (window.google) {
      initializeGoogleServices();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCJSjDFNJvtX9BS2UGQ1QAFq7yLiid7d68&libraries=places&language=ru`;
      script.onload = initializeGoogleServices;
      document.head.appendChild(script);
    }
  }, []);

  const searchPlaces = async (searchQuery: string) => {
    if (!autocompleteService.current || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    try {
      autocompleteService.current.getPlacePredictions(
        {
          input: searchQuery,
          componentRestrictions: { country: 'uz' },
          types: ['(cities)']
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
          } else {
            setSuggestions([]);
          }
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Error searching places:', error);
      setIsLoading(false);
    }
  };

  const handleSuggestionSelect = async (suggestion: any) => {
    if (!geocoder.current) return;

    try {
      geocoder.current.geocode(
        { placeId: suggestion.place_id },
        (results, status) => {
          if (status === 'OK' && results?.[0]) {
            const location = results[0].geometry.location;
            const coordinates: [number, number] = [location.lat(), location.lng()];
            onAddressSelect(suggestion.description, coordinates);
          }
        }
      );
    } catch (error) {
      console.error('Error geocoding:', error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        searchPlaces(query);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

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
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-2xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-lg"
            autoFocus
          />
        </div>

        {/* Current Location Button */}
        <Button
          variant="ghost"
          className="w-full justify-start text-left p-4 h-auto hover:bg-gray-50 mb-4"
          onClick={() => {
            if ('geolocation' in navigator) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
                  onAddressSelect('Текущее местоположение', coords);
                },
                (error) => console.error('Error getting location:', error)
              );
            }
          }}
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={suggestion.place_id}
              variant="ghost"
              onClick={() => handleSuggestionSelect(suggestion)}
              className="w-full justify-start text-left p-4 h-auto hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-full">
                  <MapPin className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {suggestion.structured_formatting?.main_text || suggestion.description}
                  </div>
                  {suggestion.structured_formatting?.secondary_text && (
                    <div className="text-sm text-gray-500 truncate">
                      {suggestion.structured_formatting.secondary_text}
                    </div>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Recent Searches */}
        {query === '' && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Недавние поиски</h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-left p-4 h-auto hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Clock className="h-4 w-4 text-gray-500" />
                  </div>
                  <span className="text-gray-700">Аэропорт Ташкент</span>
                </div>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressSearchPage;