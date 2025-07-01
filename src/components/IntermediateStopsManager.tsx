
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, X, ChevronLeft, Check } from 'lucide-react';

interface StopLocation {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number];
  selected: boolean;
}

interface IntermediateStopsManagerProps {
  title: string;
  availableStops: StopLocation[];
  selectedStops: StopLocation[];
  onStopsChange: (stops: StopLocation[]) => void;
  onBack?: () => void;
  onContinue?: () => void;
}

const IntermediateStopsManager: React.FC<IntermediateStopsManagerProps> = ({
  title,
  availableStops,
  selectedStops,
  onStopsChange,
  onBack,
  onContinue
}) => {
  const [stops, setStops] = useState<StopLocation[]>(
    availableStops.map(stop => ({
      ...stop,
      selected: selectedStops.some(selected => selected.id === stop.id)
    }))
  );

  const toggleStop = (stopId: string) => {
    const updatedStops = stops.map(stop => 
      stop.id === stopId ? { ...stop, selected: !stop.selected } : stop
    );
    setStops(updatedStops);
    
    const selectedStopsList = updatedStops.filter(stop => stop.selected);
    onStopsChange(selectedStopsList);
  };

  const selectedCount = stops.filter(stop => stop.selected).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 z-10">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            {selectedCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Выбрано остановок: {selectedCount}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Добавьте остановки для привлечения большего количества пассажиров
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Пассажиры смогут сесть или выйти в этих точках
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stops List */}
        <div className="space-y-2">
          {stops.map((stop) => (
            <Card
              key={stop.id}
              className={`cursor-pointer transition-all duration-200 ${
                stop.selected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleStop(stop.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      stop.selected 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {stop.selected && <Check className="h-4 w-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {stop.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {stop.description}
                      </div>
                    </div>
                  </div>
                  
                  {stop.selected && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Выбрано
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Custom Stop */}
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-left h-auto p-0"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-full">
                  <Plus className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Добавить город</div>
                  <div className="text-sm text-gray-500">Добавить собственную остановку</div>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Continue Button */}
      {onContinue && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <Button
            onClick={onContinue}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl"
          >
            <Check className="h-5 w-5 mr-2" />
            Продолжить {selectedCount > 0 && `(${selectedCount})`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default IntermediateStopsManager;
