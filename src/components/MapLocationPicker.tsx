
import React, { useEffect, useRef, useState } from 'react';
import { useYandexMap } from './YandexMapProvider';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Crosshair } from 'lucide-react';

interface MapLocationPickerProps {
  onLocationSelect: (coordinates: [number, number], address: string) => void;
  defaultCenter?: [number, number];
  placeholder?: string;
  selectedLocation?: [number, number];
}

const MapLocationPicker = ({ 
  onLocationSelect, 
  defaultCenter = [41.2995, 69.2401],
  placeholder = "Выберите точку на карте",
  selectedLocation
}: MapLocationPickerProps) => {
  const { isLoaded, ymaps } = useYandexMap();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [placemark, setPlacemark] = useState<any>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>('');

  useEffect(() => {
    if (!isLoaded || !ymaps || !mapRef.current) return;

    const mapInstance = new ymaps.Map(mapRef.current, {
      center: selectedLocation || defaultCenter,
      zoom: selectedLocation ? 15 : 12,
      controls: ['zoomControl', 'fullscreenControl', 'typeSelector']
    });

    if (selectedLocation) {
      const newPlacemark = new ymaps.Placemark(selectedLocation, {
        hintContent: 'Выбранная точка'
      }, {
        preset: 'islands#redCircleDotIconWithCaption',
        draggable: true,
        iconColor: '#3b82f6'
      });

      mapInstance.geoObjects.add(newPlacemark);
      setPlacemark(newPlacemark);

      newPlacemark.events.add('dragend', () => {
        const coords = newPlacemark.geometry.getCoordinates();
        handleLocationSelect(coords);
      });
    }

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
      const geocoder = ymaps.geocode(coords);
      geocoder.then((res: any) => {
        const firstGeoObject = res.geoObjects.get(0);
        const address = firstGeoObject ? firstGeoObject.getAddressLine() : 'Неизвестный адрес';
        
        setSelectedAddress(address);

        if (placemark) {
          placemark.geometry.setCoordinates(coords);
          placemark.properties.set('hintContent', address);
        } else if (map) {
          const newPlacemark = new ymaps.Placemark(coords, {
            hintContent: address
          }, {
            preset: 'islands#redCircleDotIconWithCaption',
            draggable: true,
            iconColor: '#3b82f6'
          });

          map.geoObjects.add(newPlacemark);
          setPlacemark(newPlacemark);

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
            map.setCenter(coords, 15);
          }
          handleLocationSelect(coords);
          setIsDetectingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsDetectingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setIsDetectingLocation(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-inner">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600 mx-auto mb-4"></div>
          <div className="text-gray-600 font-medium">Загрuzka карты...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500 rounded-full">
            <Crosshair className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-gray-800">{placeholder}</div>
            {selectedAddress && (
              <div className="text-sm text-gray-600 mt-1">{selectedAddress}</div>
            )}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleDetectLocation}
          disabled={isDetectingLocation}
          className="bg-white hover:bg-blue-50 border-blue-300 text-blue-600 font-medium rounded-xl px-4 py-2"
        >
          <Navigation className="h-4 w-4 mr-2" />
          {isDetectingLocation ? 'Определяем...' : 'Моё местоположение'}
        </Button>
      </div>
      
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-80 rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden"
          style={{ minHeight: '320px' }}
        />
        
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span>Нажмите на карту или перетащите маркер для выбора точки</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLocationPicker;
