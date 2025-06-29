
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { MapPin, Plus, X, ChevronLeft, Navigation } from 'lucide-react';
import UzbekistanCitySelector from './UzbekistanCitySelector';
import { usePopularStops, PopularStop } from '@/hooks/usePopularStops';

interface IntermediateStop {
  city: string;
  address?: string;
  coordinates?: [number, number];
}

interface IntermediateStopsSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onStopsSelect: (stops: IntermediateStop[]) => void;
  selectedStops: IntermediateStop[];
  title?: string;
}

const IntermediateStopsSelector = ({
  isOpen,
  onClose,
  onStopsSelect,
  selectedStops,
  title = "Промежуточные остановки"
}: IntermediateStopsSelectorProps) => {
  const [stops, setStops] = useState<IntermediateStop[]>(selectedStops);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showPopularStops, setShowPopularStops] = useState<string | null>(null);
  const [popularStops, setPopularStops] = useState<PopularStop[]>([]);
  
  const { getPopularStopsForCity } = usePopularStops();

  const handleAddStop = () => {
    setEditingIndex(stops.length);
    setShowCitySelector(true);
  };

  const handleEditStop = (index: number) => {
    setEditingIndex(index);
    setShowCitySelector(true);
  };

  const handleCitySelect = async (city: string) => {
    const newStops = [...stops];
    const newStop: IntermediateStop = { city };
    
    if (editingIndex !== null) {
      if (editingIndex === stops.length) {
        newStops.push(newStop);
      } else {
        newStops[editingIndex] = newStop;
      }
    }
    
    setStops(newStops);
    setShowCitySelector(false);
    setEditingIndex(null);
    
    // Загружаем популярные остановки для выбранного города
    try {
      const popular = await getPopularStopsForCity(city);
      if (popular.length > 0) {
        setPopularStops(popular);
        setShowPopularStops(city);
      }
    } catch (error) {
      console.error('Ошибка загрузки популярных остановок:', error);
    }
  };

  const handlePopularStopSelect = (stop: PopularStop) => {
    const newStops = [...stops];
    const stopIndex = newStops.findIndex(s => s.city === stop.city_name);
    
    if (stopIndex !== -1) {
      newStops[stopIndex] = {
        city: stop.city_name,
        address: stop.address,
        coordinates: [stop.latitude, stop.longitude]
      };
      setStops(newStops);
    }
    
    setShowPopularStops(null);
    setPopularStops([]);
  };

  const handleRemoveStop = (index: number) => {
    const newStops = stops.filter((_, i) => i !== index);
    setStops(newStops);
  };

  const handleConfirm = () => {
    onStopsSelect(stops);
    onClose();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transport_hub':
        return '🚌';
      case 'shopping':
        return '🛍️';
      case 'landmark':
        return '🏛️';
      default:
        return '📍';
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-auto bg-white rounded-t-3xl">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <Button 
                onClick={handleConfirm} 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Готово
              </Button>
            </div>

            {/* Current Stops */}
            <div className="space-y-3">
              {stops.map((stop, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{stop.city}</div>
                      {stop.address && (
                        <div className="text-sm text-gray-500 truncate">{stop.address}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditStop(index)}
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      Изменить
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveStop(index)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Add Stop Button */}
              <Button
                onClick={handleAddStop}
                variant="ghost"
                className="w-full p-4 h-auto border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-2xl text-gray-600 hover:text-blue-600"
              >
                <Plus className="h-5 w-5 mr-2" />
                Добавить остановку
              </Button>
            </div>

            {stops.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                <div className="text-sm text-blue-700">
                  💡 Промежуточные остановки помогут найти больше попутчиков
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* City Selector */}
      <UzbekistanCitySelector
        isOpen={showCitySelector}
        onClose={() => {
          setShowCitySelector(false);
          setEditingIndex(null);
        }}
        onCitySelect={handleCitySelect}
        title="Выберите город остановки"
        currentCity=""
      />

      {/* Popular Stops Selector */}
      {showPopularStops && (
        <Sheet open={true} onOpenChange={() => setShowPopularStops(null)}>
          <SheetContent side="bottom" className="h-auto bg-white rounded-t-3xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowPopularStops(null)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h3 className="text-lg font-semibold text-gray-900">
                  Популярные места в {showPopularStops}
                </h3>
                <div />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {popularStops.map((stop) => (
                  <Button
                    key={stop.id}
                    variant="ghost"
                    onClick={() => handlePopularStopSelect(stop)}
                    className="w-full justify-start p-4 h-auto bg-white border border-gray-200 hover:bg-gray-50 rounded-2xl"
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="text-xl">
                        {getCategoryIcon(stop.category)}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900">{stop.stop_name}</div>
                        <div className="text-sm text-gray-500">{stop.address}</div>
                      </div>
                      <div className="text-gray-400">›</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

export default IntermediateStopsSelector;
