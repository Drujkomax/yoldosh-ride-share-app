
import React, { useEffect, useRef, useState } from 'react';
import { useYandexMap } from './YandexMapProvider';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Route } from 'lucide-react';

interface RouteVisualizerProps {
  startPoint: [number, number];
  endPoint: [number, number];
  startAddress: string;
  endAddress: string;
  onRouteCalculated?: (routeData: any) => void;
}

const RouteVisualizer = ({ 
  startPoint, 
  endPoint, 
  startAddress, 
  endAddress,
  onRouteCalculated 
}: RouteVisualizerProps) => {
  const { isLoaded, ymaps } = useYandexMap();
  const mapRef = useRef<HTMLDivElement>(null);
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (!isLoaded || !ymaps || !mapRef.current) return;

    const calculateRoute = async () => {
      setIsCalculating(true);
      
      try {
        const map = new ymaps.Map(mapRef.current, {
          center: startPoint,
          zoom: 10,
          controls: ['zoomControl', 'fullscreenControl']
        });

        // Создаем маршрут
        const multiRoute = new ymaps.multiRouter.MultiRoute({
          referencePoints: [startPoint, endPoint],
          params: {
            routingMode: 'auto'
          }
        }, {
          boundsAutoApply: true,
          routeActiveStrokeWidth: 6,
          routeActiveStrokeColor: '#3b82f6'
        });

        map.geoObjects.add(multiRoute);

        // Добавляем маркеры начала и конца
        const startPlacemark = new ymaps.Placemark(startPoint, {
          hintContent: startAddress,
          balloonContent: `Начало: ${startAddress}`
        }, {
          preset: 'islands#greenDotIcon'
        });

        const endPlacemark = new ymaps.Placemark(endPoint, {
          hintContent: endAddress,
          balloonContent: `Конец: ${endAddress}`
        }, {
          preset: 'islands#redDotIcon'
        });

        map.geoObjects.add(startPlacemark);
        map.geoObjects.add(endPlacemark);

        // Получаем информацию о маршруте
        multiRoute.model.events.add('requestsuccess', () => {
          const activeRoute = multiRoute.getActiveRoute();
          if (activeRoute) {
            const distance = activeRoute.properties.get('distance');
            const duration = activeRoute.properties.get('duration');
            const routeData = {
              distance: distance.text,
              duration: duration.text,
              coordinates: activeRoute.geometry.getCoordinates()
            };
            
            setRouteInfo(routeData);
            onRouteCalculated?.(routeData);
          }
          setIsCalculating(false);
        });

        multiRoute.model.events.add('requestfail', () => {
          console.error('Failed to calculate route');
          setIsCalculating(false);
        });

      } catch (error) {
        console.error('Error calculating route:', error);
        setIsCalculating(false);
      }
    };

    calculateRoute();
  }, [isLoaded, ymaps, startPoint, endPoint]);

  if (!isLoaded) {
    return (
      <div className="w-full h-80 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Загрузка карты...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Информация о маршруте */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <Route className="h-5 w-5 mr-2 text-blue-600" />
            Маршрут поездки
          </h3>
          {isCalculating && (
            <Badge variant="secondary">Расчет маршрута...</Badge>
          )}
        </div>

        <div className="space-y-3">
          {/* Начальная точка */}
          <div className="flex items-start space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0" />
            <div>
              <div className="font-medium text-gray-700">Откуда</div>
              <div className="text-sm text-gray-600">{startAddress}</div>
            </div>
          </div>

          {/* Конечная точка */}
          <div className="flex items-start space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0" />
            <div>
              <div className="font-medium text-gray-700">Куда</div>
              <div className="text-sm text-gray-600">{endAddress}</div>
            </div>
          </div>

          {/* Информация о маршруте */}
          {routeInfo && (
            <div className="flex items-center space-x-4 pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{routeInfo.distance}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{routeInfo.duration}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Карта */}
      <div 
        ref={mapRef} 
        className="w-full h-80 rounded-lg border border-gray-200"
        style={{ minHeight: '320px' }}
      />
    </div>
  );
};

export default RouteVisualizer;
