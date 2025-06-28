
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, X, ChevronLeft } from 'lucide-react';

interface UzbekistanCitySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onCitySelect: (city: string) => void;
  title: string;
  currentCity?: string;
}

const uzbekistanCities = [
  // Крупные города
  'Ташкент', 'Самарканд', 'Бухара', 'Андижан', 'Наманган', 'Фергана', 'Карши', 'Термез', 'Ургенч', 'Нукус',
  'Джизак', 'Навои', 'Гулистан', 'Коканд', 'Маргилан', 'Чирчик', 'Ангрен', 'Олмалык', 'Шахрисабз',
  
  // Районные центры и города
  'Алтыарык', 'Ахангаран', 'Беруний', 'Газалкент', 'Денау', 'Зарафшан', 'Китаб', 'Кувасай', 'Кунград',
  'Мубарек', 'Нурота', 'Пайтуг', 'Риштан', 'Турткуль', 'Учкудук', 'Хазарасп', 'Янгиабад', 'Янгибазар',
  'Янгиер', 'Янгиюль', 'Бекабад', 'Галляарал', 'Гурлен', 'Кегейли', 'Манит', 'Мангит', 'Питнак',
  'Тахиаташ', 'Ходжейли', 'Амударья', 'Байсун', 'Бандихан', 'Бойсун', 'Деҳқонобод', 'Жаркурган',
  'Кизирик', 'Кумкурган', 'Музрабад', 'Сарыосие', 'Термит', 'Узун', 'Шерабад', 'Шуробод',
  
  // Села и поселки
  'Акташ', 'Амирабад', 'Багдад', 'Бахт', 'Бешарик', 'Бустон', 'Вабкент', 'Галабад', 'Гиждуван',
  'Дехканабад', 'Дустлик', 'Жонгох', 'Зомин', 'Исфара', 'Каган', 'Камбар', 'Каракуль', 'Касан',
  'Катакурган', 'Кизылтепа', 'Косон', 'Кувасой', 'Мирзаабад', 'Навбахор', 'Нарпай', 'Паркент',
  'Пастдаргом', 'Пахтаабад', 'Pop', 'Ромитан', 'Сариасия', 'Сырдарья', 'Тайлак', 'Учтепа',
  'Фариш', 'Хавас', 'Хазарасп', 'Холмирзоев', 'Чимбой', 'Шафиркан', 'Эшонгузар', 'Юкоричирчик'
];

const UzbekistanCitySelector = ({ 
  isOpen, 
  onClose, 
  onCitySelect, 
  title,
  currentCity
}: UzbekistanCitySelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState(uzbekistanCities);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = uzbekistanCities.filter(city =>
        city.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(uzbekistanCities);
    }
  }, [searchQuery]);

  const handleCitySelect = (city: string) => {
    onCitySelect(city);
    onClose();
    setSearchQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 animate-slide-in-right">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-gray-900 text-white px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            onClick={onClose}
            className="mr-3 p-2 text-white hover:bg-gray-800"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>

        {/* Search */}
        <div className="bg-white p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Поиск города или села..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Cities List */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          {currentCity && (
            <div className="bg-white p-4 border-b">
              <div className="text-sm text-gray-500 mb-2">Текущий выбор:</div>
              <Button
                variant="ghost"
                onClick={() => handleCitySelect(currentCity)}
                className="w-full justify-start text-left p-4 h-auto bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100"
              >
                <MapPin className="h-5 w-5 mr-3 text-blue-500" />
                <span className="text-blue-600 font-medium">{currentCity}</span>
              </Button>
            </div>
          )}
          
          <div className="p-4 space-y-1">
            {filteredCities.length > 0 ? (
              filteredCities.map((city, index) => (
                <Button
                  key={city}
                  variant="ghost"
                  onClick={() => handleCitySelect(city)}
                  className="w-full justify-start text-left p-4 h-auto bg-white rounded-xl hover:bg-gray-50 border border-gray-100 animate-fade-in"
                  style={{ animationDelay: `${index * 20}ms` }}
                >
                  <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="text-gray-700">{city}</span>
                </Button>
              ))
            ) : (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <div className="text-gray-500 text-lg mb-2">Город не найден</div>
                <div className="text-gray-400 text-sm">Попробуйте изменить запрос поиска</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UzbekistanCitySelector;