
import { useState } from 'react';

interface GeocodeResult {
  name: string;
  description: string;
  coordinates: [number, number];
}

export const useYandexGeocoding = () => {
  const [isLoading, setIsLoading] = useState(false);
  const API_KEY = 'fc46d1dc-d099-42f9-baf7-e6d468df0eef';

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

  return {
    geocodeAddress,
    reverseGeocode,
    isLoading
  };
};
