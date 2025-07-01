
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Route, Clock, MapPin, DollarSign, AlertTriangle, Check } from 'lucide-react';

interface RouteOption {
  id: string;
  summary: string;
  distance: string;
  duration: string;
  distanceValue: number; // в метрах
  durationValue: number; // в секундах
  polyline: string;
  hasTolls: boolean;
  tollInfo?: {
    currency: string;
    cost: number;
  };
}

interface RouteCalculatorProps {
  startPoint: [number, number];
  endPoint: [number, number];
  startAddress: string;
  endAddress: string;
  onRouteSelect: (route: RouteOption) => void;
}

const RouteCalculator: React.FC<RouteCalculatorProps> = ({
  startPoint,
  endPoint,
  startAddress,
  endAddress,
  onRouteSelect
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRenderersRef = useRef<google.maps.DirectionsRenderer[]>([]);
  
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Проверяем доступность Google Maps API
  const checkGoogleMapsAvailability = () => {
    return typeof window !== 'undefined' && 
           window.google && 
           window.google.maps && 
           window.google.maps.Map &&
           window.google.maps.DirectionsService;
  };

  // Ожидание загрузки Google Maps API
  const waitForGoogleMaps = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (checkGoogleMapsAvailability()) {
        resolve();
        return;
      }

      let attempts = 0;
      const maxAttempts = 50; // 10 секунд ожидания
      
      const checkInterval = setInterval(() => {
        attempts++;
        
        if (checkGoogleMapsAvailability()) {
          clearInterval(checkInterval);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          reject(new Error('Google Maps API не удалось загрузить за отведенное время'));
        }
      }, 200);
    });
  };

  // Загрузка Google Maps скрипта
  const loadGoogleMapsScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Получаем API ключ из localStorage
      const apiKey = localStorage.getItem('google_maps_api_key');
      if (!apiKey) {
        reject(new Error('Google Maps API ключ не найден в localStorage'));
        return;
      }

      // Проверяем, не загружен ли уже скрипт
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript) {
        waitForGoogleMaps().then(resolve).catch(reject);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=ru`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        waitForGoogleMaps().then(resolve).catch(reject);
      };
      
      script.onerror = () => {
        reject(new Error('Не удалось загрузить Google Maps API. Проверьте API ключ.'));
      };
      
      document.head.appendChild(script);
    });
  };

  // Инициализация карты и расчет маршрутов
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current) {
        setError('Элемент карты не найден');
        setIsLoading(false);
        return;
      }

      try {
        // Ожидаем загрузки Google Maps API
        if (!checkGoogleMapsAvailability()) {
          console.log('Загружаем Google Maps API...');
          await loadGoogleMapsScript();
        }

        console.log('Google Maps API загружен, инициализируем карту...');

        // Создаем карту
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 8,
          center: { lat: (startPoint[0] + endPoint[0]) / 2, lng: (startPoint[1] + endPoint[1]) / 2 },
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        mapInstanceRef.current = map;

        // Инициализируем сервис маршрутов
        const directionsService = new window.google.maps.DirectionsService();
        directionsServiceRef.current = directionsService;

        console.log('Запрашиваем маршруты...');

        // Запрашиваем маршруты
        const request: google.maps.DirectionsRequest = {
          origin: { lat: startPoint[0], lng: startPoint[1] },
          destination: { lat: endPoint[0], lng: endPoint[1] },
          travelMode: window.google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: true,
          avoidHighways: false,
          avoidTolls: false,
          region: 'UZ'
        };

        directionsService.route(request, (result, status) => {
          console.log('Результат запроса маршрута:', status, result);
          
          if (status === 'OK' && result && result.routes && result.routes.length > 0) {
            const routeOptions: RouteOption[] = result.routes.map((route, index) => {
              const leg = route.legs[0];
              return {
                id: `route-${index}`,
                summary: route.summary || `Маршрут ${index + 1}`,
                distance: leg.distance?.text || '',
                duration: leg.duration?.text || '',
                distanceValue: leg.distance?.value || 0,
                durationValue: leg.duration?.value || 0,
                polyline: route.overview_polyline || '',
                hasTolls: route.summary?.toLowerCase().includes('toll') || false,
                tollInfo: route.summary?.toLowerCase().includes('toll') ? {
                  currency: 'UZS',
                  cost: Math.round((leg.distance?.value || 0) * 0.1) // Примерная стоимость
                } : undefined
              };
            });

            console.log('Найдено маршрутов:', routeOptions.length);
            setRoutes(routeOptions);
            
            // Выбираем первый маршрут по умолчанию
            if (routeOptions.length > 0) {
              setSelectedRouteId(routeOptions[0].id);
              displayRoute(result, 0);
            }
          } else {
            console.error('Ошибка расчета маршрута:', status);
            setError(`Не удалось рассчитать маршрут: ${status}. Проверьте выбранные точки.`);
          }
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Ошибка инициализации карты:', error);
        setError(error instanceof Error ? error.message : 'Не удалось инициализировать карту');
        setIsLoading(false);
      }
    };

    // Отображение маршрута на карте
    const displayRoute = (result: google.maps.DirectionsResult, routeIndex: number) => {
      if (!mapInstanceRef.current) return;

      // Очищаем предыдущие рендереры
      directionsRenderersRef.current.forEach(renderer => {
        renderer.setMap(null);
      });
      directionsRenderersRef.current = [];

      // Создаем новый рендерер для выбранного маршрута
      const renderer = new window.google.maps.DirectionsRenderer({
        routeIndex,
        polylineOptions: {
          strokeColor: '#3B82F6',
          strokeWeight: 5,
          strokeOpacity: 0.8
        },
        markerOptions: {
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#3B82F6',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          }
        }
      });

      renderer.setDirections(result);
      renderer.setMap(mapInstanceRef.current);
      directionsRenderersRef.current.push(renderer);
    };

    initializeMap();

    return () => {
      // Очистка рендереров при размонтировании
      directionsRenderersRef.current.forEach(renderer => {
        renderer.setMap(null);
      });
    };
  }, [startPoint, endPoint]);

  const handleRouteSelect = (route: RouteOption) => {
    setSelectedRouteId(route.id);
    onRouteSelect(route);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} ч ${minutes} мин`;
    }
    return `${minutes} мин`;
  };

  const formatDistance = (meters: number): string => {
    const km = meters / 1000;
    return `${km.toFixed(1)} км`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Расчет маршрута</h3>
            <p className="text-gray-600">Загружаем Google Maps и ищем лучшие варианты...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl p-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Ошибка загрузки</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Перезагрузить страницу
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="max-w-6xl mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="text-2xl font-bold flex items-center">
            <Route className="h-7 w-7 mr-3" />
            Выберите маршрут
          </CardTitle>
          <div className="mt-4 space-y-2">
            <div className="flex items-center text-blue-100">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="text-sm">{startAddress}</span>
            </div>
            <div className="flex items-center text-blue-100">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="text-sm">{endAddress}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Карта */}
            <div className="h-96 lg:h-[500px]">
              <div ref={mapRef} className="w-full h-full" />
            </div>

            {/* Варианты маршрутов */}
            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Найдено маршрутов: {routes.length}
              </h3>
              
              {routes.map((route, index) => (
                <Card
                  key={route.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedRouteId === route.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleRouteSelect(route)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          {index === 0 ? 'Рекомендуемый' : `Вариант ${index + 1}`}
                        </Badge>
                        {route.hasTolls && (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            Платная дорога
                          </Badge>
                        )}
                      </div>
                      {selectedRouteId === route.id && (
                        <Check className="h-5 w-5 text-blue-500" />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {formatDuration(route.durationValue)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Route className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {formatDistance(route.distanceValue)}
                        </span>
                      </div>
                    </div>

                    {route.hasTolls && route.tollInfo && (
                      <div className="flex items-center space-x-2 text-orange-600">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm">
                          Примерная стоимость проезда: {route.tollInfo.cost} {route.tollInfo.currency}
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">{route.summary}</p>
                  </CardContent>
                </Card>
              ))}

              {selectedRouteId && (
                <Button
                  onClick={() => {
                    const selectedRoute = routes.find(r => r.id === selectedRouteId);
                    if (selectedRoute) {
                      onRouteSelect(selectedRoute);
                    }
                  }}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Выбрать этот маршрут
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RouteCalculator;
