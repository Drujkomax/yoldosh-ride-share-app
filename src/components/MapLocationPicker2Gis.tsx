
import React, { useEffect, useRef, useState } from 'react';
import { use2GisMap } from './2GisMapProvider';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Crosshair } from 'lucide-react';

interface MapLocationPickerProps {
  onLocationSelect: (coordinates: [number, number], address: string) => void;
  defaultCenter?: [number, number];
  placeholder?: string;
  selectedLocation?: [number, number];
}

const MapLocationPicker2Gis = ({ 
  onLocationSelect, 
  defaultCenter = [41.2995, 69.2401],
  placeholder = "Выберите точку на карте",
  selectedLocation
}: MapLocationPickerProps) => {
  const { isLoaded, mapgl } = use2GisMap();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>('');

  useEffect(() => {
    if (!isLoaded || !mapgl || !mapRef.current) return;

    const mapInstance = new mapgl.Map(mapRef.current, {
      center: selectedLocation ? [selectedLocation[1], selectedLocation[0]] : [defaultCenter[1], defaultCenter[0]],
      zoom: selectedLocation ? 15 : 12,
      key: 'e50140a7-ffa3-493f-86d6-e25b5d1bfb17'
    });

    if (selectedLocation) {
      const newMarker = new mapgl.Marker(mapInstance, {
        coordinates: [selectedLocation[1], selectedLocation[0]],
        draggable: true
      });

      newMarker.on('dragend', () => {
        const coords = newMarker.getCoordinates();
        handleLocationSelect([coords[1], coords[0]]);
      });

      setMarker(newMarker);
    }

    mapInstance.on('click', (e: any) => {
      const coords = e.lngLat;
      handleLocationSelect([coords.lat, coords.lng]);
    });

    setMap(mapInstance);

    return () => {
      if (mapInstance) {
        mapInstance.destroy();
      }
    };
  }, [isLoaded, mapgl, selectedLocation]);

  const handleLocationSelect = async (coords: [number, number]) => {
    try {
      // Простое определение адреса для демонстрации
      const address = `Координаты: ${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`;
      
      setSelectedAddress(address);

      if (marker) {
        marker.setCoordinates([coords[1], coords[0]]);
      } else if (map && mapgl) {
        const newMarker = new mapgl.Marker(map, {
          coordinates: [coords[1], coords[0]],
          draggable: true
        });

        newMarker.on('dragend', () => {
          const newCoords = newMarker.getCoordinates();
          handleLocationSelect([newCoords[1], newCoords[0]]);
        });

        setMarker(newMarker);
      }

      onLocationSelect(coords, address);
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
            map.setCenter([coords[1], coords[0]]);
            map.setZoom(15);
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
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <div className="text-gray-600 font-medium">Загрузка карты 2GIS...</div>
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

export default MapLocationPicker2Gis;
