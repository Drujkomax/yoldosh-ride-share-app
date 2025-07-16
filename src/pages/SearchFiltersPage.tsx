import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Check } from 'lucide-react';

const SearchFiltersPage = () => {
  const navigate = useNavigate();
  
  const [selectedSort, setSelectedSort] = useState('price_low');
  const [selectedTimeRanges, setSelectedTimeRanges] = useState<string[]>([]);
  const [selectedTrustLevel, setSelectedTrustLevel] = useState('');
  const [selectedComforts, setSelectedComforts] = useState<string[]>([]);

  const sortOptions = [
    { id: 'price_low', label: 'Цена: по возрастанию' },
    { id: 'price_high', label: 'Цена: по убыванию' },
    { id: 'time_early', label: 'Время: раньше' },
    { id: 'time_late', label: 'Время: позже' },
    { id: 'rating', label: 'Рейтинг водителя' },
  ];

  const timeRanges = [
    { id: 'morning', label: 'Утро (06:00 - 12:00)' },
    { id: 'afternoon', label: 'День (12:00 - 18:00)' },
    { id: 'evening', label: 'Вечер (18:00 - 00:00)' },
    { id: 'night', label: 'Ночь (00:00 - 06:00)' },
  ];

  const trustLevels = [
    { id: 'verified', label: 'Только верифицированные водители' },
    { id: 'high_rating', label: 'Рейтинг 4.5+ звезд' },
    { id: 'experienced', label: 'Опытные водители (50+ поездок)' },
  ];

  const comfortOptions = [
    { id: 'air_conditioning', label: 'Кондиционер' },
    { id: 'wifi', label: 'Wi-Fi' },
    { id: 'charging', label: 'Зарядка для телефона' },
    { id: 'music', label: 'Музыка' },
    { id: 'no_smoking', label: 'Некурящий салон' },
    { id: 'pets_allowed', label: 'Можно с животными' },
  ];

  const toggleTimeRange = (rangeId: string) => {
    setSelectedTimeRanges(prev => 
      prev.includes(rangeId) 
        ? prev.filter(id => id !== rangeId)
        : [...prev, rangeId]
    );
  };

  const toggleComfort = (comfortId: string) => {
    setSelectedComforts(prev => 
      prev.includes(comfortId) 
        ? prev.filter(id => id !== comfortId)
        : [...prev, comfortId]
    );
  };

  const clearAllFilters = () => {
    setSelectedSort('price_low');
    setSelectedTimeRanges([]);
    setSelectedTrustLevel('');
    setSelectedComforts([]);
  };

  const applyFilters = () => {
    // Here you would apply the filters and navigate back
    // For now, just navigate back
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Фильтры</h1>
          </div>
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className="text-blue-500 hover:bg-blue-50"
          >
            Очистить всё
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Сортировка */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Сортировка</h2>
            <div className="space-y-3">
              {sortOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">{option.label}</span>
                  <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                    selectedSort === option.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {selectedSort === option.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <input
                    type="radio"
                    name="sort"
                    value={option.id}
                    checked={selectedSort === option.id}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="hidden"
                  />
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Время поездки */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Время поездки</h2>
            <div className="space-y-3">
              {timeRanges.map((range) => (
                <label
                  key={range.id}
                  className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">{range.label}</span>
                  <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                    selectedTimeRanges.includes(range.id) ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {selectedTimeRanges.includes(range.id) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedTimeRanges.includes(range.id)}
                    onChange={() => toggleTimeRange(range.id)}
                    className="hidden"
                  />
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Доверие и безопасность */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Доверие и безопасность</h2>
            <div className="space-y-3">
              {trustLevels.map((level) => (
                <label
                  key={level.id}
                  className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">{level.label}</span>
                  <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                    selectedTrustLevel === level.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {selectedTrustLevel === level.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <input
                    type="radio"
                    name="trust"
                    value={level.id}
                    checked={selectedTrustLevel === level.id}
                    onChange={(e) => setSelectedTrustLevel(e.target.value)}
                    className="hidden"
                  />
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Удобства */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Удобства</h2>
            <div className="space-y-3">
              {comfortOptions.map((comfort) => (
                <label
                  key={comfort.id}
                  className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">{comfort.label}</span>
                  <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                    selectedComforts.includes(comfort.id) ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {selectedComforts.includes(comfort.id) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedComforts.includes(comfort.id)}
                    onChange={() => toggleComfort(comfort.id)}
                    className="hidden"
                  />
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <Button
          onClick={applyFilters}
          className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl"
        >
          Применить фильтры
        </Button>
      </div>
    </div>
  );
};

export default SearchFiltersPage;