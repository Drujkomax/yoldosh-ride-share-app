
import { useState, useCallback } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: string;
}

export const useLocation = () => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback((): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Геолокация не поддерживается вашим браузером'));
        return;
      }

      setIsGettingLocation(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Получаем адрес по координатам (опционально)
            let address = '';
            try {
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ru`
              );
              if (response.ok) {
                const data = await response.json();
                address = data.display_name || data.locality || '';
              }
            } catch (addressError) {
              console.warn('Не удалось получить адрес:', addressError);
            }

            const locationData: LocationData = {
              latitude,
              longitude,
              address,
              timestamp: new Date().toISOString()
            };

            setIsGettingLocation(false);
            resolve(locationData);
          } catch (err) {
            setIsGettingLocation(false);
            reject(err);
          }
        },
        (error) => {
          setIsGettingLocation(false);
          let errorMessage = 'Не удалось получить местоположение';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Доступ к геолокации запрещен';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Местоположение недоступно';
              break;
            case error.TIMEOUT:
              errorMessage = 'Время ожидания истекло';
              break;
          }
          
          setError(errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 минут кеш
        }
      );
    });
  }, []);

  return {
    getCurrentLocation,
    isGettingLocation,
    error
  };
};
