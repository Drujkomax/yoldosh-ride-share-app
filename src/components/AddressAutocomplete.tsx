// Рабочий компонент AddressAutocomplete с Google Places API
// Файл: components/AddressAutocomplete.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, MapPin, Search, AlertCircle, Loader2 } from 'lucide-react';

interface PlaceResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text?: string;
  };
  types: string[];
}

interface AddressAutocompleteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (address: string) => void;
  title: string;
  currentValue: string;
  placeholder: string;
}

// Ваш Google Places API ключ (временно тут, потом вынесем в .env)
const GOOGLE_PLACES_API_KEY = 'AIzaSyCiN_TjO_nu1zy1O9Vk0FV2f9Breqgz-co';

// CORS Proxy для обхода ограничений (временное решение)
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Функция для получения предложений через CORS proxy
const getPlacesAutocomplete = async (input: string): Promise<PlaceResult[]> => {
  try {
    if (!input || input.length < 2) return [];

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
      `?input=${encodeURIComponent(input)}` +
      `&key=${GOOGLE_PLACES_API_KEY}` +
      `&types=(cities)` +
      `&components=country:uz` +
      `&language=ru`;

    console.log('Fetching places for:', input);

    // Используем CORS proxy
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Places API response:', data);

    if (data.status === 'OK' && data.predictions) {
      return data.predictions.slice(0, 8); // Ограничиваем до 8 результатов
    } else if (data.status === 'ZERO_RESULTS') {
      return [];
    } else {
      console.error('Places API error:', data.status, data.error_message);
      throw new Error(data.error_message || data.status);
    }
  } catch (error) {
    console.error('Error fetching places:', error);
    return [];
  }
};

// Fallback список городов Узбекистана
const UZBEKISTAN_CITIES = [
  'Ташкент', 'Самарканд', 'Наманган', 'Андижан', 'Фергана', 'Бухара', 
  'Нукус', 'Карши', 'Коканд', 'Маргилан', 'Джизак', 'Ургенч', 
  'Навои', 'Термез', 'Ангрен', 'Алмалык', 'Гулистан', 'Чирчик', 
  'Янгиюль', 'Каттакурган', 'Асака', 'Учкурган', 'Чуст', 'Хива',
  'Муйнак', 'Шахрисабз', 'Денау'
];

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  isOpen,
  onClose,
  onSelect,
  title,
  currentValue,
  placeholder
}) => {
  const [query, setQuery] = useState(currentValue);
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [usesFallback, setUsesFallback] = useState(false);

  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Функция поиска с fallback
  const searchPlaces = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setError('');
      return;
    }

    // Отменяем предыдущий запрос
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsLoading(true);
    setError('');
    abortControllerRef.current = new AbortController();

    try {
      // Пробуем получить данные из Google Places API
      const apiResults = await Promise.race([
        getPlacesAutocomplete(searchQuery),
        new Promise<PlaceResult[]>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      ]);

      if (apiResults.length > 0) {
        setSuggestions(apiResults);
        setUsesFallback(false);
      } else {
        // Если API не вернул результатов, используем fallback
        useFallbackSearch(searchQuery);
      }

    } catch (apiError) {
      console.warn('API failed, using fallback:', apiError);
      useFallbackSearch(searchQuery);
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback поиск по локальному списку городов
  const useFallbackSearch = (searchQuery: string) => {
    const query = searchQuery.toLowerCase().trim();
    const filtered = UZBEKISTAN_CITIES
      .filter(city => city.toLowerCase().includes(query))
      .slice(0, 8)
      .map((city, index) => ({
        place_id: `fallback_${index}`,
        description: city,
        structured_formatting: {
          main_text: city,
          secondary_text: 'Узбекистан'
        },
        types: ['locality']
      }));

    setSuggestions(filtered);
    setUsesFallback(true);

    if (filtered.length === 0) {
      setError('Город не найден. Попробуйте изменить запрос.');
    }
  };

  // Дебаунсированный поиск
  const handleInputChange = (value: string) => {
    setQuery(value);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      searchPlaces(value);
    }, 300);
  };

  // Обработка выбора места
  const handleSelect = (suggestion: PlaceResult) => {
    const selectedAddress = suggestion.description;
    setQuery(selectedAddress);
    onSelect(selectedAddress);
    onClose();
  };

  // Очистка поля ввода
  const clearInput = () => {
    setQuery('');
    setSuggestions([]);
    setError('');
  };

  // Инициализация при открытии
  useEffect(() => {
    if (isOpen) {
      setQuery(currentValue);
      if (currentValue) {
        searchPlaces(currentValue);
      }
    } else {
      // Очистка при закрытии
      setSuggestions([]);
      setError('');
      setIsLoading(false);
    }
  }, [isOpen, currentValue]);

  // Очистка таймаутов при размонтировании
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col">
      <div className="bg-white flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-teal-50">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b bg-white sticky top-0 z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={placeholder}
              className="pl-10 pr-10 h-12 text-base border-2 border-teal-200 focus:border-teal-400"
              autoFocus
            />
            {query && (
              <Button
                onClick={clearInput}
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Status indicator */}
          {usesFallback && (
            <div className="flex items-center mt-2 text-sm text-orange-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span>Офлайн режим - используются локальные данные</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
            <span className="ml-2 text-gray-600">Поиск мест...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex items-center justify-center py-8 text-red-500">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Popular Cities (when no query) */}
        {!query && !isLoading && (
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Популярные города</h3>
            <div className="grid grid-cols-2 gap-2">
              {UZBEKISTAN_CITIES.slice(0, 8).map((city) => (
                <Button
                  key={city}
                  onClick={() => handleSelect({
                    place_id: `popular_${city}`,
                    description: city,
                    structured_formatting: { main_text: city, secondary_text: 'Узбекистан' },
                    types: ['locality']
                  })}
                  variant="outline"
                  className="justify-start text-left h-10 text-sm"
                >
                  <MapPin className="w-4 h-4 mr-2 text-teal-500" />
                  {city}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions List */}
        <div className="flex-1 overflow-y-auto">
          {suggestions.length > 0 && !isLoading ? (
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.place_id}_${index}`}
                  onClick={() => handleSelect(suggestion)}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-teal-50 text-left transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <MapPin className="w-5 h-5 text-teal-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-900 font-medium">
                      {suggestion.structured_formatting.main_text}
                    </div>
                    {suggestion.structured_formatting.secondary_text && (
                      <div className="text-gray-500 text-sm truncate">
                        {suggestion.structured_formatting.secondary_text}
                      </div>
                    )}
                    {suggestion.place_id.startsWith('fallback_') && (
                      <div className="text-orange-500 text-xs">
                        Локальные данные
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            query && !isLoading && !error && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <MapPin className="w-12 h-12 text-gray-300 mb-4" />
                <div className="text-lg font-medium mb-2">Места не найдены</div>
                <div className="text-sm text-center px-4">
                  Попробуйте изменить поисковый запрос
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-center">
          <div className="text-xs text-gray-500">
            {usesFallback 
              ? `Локальные данные • ${suggestions.length} результатов`
              : `Google Places API • ${suggestions.length} результатов`
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressAutocomplete;