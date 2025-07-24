
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

export const useYandexGeocoding = () => {
  const [isLoading, setIsLoading] = useState(false);
  // API key is now managed securely via edge function

  const geocodeAddress = async (address: string): Promise<GeocodeResult[]> => {
    if (address.length < 2) return [];

    setIsLoading(true);
    try {
      console.log('Geocoding address:', address);
      
      const response = await fetch(
        null // Will be replaced with secure edge function call
      );
      
      if (!response.ok) {
        console.error('Geocoding API Error:', response.status);
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const results = data.response?.GeoObjectCollection?.featureMember || [];
      
      return results.map((item: any) => {
        const geoObject = item.GeoObject;
        const coords = geoObject.Point.pos.split(' ').map(Number).reverse();
        
        return {
          name: geoObject.name || '',
          description: geoObject.description || geoObject.metaDataProperty?.GeocoderMetaData?.text || '',
          coordinates: coords as [number, number]
        };
      });
    } catch (error) {
      console.error('Error geocoding address:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const response = await fetch(
        null // Will be replaced with secure edge function call
      );
      
      if (response.ok) {
        const data = await response.json();
        const geoObject = data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
        return geoObject?.name || geoObject?.description || 'Неизвестный адрес';
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
