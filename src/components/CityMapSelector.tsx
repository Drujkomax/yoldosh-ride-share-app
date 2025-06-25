
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, X, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CityMapSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onCitySelect: (city: string) => void;
  title: string;
  currentCity: string;
}

const uzbekistanCities = [
  'Ташкент', 'Самарканд', 'Бухара', 'Андижан', 'Наманган', 'Фергана',
  'Карши', 'Термез', 'Ургенч', 'Нукус', 'Джизак', 'Навои', 'Гулистан',
  'Коканд', 'Маргилан', 'Чирчик', 'Ангрен', 'Олмалык', 'Шахрисабз', 'Турткуль'
];

const CityMapSelector = ({ isOpen, onClose, onCitySelect, title, currentCity }: CityMapSelectorProps) => {
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
          // Mock location detection - in real app, use reverse geocoding
          setTimeout(() => {
            onCitySelect('Ташкент'); // Mock detected city
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

  const handleCitySelect = (city: string) => {
    onCitySelect(city);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full h-full max-w-none max-h-none p-0 rounded-none">
        <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-purple-50">
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-white shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="p-6 bg-white shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Поиск города..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-xl border-2"
              />
            </div>
          </div>

          {/* Location Detection Button */}
          <div className="p-6">
            <Button
              onClick={handleLocationDetect}
              disabled={isDetectingLocation}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl"
            >
              <Navigation className="h-5 w-5 mr-2" />
              {isDetectingLocation ? 'Определяем местоположение...' : 'Определить мое местоположение'}
            </Button>
          </div>

          {/* Map Placeholder */}
          <div className="flex-1 m-6 bg-slate-200 rounded-2xl flex items-center justify-center">
            <div className="text-center text-slate-500">
              <MapPin className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Карта</p>
              <p className="text-sm">Интеграция с картами</p>
            </div>
          </div>

          {/* Cities List */}
          <div className="p-6 bg-white max-h-80 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              {filteredCities.map((city) => (
                <Card
                  key={city}
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                    city === currentCity ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => handleCitySelect(city)}
                >
                  <CardContent className="p-4 text-center">
                    <span className="font-medium text-slate-900">{city}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CityMapSelector;
