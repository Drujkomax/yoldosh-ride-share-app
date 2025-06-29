
import { useState } from 'react';

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
  const API_KEY = 'AIzaSyCJSjDFNJvtX9BS2UGQ1QAFq7yLiid7d68';

  const geocodeAddress = async (address: string): Promise<GeocodeResult[]> => {
    if (address.length < 2) return [];

    setIsLoading(true);
    try {
      console.log('Geocoding address with Google Maps:', address);
      
      // Используем Google Places API Autocomplete для получения предложений
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(address)}&key=${API_KEY}&language=ru&components=country:uz&types=geocode`
      );
      
      if (!response.ok) {
        console.error('Google Places Autocomplete API Error:', response.status);
        return generateMockResults(address);
      }

      const data = await response.json();
      console.log('Google Places API response:', data);
      
      if (data.status === 'REQUEST_DENIED' || data.status === 'INVALID_REQUEST') {
        console.error('Google Places API Error:', data.status, data.error_message);
        // Попробуем использовать Geocoding API как fallback
        return await fallbackGeocode(address);
      }

      const predictions = data.predictions || [];
      
      // Для каждого предложения получаем координаты
      const results = await Promise.all(
        predictions.slice(0, 8).map(async (prediction: any) => {
          try {
            const detailsResponse = await fetch(
              `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&key=${API_KEY}&fields=geometry,formatted_address&language=ru`
            );
            
            if (detailsResponse.ok) {
              const detailsData = await detailsResponse.json();
              if (detailsData.result && detailsData.result.geometry) {
                return {
                  name: prediction.structured_formatting?.main_text || prediction.description.split(',')[0],
                  description: prediction.description,
                  coordinates: [
                    detailsData.result.geometry.location.lat,
                    detailsData.result.geometry.location.lng
                  ] as [number, number]
                };
              }
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
      return await fallbackGeocode(address);
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback к обычному Geocoding API
  const fallbackGeocode = async (address: string): Promise<GeocodeResult[]> => {
    try {
      console.log('Using fallback Geocoding API for:', address);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address + ', Узбекистан')}&key=${API_KEY}&language=ru&region=uz`
      );
      
      if (!response.ok) {
        return generateMockResults(address);
      }

      const data = await response.json();
      const results = data.results || [];
      
      return results.slice(0, 5).map((item: any) => ({
        name: item.address_components?.[0]?.long_name || item.formatted_address.split(',')[0] || 'Неизвестное место',
        description: item.formatted_address || 'Нет описания',
        coordinates: [item.geometry.location.lat, item.geometry.location.lng] as [number, number]
      }));
    } catch (error) {
      console.error('Error with fallback geocoding:', error);
      return generateMockResults(address);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}&language=ru`
      );
      
      if (response.ok) {
        const data = await response.json();
        const result = data.results?.[0];
        return result?.formatted_address || 'Неизвестный адрес';
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
    
    return 'Неизвестный адрес';
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
    isLoading
  };
};
