
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';

interface CitySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  label?: string;
}

const uzbekistanCities = [
  'Ташкент',
  'Самарканд', 
  'Бухара',
  'Андижан',
  'Наманган',
  'Фергана',
  'Карши',
  'Термез',
  'Ургенч',
  'Нукус',
  'Джизак',
  'Навои',
  'Гулистан',
  'Коканд',
  'Маргилан',
  'Чирчик',
  'Ангрен',
  'Олмалык',
  'Шахрисабз',
  'Турткуль'
];

const CitySelect = ({ value, onValueChange, placeholder, label }: CitySelectProps) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}
      <div className="relative">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="h-12 rounded-xl border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-slate-300 focus:border-yoldosh-primary focus:ring-4 focus:ring-yoldosh-primary/20 pl-10">
            <div className="absolute left-3 top-3 text-slate-400">
              <MapPin className="h-4 w-4" />
            </div>
            <SelectValue placeholder={placeholder} className="ml-6" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-0 shadow-2xl bg-white/95 backdrop-blur-lg max-h-60">
            {uzbekistanCities.map((city) => (
              <SelectItem 
                key={city} 
                value={city}
                className="rounded-lg mx-2 my-1 hover:bg-yoldosh-primary/10 focus:bg-yoldosh-primary/10 transition-all duration-200"
              >
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CitySelect;
