
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text?: string;
  };
  types: string[];
}

interface PlaceDetails {
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
}

// Географические границы Узбекистана
const UZBEKISTAN_BOUNDS = {
  north: 45.59,
  south: 37.18,
  east: 73.17,
  west: 55.99
};

// Популярные города Узбекистана для быстрого поиска
const UZBEK_CITIES = [
  'Ташкент', 'Самарканд', 'Бухара', 'Андижан', 'Наманган', 'Фергана', 
  'Карши', 'Термез', 'Ургенч', 'Нукус', 'Джизак', 'Навои', 'Гулистан',
  'Коканд', 'Маргилан', 'Чирчик', 'Ангрен', 'Олмалык', 'Шахрисабз'
];

export const useUzbekistanPlaces = () => {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isInUzbekistan = useCallback((lat: number, lng: number): boolean => {
    return lat >= UZBEKISTAN_BOUNDS.south && 
           lat <= UZBEKISTAN_BOUNDS.north && 
           lng >= UZBEKISTAN_BOUNDS.west && 
           lng <= UZBEKISTAN_BOUNDS.east;
  }, []);

  const isUzbekistanRelated = useCallback((prediction: PlacePrediction): boolean => {
    const description = prediction.description.toLowerCase();
    const secondaryText = prediction.structured_formatting.secondary_text?.toLowerCase() || '';
    
    // Проверяем наличие узбекских маркеров
    const uzbekMarkers = [
      'узбекистан', 'uzbekistan', 'tashkent', 'ташкент', 'самарканд', 'samarkand',
      'бухара', 'bukhara', 'андижан', 'andijan', 'наман', 'namangan',
      'фергана', 'fergana', 'карши', 'karshi', 'термез', 'termez'
    ];
    
    return uzbekMarkers.some(marker => 
      description.includes(marker) || secondaryText.includes(marker)
    );
  }, []);

  const getLocalSuggestions = useCallback((input: string): PlacePrediction[] => {
    const query = input.toLowerCase();
    return UZBEK_CITIES
      .filter(city => city.toLowerCase().includes(query))
      .slice(0, 5)
      .map((city, index) => ({
        place_id: `local_${index}_${city}`,
        description: `${city}, Узбекистан`,
        structured_formatting: {
          main_text: city,
          secondary_text: 'Узбекистан'
        },
        types: ['locality', 'political']
      }));
  }, []);

  const searchPlaces = useCallback(async (input: string) => {
    if (input.length < 2) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    
    try {
      // Сначала показываем локальные предложения для быстрого отклика
      const localSuggestions = getLocalSuggestions(input);
      if (localSuggestions.length > 0) {
        setPredictions(localSuggestions);
      }

      // Затем делаем запрос к Google API
      const { data, error } = await supabase.functions.invoke('google-geocoding', {
        body: {
          query: input,
          type: 'autocomplete'
        }
      });

      if (error) {
        console.error('Error calling google-geocoding function:', error);
        // Оставляем локальные предложения при ошибке API
        return;
      }
      
      if (data && data.predictions) {
        // Фильтруем результаты для Узбекистана
        const uzbekistanPredictions = data.predictions.filter((prediction: PlacePrediction) => {
          return isUzbekistanRelated(prediction);
        });

        // Объединяем локальные и API результаты, удаляя дубликаты
        const combinedResults = [
          ...localSuggestions,
          ...uzbekistanPredictions.filter((apiPred: PlacePrediction) => 
            !localSuggestions.some(localPred => 
              localPred.structured_formatting.main_text.toLowerCase() === 
              apiPred.structured_formatting.main_text.toLowerCase()
            )
          )
        ].slice(0, 10); // Ограничиваем до 10 результатов

        setPredictions(combinedResults);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
      // При ошибке оставляем локальные предложения
    } finally {
      setIsLoading(false);
    }
  }, [getLocalSuggestions, isUzbekistanRelated]);

  const getPlaceDetails = useCallback(async (placeId: string): Promise<PlaceDetails | null> => {
    // Обрабатываем локальные результаты
    if (placeId.startsWith('local_')) {
      const cityName = placeId.split('_')[2];
      return {
        name: cityName,
        formatted_address: `${cityName}, Узбекистан`,
        geometry: {
          location: {
            lat: 41.2995, // Примерные координаты центра Узбекистана
            lng: 69.2401
          }
        },
        types: ['locality', 'political']
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke('google-geocoding', {
        body: {
          query: placeId,
          type: 'details'
        }
      });

      if (error) {
        console.error('Error calling google-geocoding function:', error);
        return null;
      }
      
      if (data && data.result) {
        const result = data.result;
        // Проверяем, что место находится в Узбекистане
        if (result.geometry && result.geometry.location) {
          const { lat, lng } = result.geometry.location;
          if (isInUzbekistan(lat, lng)) {
            return result;
          }
        }
        return result; // Возвращаем результат даже если координаты не проверены
      }
      return null;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  }, [isInUzbekistan]);

  const getCurrentLocation = useCallback((): Promise<{ lat: number; lng: number; address: string }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Проверяем, что пользователь в Узбекистане
          if (!isInUzbekistan(latitude, longitude)) {
            resolve({
              lat: latitude,
              lng: longitude,
              address: 'Местоположение вне Узбекистана'
            });
            return;
          }
          
          try {
            const { data, error } = await supabase.functions.invoke('google-geocoding', {
              body: {
                query: `${latitude},${longitude}`,
                type: 'reverse'
              }
            });

            if (error) {
              console.error('Error calling google-geocoding function:', error);
              resolve({
                lat: latitude,
                lng: longitude,
                address: 'Текущее местоположение'
              });
              return;
            }

            const address = data?.results?.[0]?.formatted_address || 'Текущее местоположение';
            
            resolve({
              lat: latitude,
              lng: longitude,
              address
            });
          } catch (error) {
            resolve({
              lat: latitude,
              lng: longitude,
              address: 'Текущее местоположение'
            });
          }
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 минут кеш
        }
      );
    });
  }, [isInUzbekistan]);

  return {
    predictions,
    isLoading,
    searchPlaces,
    getPlaceDetails,
    getCurrentLocation
  };
};
