
import React, { useEffect, useRef, useState } from 'react';
import { useYandexMap } from './YandexMapProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Route, Navigation, ArrowRight, ChevronLeft } from 'lucide-react';

interface RouteOption {
  distance: string;
  duration: string;
  description: string;
  isRecommended: boolean;
  route: any;
}

interface RouteVisualizerProps {
  startPoint: [number, number];
  endPoint: [number, number];
  startAddress: string;
  endAddress: string;
  onRouteCalculated?: (routeData: any) => void;
  onRouteSelected?: (routeOption: RouteOption) => void;
}

const RouteVisualizer = ({ 
  startPoint, 
  endPoint, 
  startAddress, 
  endAddress,
  onRouteCalculated,
  onRouteSelected 
}: RouteVisualizerProps) => {
  const { isLoaded, ymaps } = useYandexMap();
  const mapRef = useRef<HTMLDivElement>(null);
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [multiRoute, setMultiRoute] = useState<any>(null);

  useEffect(() => {
    if (!isLoaded || !ymaps || !mapRef.current) return;

    const calculateRoute = async () => {
      setIsCalculating(true);
      
      try {
        const mapInstance = new ymaps.Map(mapRef.current, {
          center: startPoint,
          zoom: 10,
          controls: ['zoomControl', 'fullscreenControl']
        });

        const multiRouteInstance = new ymaps.multiRouter.MultiRoute({
          referencePoints: [startPoint, endPoint],
          params: {
            routingMode: 'auto',
            avoidTrafficJams: false
          }
        }, {
          boundsAutoApply: true,
          routeActiveStrokeWidth: 6,
          routeActiveStrokeColor: '#2563eb',
          routeStrokeStyle: 'solid',
          wayPointDraggable: false,
          wayPointIconLayout: 'default#image'
        });

        mapInstance.geoObjects.add(multiRouteInstance);

        const startPlacemark = new ymaps.Placemark(startPoint, {
          hintContent: startAddress,
          balloonContent: `Начало: ${startAddress}`
        }, {
          preset: 'islands#greenCircleDotIcon',
          iconColor: '#10b981'
        });

        const endPlacemark = new ymaps.Placemark(endPoint, {
          hintContent: endAddress,
          balloonContent: `Конец: ${endAddress}`
        }, {
          preset: 'islands#redCircleDotIcon',
          iconColor: '#ef4444'
        });

        mapInstance.geoObjects.add(startPlacemark);
        mapInstance.geoObjects.add(endPlacemark);

        multiRouteInstance.model.events.add('requestsuccess', () => {
          const routes = multiRouteInstance.getRoutes();
          const options: RouteOption[] = [];

          for (let i = 0; i < Math.min(routes.getLength(), 3); i++) {
            const route = routes.get(i);
            const distance = route.properties.get('distance');
            const duration = route.properties.get('duration');
            
            options.push({
              distance: distance.text,
              duration: duration.text,
              description: i === 0 ? 'М40' : i === 1 ? 'М1 и М6' : 'Альтернативный маршрут',
              isRecommended: i === 0,
              route: route
            });
          }

          setRouteOptions(options);
          
          if (options.length > 0) {
            const selectedRoute = options[0];
            onRouteCalculated?.({
              distance: selectedRoute.distance,
              duration: selectedRoute.duration,
              coordinates: selectedRoute.route.geometry.getCoordinates(),
              distanceValue: selectedRoute.route.properties.get('distance').value,
              durationValue: selectedRoute.route.properties.get('duration').value
            });
          }
          
          setIsCalculating(false);
        });

        multiRouteInstance.model.events.add('requestfail', () => {
          console.error('Failed to calculate route');
          setIsCalculating(false);
        });

        setMap(mapInstance);
        setMultiRoute(multiRouteInstance);

      } catch (error) {
        console.error('Error calculating route:', error);
        setIsCalculating(false);
      }
    };

    calculateRoute();

    return () => {
      if (map) {
        map.destroy();
      }
    };
  }, [isLoaded, ymaps, startPoint, endPoint]);

  const handleRouteSelect = (index: number) => {
    setSelectedRouteIndex(index);
    if (multiRoute) {
      multiRoute.setActiveRoute(index);
    }
    if (routeOptions[index]) {
      onRouteSelected?.(routeOptions[index]);
    }
  };

  if (!isLoaded) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <div className="text-gray-600 font-medium">Загрузка карты...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col animate-fade-in">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center">
        <Button variant="ghost" size="sm" className="mr-3">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">Что такое ваш маршрут?</h1>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div 
          ref={mapRef} 
          className="w-full h-full"
        />
        
        {isCalculating && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="text-center animate-fade-in">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto mb-2"></div>
              <div className="text-gray-600 font-medium">Расчет маршрута...</div>
            </div>
          </div>
        )}
      </div>

      {/* Route Options */}
      {routeOptions.length > 0 && (
        <div className="bg-white border-t border-gray-200 p-4 space-y-3 animate-slide-in-up">
          {routeOptions.map((option, index) => (
            <div
              key={index}
              onClick={() => handleRouteSelect(index)}
              className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer animate-scale-in ${
                selectedRouteIndex === index 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedRouteIndex === index 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {selectedRouteIndex === index && (
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">{option.duration}</span>
                      <span className="text-gray-500">-</span>
                      <span className="text-gray-600">{option.description}</span>
                      {option.isRecommended && (
                        <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-1">
                          Рекомендуется
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{option.distance}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <Button 
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 mt-4"
          >
            Продолжить
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default RouteVisualizer;
