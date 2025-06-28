
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, X, Search } from 'lucide-react';

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: string) => void;
  title: string;
  currentLocation: string;
}

const uzbekistanCities = [
  'Ташкент', 'Самарканд', 'Бухара', 'Андижан', 'Наманган', 'Фергана',
  'Карши', 'Термез', 'Ургенч', 'Нукус', 'Джизак', 'Навои', 'Гулистан',
  'Коканд', 'Маргилан', 'Чирчик', 'Ангрен', 'Олмалык', 'Шахрисабз', 'Турткуль'
];

const LocationSelector = ({ isOpen, onClose, onLocationSelect, title, currentLocation }: LocationSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const filteredCities = uzbekistanCities.filter(city =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLocationDetect = () => {
    setIsDetectingLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTimeout(() => {
            onLocationSelect('Ташкент');
            setIsDetectingLocation(false);
            onClose();
          }, 2000);
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

  const handleLocationSelect = (location: string) => {
    onLocationSelect(location);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-full bg-gray-900 text-white border-0 rounded-t-3xl">
        <SheetHeader className="text-left mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold text-white">{title}</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-gray-800">
              <X className="h-6 w-6" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Лесная улица или кафе &quot;Овсянка&quot;"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-2xl text-lg focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Location Detection Button */}
          <Button
            onClick={handleLocationDetect}
            disabled={isDetectingLocation}
            className="w-full h-14 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl text-lg font-medium flex items-center justify-between px-6"
          >
            <div className="flex items-center">
              <Navigation className="h-6 w-6 mr-4" />
              Использовать мое местоположение
            </div>
            <div className="text-gray-400">›</div>
          </Button>

          {/* Cities List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredCities.map((city) => (
              <Button
                key={city}
                variant="ghost"
                onClick={() => handleLocationSelect(city)}
                className={`w-full h-14 justify-start text-left hover:bg-gray-800 rounded-2xl px-6 ${
                  city === currentLocation ? 'bg-gray-800 text-blue-400' : 'text-white'
                }`}
              >
                <MapPin className="h-5 w-5 mr-4 text-gray-400" />
                <span className="text-lg">{city}</span>
              </Button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LocationSelector;
