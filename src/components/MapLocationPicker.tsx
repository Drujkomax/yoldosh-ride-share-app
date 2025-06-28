
import React, { useEffect, useRef, useState } from 'react';
import { useYandexMap } from './YandexMapProvider';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

interface MapLocationPickerProps {
  onLocationSelect: (coordinates: [number, number], address: string) => void;
  defaultCenter?: [number, number];
  placeholder?: string;
  selectedLocation?: [number, number];
}

const MapLocationPicker = ({ 
  onLocationSelect, 
  defaultCenter = [41.2995, 69.2401], // Ташкент
  placeholder = "Выберите точку на карте",
  selectedLocation
}: MapLocationPickerProps) => {
  const { isLoaded, ymaps } = useYandexMap();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [placemark, setPlacemark] = useState<any>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  useEffect(() => {
    if (!isLoaded || !ymaps || !mapRef.current) return;

    const mapInstance = new ymaps.Map(mapRef.current, {
      center: selectedLocation || defaultCenter,
      zoom: 12,
      controls: ['zoomControl', 'fullscreenControl']
    });

    // Добавляем плейсмарк если есть выбранная локация
    if (selectedLocation) {
      const newPlacemark = new ymaps.Placemark(selectedLocation, {
        hintContent: 'Выбранная точка'
      }, {
        preset: 'islands#redDotIcon',
        draggable: true
      });

      mapInstance.geoObjects.add(newPlacemark);
      setPlacemark(newPlacemark);

      // Обработчик перетаскивания
      newPlacemark.events.add('dragend', () => {
        const coords = newPlacemark.geometry.getCoordinates();
        handleLocationSelect(coords);
      });
    }

    // Обработчик клика по карте
    mapInstance.events.add('click', (e: any) => {
      const coords = e.get('coords');
      handleLocationSelect(coords);
    });

    setMap(mapInstance);

    return () => {
      mapInstance.destroy();
    };
  }, [isLoaded, ymaps, selectedLocation]);

  const handleLocationSelect = async (coords: [number, number]) => {
    if (!ymaps) return;

    try {
      // Получаем адрес по координатам
      const geocoder = ymaps.geocode(coords);
      geocoder.then((res: any) => {
        const firstGeoObject = res.geoObjects.get(0);
        const address = firstGeoObject ? firstGeoObject.getAddressLine() : 'Неизвестный адрес';
        
        // Обновляем или создаем плейсмарк
        if (placemark) {
          placemark.geometry.setCoordinates(coords);
        } else if (map) {
          const newPlacemark = new ymaps.Placemark(coords, {
            hintContent: address
          }, {
            preset: 'islands#redDotIcon',
            draggable: true
          });

          map.geoObjects.add(newPlacemark);
          setPlacemark(newPlacemark);

          // Добавляем обработчик перетаскивания
          newPlacemark.events.add('dragend', () => {
            const newCoords = newPlacemark.geometry.getCoordinates();
            handleLocationSelect(newCoords);
          });
        }

        onLocationSelect(coords, address);
      });
    } catch (error) {
      console.error('Error getting address:', error);
      onLocationSelect(coords, 'Неизвестный адрес');
    }
  };

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          if (map) {
            map.setCenter(coords, 14);
          }
          handleLocationSelect(coords);
          setIsDetectingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsDetectingLocation(false);
        }
      );
    } else {
      setIsDetectingLocation(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Загрузка карты...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">{placeholder}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDetectLocation}
          disabled={isDetectingLocation}
          className="text-sm"
        >
          <Navigation className="h-4 w-4 mr-2" />
          {isDetectingLocation ? 'Определяем...' : 'Моя геолокация'}
        </Button>
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-lg border border-gray-200"
        style={{ minHeight: '256px' }}
      />
      
      <div className="text-xs text-gray-500 text-center">
        Нажмите на карту или перетащите маркер для выбора точки
      </div>
    </div>
  );
};

export default MapLocationPicker;
