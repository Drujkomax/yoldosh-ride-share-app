
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
  const API_KEY = 'e50140a7-ffa3-493f-86d6-e25b5d1bfb17';

  const geocodeAddress = async (address: string): Promise<GeocodeResult[]> => {
    if (address.length < 3) return [];

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=${API_KEY}&geocode=${encodeURIComponent(address)}&format=json&results=5&lang=ru_RU`
      );
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const results = data.response?.GeoObjectCollection?.featureMember || [];
      
      return results.map((item: any) => {
        const geoObject = item.GeoObject;
        const coords = geoObject.Point.pos.split(' ').map(Number).reverse();
        
        return {
          name: geoObject.name || '',
          description: geoObject.description || '',
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
        `https://geocode-maps.yandex.ru/1.x/?apikey=${API_KEY}&geocode=${longitude},${latitude}&format=json&lang=ru_RU`
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
      // Используем Yandex Routes API для расчета маршрута
      const response = await fetch(
        `https://api.routing.yandex.net/v2/route?apikey=${API_KEY}&waypoints=${startPoint[1]},${startPoint[0]}|${endPoint[1]},${endPoint[0]}&mode=driving&lang=ru_RU`
      );
      
      if (!response.ok) {
        throw new Error('Route calculation failed');
      }

      const data = await response.json();
      const route = data.route;
      
      if (route && route.legs && route.legs.length > 0) {
        const totalDistance = route.legs.reduce((sum: number, leg: any) => sum + leg.distance.value, 0);
        const totalDuration = route.legs.reduce((sum: number, leg: any) => sum + leg.duration.value, 0);
        
        return {
          distance: `${Math.round(totalDistance / 1000)} км`,
          duration: `${Math.round(totalDuration / 60)} мин`,
          coordinates: route.geometry || []
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error calculating route:', error);
      return null;
    }
  };

  return {
    geocodeAddress,
    reverseGeocode,
    calculateRoute,
    isLoading
  };
};
