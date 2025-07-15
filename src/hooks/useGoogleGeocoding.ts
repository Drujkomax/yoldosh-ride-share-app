import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GeocodeResult {
  name: string;
  description: string;
  coordinates: [number, number];
}

interface RouteResult {
  distance: string;
  duration: string;
  coordinates: number[][];
}

export const useGoogleGeocoding = () => {
  const [isLoading, setIsLoading] = useState(false);

  const geocodeAddress = async (address: string): Promise<GeocodeResult[]> => {
    if (address.length < 2) return [];

    setIsLoading(true);
    try {
      console.log('Geocoding address with Google Maps:', address);
      
      // Используем Edge Function для безопасного обращения к Google API
      const { data, error } = await supabase.functions.invoke('google-geocoding', {
        body: { query: address, type: 'autocomplete' }
      });

      if (error) {
        console.error('Error calling Edge Function:', error);
        return generateMockResults(address);
      }

      console.log('Google Places API response:', data);
      
      if (data.status === 'REQUEST_DENIED' || data.status === 'INVALID_REQUEST') {
        console.error('Google Places API Error:', data.status, data.error_message);
        return generateMockResults(address);
      }

      const predictions = data.predictions || [];
      
      // Для каждого предложения получаем координаты
      const results = await Promise.all(
        predictions.slice(0, 8).map(async (prediction: any) => {
          try {
            const { data: detailsData, error: detailsError } = await supabase.functions.invoke('google-geocoding', {
              body: { query: prediction.place_id, type: 'details' }
            });
            
            if (!detailsError && detailsData?.result?.geometry) {
              return {
                name: prediction.structured_formatting?.main_text || prediction.description.split(',')[0],
                description: prediction.description,
                coordinates: [
                  detailsData.result.geometry.location.lat,
                  detailsData.result.geometry.location.lng
                ] as [number, number]
              };
            }
            
            // Если не удалось получить детали, используем базовую информацию
            return {
              name: prediction.structured_formatting?.main_text || prediction.description.split(',')[0],
              description: prediction.description,
              coordinates: [41.2995, 69.2401] as [number, number] // Ташкент по умолчанию
            };
          } catch (error) {
            console.error('Error getting place details:', error);
            return {
              name: prediction.structured_formatting?.main_text || prediction.description.split(',')[0],
              description: prediction.description,
              coordinates: [41.2995, 69.2401] as [number, number]
            };
          }
        })
      );
      
      return results.filter(result => result !== null);
    } catch (error) {
      console.error('Error with Google Places API:', error);
      return generateMockResults(address);
    } finally {
      setIsLoading(false);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      console.log('Reverse geocoding coordinates:', latitude, longitude);
      
      const { data, error } = await supabase.functions.invoke('google-geocoding', {
        body: { query: `${latitude},${longitude}`, type: 'reverse' }
      });
      
      if (!error && data?.results?.[0]) {
        console.log('Reverse geocoding result:', data.results[0].formatted_address);
        return data.results[0].formatted_address || 'Неизвестный адрес';
      }
      
      console.log('Reverse geocoding failed, using fallback');
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
    
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  };

  const getRouteInfo = async (origin: string, destination: string): Promise<RouteResult | null> => {
    try {
      console.log('Getting route info from:', origin, 'to:', destination);
      
      const { data, error } = await supabase.functions.invoke('google-geocoding', {
        body: { 
          type: 'directions',
          origin,
          destination
        }
      });
      
      if (!error && data?.routes?.[0]) {
        const route = data.routes[0];
        const leg = route.legs[0];
        
        console.log('Route info:', {
          distance: leg.distance.text,
          duration: leg.duration.text
        });
        
        return {
          distance: leg.distance.text,
          duration: leg.duration.text,
          coordinates: route.overview_polyline ? [] : [] // Можно добавить декодирование полилинии если нужно
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting route info:', error);
      return null;
    }
  };

  const calculateRoute = async (startPoint: [number, number], endPoint: [number, number]): Promise<RouteResult | null> => {
    try {
      // Используем упрощенный расчет расстояния для демонстрации
      const distance = calculateDistance(startPoint, endPoint);
      const duration = Math.round(distance / 60); // примерно 60 км/ч средняя скорость
      
      return {
        distance: `${Math.round(distance)} км`,
        duration: `${duration} ч`,
        coordinates: [
          [startPoint[1], startPoint[0]], // lng, lat для карты
          [endPoint[1], endPoint[0]]
        ]
      };
    } catch (error) {
      console.error('Error calculating route:', error);
      return null;
    }
  };

  // Генерируем мок данные для городов Узбекистана
  const generateMockResults = (query: string): GeocodeResult[] => {
    const uzbekCities = [
      { name: 'Ташкент', coords: [41.2995, 69.2401] as [number, number] },
      { name: 'Самарканд', coords: [39.6542, 66.9597] as [number, number] },
      { name: 'Бухара', coords: [39.7747, 64.4286] as [number, number] },
      { name: 'Андижан', coords: [40.7821, 72.3442] as [number, number] },
      { name: 'Фергана', coords: [40.3834, 71.7842] as [number, number] },
      { name: 'Наманган', coords: [41.0004, 71.6726] as [number, number] },
      { name: 'Карши', coords: [38.8606, 65.7975] as [number, number] },
      { name: 'Термез', coords: [37.2242, 67.2783] as [number, number] },
      { name: 'Ургенч', coords: [41.5504, 60.6333] as [number, number] },
      { name: 'Нукус', coords: [42.4731, 59.6103] as [number, number] }
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

  // Функция для расчета расстояния между двумя точками
  const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
    const R = 6371; // Радиус Земли в км
    const dLat = toRad(point2[0] - point1[0]);
    const dLon = toRad(point2[1] - point1[1]);
    const lat1 = toRad(point1[0]);
    const lat2 = toRad(point2[0]);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const toRad = (value: number): number => {
    return value * Math.PI / 180;
  };

  return {
    geocodeAddress,
    reverseGeocode,
    calculateRoute,
    getRouteInfo,
    isLoading
  };
};
