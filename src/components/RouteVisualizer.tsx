
import React, { useEffect, useRef, useState } from 'react';
import { useYandexMap } from './YandexMapProvider';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Route, Navigation } from 'lucide-react';

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
          controls: ['zoomControl', 'fullscreenControl', 'typeSelector']
        });

        const multiRoute = new ymaps.multiRouter.MultiRoute({
          referencePoints: [startPoint, endPoint],
          params: {
            routingMode: 'auto'
          }
        }, {
          boundsAutoApply: true,
          routeActiveStrokeWidth: 8,
          routeActiveStrokeColor: '#3b82f6',
          routeStrokeStyle: 'solid'
        });

        map.geoObjects.add(multiRoute);

        const startPlacemark = new ymaps.Placemark(startPoint, {
          hintContent: startAddress,
          balloonContent: `Начало: ${startAddress}`
        }, {
          preset: 'islands#greenCircleDotIconWithCaption',
          iconColor: '#10b981'
        });

        const endPlacemark = new ymaps.Placemark(endPoint, {
          hintContent: endAddress,
          balloonContent: `Конец: ${endAddress}`
        }, {
          preset: 'islands#redCircleDotIconWithCaption',
          iconColor: '#ef4444'
        });

        map.geoObjects.add(startPlacemark);
        map.geoObjects.add(endPlacemark);

        multiRoute.model.events.add('requestsuccess', () => {
          const activeRoute = multiRoute.getActiveRoute();
          if (activeRoute) {
            const distance = activeRoute.properties.get('distance');
            const duration = activeRoute.properties.get('duration');
            const routeData = {
              distance: distance.text,
              duration: duration.text,
              coordinates: activeRoute.geometry.getCoordinates(),
              distanceValue: distance.value,
              durationValue: duration.value
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
      <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-inner">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <div className="text-gray-600 font-medium">Загрузка карты...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Информация о маршруте */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-xl text-gray-800 flex items-center">
            <Route className="h-6 w-6 mr-3 text-blue-600" />
            Маршрут поездки
          </h3>
          {isCalculating && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-3 py-1">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
              Расчет маршрута...
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          {/* Начальная точка */}
          <div className="flex items-start space-x-4 p-4 bg-white/80 rounded-xl shadow-sm">
            <div className="w-4 h-4 bg-green-500 rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
            <div className="flex-1">
              <div className="font-semibold text-gray-800 mb-1">Откуда</div>
              <div className="text-gray-600">{startAddress}</div>
            </div>
          </div>

          {/* Линия маршрута */}
          <div className="flex justify-center">
            <div className="w-px h-8 bg-gradient-to-b from-green-500 to-red-500"></div>
          </div>

          {/* Конечная точка */}
          <div className="flex items-start space-x-4 p-4 bg-white/80 rounded-xl shadow-sm">
            <div className="w-4 h-4 bg-red-500 rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
            <div className="flex-1">
              <div className="font-semibold text-gray-800 mb-1">Куда</div>
              <div className="text-gray-600">{endAddress}</div>
            </div>
          </div>

          {/* Информация о маршруте */}
          {routeInfo && (
            <div className="flex items-center justify-center space-x-6 pt-4 border-t border-blue-200">
              <div className="flex items-center space-x-2 bg-white/80 rounded-lg px-4 py-2 shadow-sm">
                <Navigation className="h-5 w-5 text-blue-500" />
                <span className="font-semibold text-gray-700">{routeInfo.distance}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 rounded-lg px-4 py-2 shadow-sm">
                <Clock className="h-5 w-5 text-purple-500" />
                <span className="font-semibold text-gray-700">{routeInfo.duration}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Карта */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-96 rounded-2xl border-2 border-gray-200 shadow-xl overflow-hidden"
          style={{ minHeight: '384px' }}
        />
        
        <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span>Маршрут построен автоматически</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteVisualizer;
