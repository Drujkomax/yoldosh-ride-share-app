
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

export const use2GisGeocoding = () => {
  const [isLoading, setIsLoading] = useState(false);
  const API_KEY = 'e50140a7-ffa3-493f-86d6-e25b5d1bfb17';

  const geocodeAddress = async (address: string): Promise<GeocodeResult[]> => {
    if (address.length < 2) return [];

    setIsLoading(true);
    try {
      console.log('Geocoding address with 2GIS:', address);
      
      const response = await fetch(
        `https://catalog.api.2gis.com/3.0/items/geocode?q=${encodeURIComponent(address)}&key=${API_KEY}&location=69.240073,41.311081&radius=50000&fields=items.point&locale=ru_RU`
      );
      
      if (!response.ok) {
        console.error('2GIS Geocoding API Error:', response.status);
        return generateMockResults(address);
      }

      const data = await response.json();
      const results = data.result?.items || [];
      
      return results.map((item: any) => ({
        name: item.name || 'Неизвестное место',
        description: item.full_name || item.address_name || 'Нет описания',
        coordinates: [item.point.lat, item.point.lon] as [number, number]
      }));
    } catch (error) {
      console.error('Error geocoding address:', error);
      return generateMockResults(address);
    } finally {
      setIsLoading(false);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://catalog.api.2gis.com/3.0/items/geocode?lat=${latitude}&lon=${longitude}&key=${API_KEY}&fields=items.point&locale=ru_RU`
      );
      
      if (response.ok) {
        const data = await response.json();
        const item = data.result?.items?.[0];
        return item?.full_name || item?.address_name || 'Неизвестный адрес';
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

  // Генерируем мок данные для демонстрации работы поиска
  const generateMockResults = (query: string): GeocodeResult[] => {
    const uzbekCities = [
      { name: 'Ташкент', coords: [41.2995, 69.2401] as [number, number] },
      { name: 'Самарканд', coords: [39.6542, 66.9597] as [number, number] },
      { name: 'Бухара', coords: [39.7747, 64.4286] as [number, number] },
      { name: 'Андижан', coords: [40.7821, 72.3442] as [number, number] },
      { name: 'Фергана', coords: [40.3834, 71.7842] as [number, number] },
      { name: 'Наманган', coords: [41.0004, 71.6726] as [number, number] }
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
