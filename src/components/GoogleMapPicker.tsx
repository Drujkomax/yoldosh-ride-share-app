
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Navigation, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface GoogleMapPickerProps {
  onLocationSelect: (coordinates: [number, number], address: string) => void;
  initialLocation?: [number, number];
  initialAddress?: string;
  title?: string;
  placeholder?: string;
}

const GoogleMapPicker: React.FC<GoogleMapPickerProps> = ({
  onLocationSelect,
  initialLocation,
  initialAddress,
  title = "Выберите точку на карте",
  placeholder = "Поиск адреса..."
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [currentLocation, setCurrentLocation] = useState<[number, number]>(
    initialLocation || [41.2995, 69.2401] // Ташкент по умолчанию
  );
  const [currentAddress, setCurrentAddress] = useState(initialAddress || '');
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Проверяем доступность Google Maps API
  const checkGoogleMapsAvailability = useCallback(() => {
    return typeof window !== 'undefined' && window.google && window.google.maps;
  }, []);

  // Инициализация карты
  const initMap = useCallback(() => {
    if (!mapRef.current || !checkGoogleMapsAvailability()) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: currentLocation[0], lng: currentLocation[1] },
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      gestureHandling: 'cooperative',
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    mapInstanceRef.current = map;

    // Обработчик движения карты
    map.addListener('center_changed', () => {
      const center = map.getCenter();
      if (center) {
        const newLocation: [number, number] = [center.lat(), center.lng()];
        setCurrentLocation(newLocation);
        
        // Обратное геокодирование для получения адреса
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: center }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            setCurrentAddress(results[0].formatted_address);
          }
        });
      }
    });

    // Инициализация автокомплита
    if (searchInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'uz' }
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const location = place.geometry.location;
          const newLocation: [number, number] = [location.lat(), location.lng()];
          setCurrentLocation(newLocation);
          setCurrentAddress(place.formatted_address || '');
          map.setCenter(location);
          map.setZoom(16);
        }
      });

      autocompleteRef.current = autocomplete;
    }
  }, [currentLocation, checkGoogleMapsAvailability]);

  // Загрузка Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (checkGoogleMapsAvailability()) {
        initMap();
        return;
      }

      // Получаем API ключ из localStorage
      const apiKey = localStorage.getItem('google_maps_api_key');
      if (!apiKey) {
        console.warn('Google Maps API key not found in localStorage');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=ru`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        toast.error('Не удалось загрузить Google Maps API');
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, [initMap, checkGoogleMapsAvailability]);

  // Получение текущего местоположения
  const getCurrentLocation = () => {
    setIsLoading(true);
    
    if (!navigator.geolocation) {
      toast.error('Геолокация не поддерживается вашим браузером');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: [number, number] = [
          position.coords.latitude,
          position.coords.longitude
        ];
        setCurrentLocation(newLocation);
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({
            lat: newLocation[0],
            lng: newLocation[1]
          });
          mapInstanceRef.current.setZoom(16);
        }
        
        setIsLoading(false);
      },
      (error) => {
        console.error('Ошибка получения местоположения:', error);
        toast.error('Не удалось получить ваше местоположение');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleConfirmLocation = () => {
    onLocationSelect(currentLocation, currentAddress);
  };

  // Показываем компонент для ввода API ключа, если его нет
  if (!localStorage.getItem('google_maps_api_key')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Требуется настройка</h2>
              <p className="text-gray-600">Для работы с картами необходим Google Maps API ключ</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                Пожалуйста, добавьте GoogleMapsApiKeyInput компонент на эту страницу для настройки API ключа.
              </p>
            </div>

            <Button
              onClick={() => window.location.reload()}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl"
            >
              Обновить страницу
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-blue-100">Перетащите карту для выбора точного местоположения</p>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder={placeholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 h-12 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500"
              />
            </div>
          </div>

          {/* Map Container */}
          <div className="relative h-96">
            <div ref={mapRef} className="w-full h-full" />
            
            {/* Central Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                <MapPin className="h-8 w-8 text-red-500 drop-shadow-lg" />
                <div className="absolute -top-1 -left-1 w-10 h-10 border-2 border-red-500 rounded-full animate-ping opacity-75" />
              </div>
            </div>

            {/* Current Location Button */}
            <Button
              onClick={getCurrentLocation}
              disabled={isLoading}
              className="absolute top-4 right-4 h-12 w-12 rounded-full bg-white border-2 border-gray-300 hover:border-blue-500 text-gray-600 hover:text-blue-600 shadow-lg"
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Navigation className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Selected Address */}
          <div className="p-6 border-t border-slate-200">
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Выбранное место:</h3>
              <p className="text-gray-600 text-sm">{currentAddress || 'Определение адреса...'}</p>
              <p className="text-xs text-gray-500 mt-1">
                Координаты: {currentLocation[0].toFixed(6)}, {currentLocation[1].toFixed(6)}
              </p>
            </div>

            <Button
              onClick={handleConfirmLocation}
              disabled={!currentAddress}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <MapPin className="h-5 w-5 mr-2" />
              Подтвердить местоположение
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleMapPicker;
