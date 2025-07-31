import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface WheelPickerProps {
  items: (string | number)[];
  selectedValue: string | number;
  onValueChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
}

export const WheelPicker = ({ 
  items, 
  selectedValue, 
  onValueChange, 
  placeholder,
  className 
}: WheelPickerProps) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const itemHeight = 48; // 3rem height per item
  const paddingItems = 2; // количество элементов padding сверху и снизу

  const scrollToItem = (index: number) => {
    if (containerRef.current) {
      const scrollTop = index * itemHeight;
      containerRef.current.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    // Очистить предыдущий таймаут
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    setIsScrolling(true);
    
    // Установить новый таймаут для snap-to-center
    scrollTimeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return;
      
      const scrollTop = containerRef.current.scrollTop;
      // ИСПРАВЛЕНИЕ: учитываем padding при расчете индекса
      const rawIndex = (scrollTop + itemHeight / 2) / itemHeight;
      const index = Math.round(rawIndex);
      const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
      
      // Плавно центрировать выбранный элемент
      const targetScrollTop = clampedIndex * itemHeight;
      
      // Проверяем, нужно ли корректировать позицию
      if (Math.abs(scrollTop - targetScrollTop) > 5) {
        containerRef.current.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
      
      // Обновить выбранное значение только если оно изменилось
      if (items[clampedIndex] && items[clampedIndex] !== selectedValue) {
        onValueChange(items[clampedIndex]);
      }
      
      setIsScrolling(false);
    }, 150); // Увеличил задержку для более стабильной работы
  }, [items, selectedValue, onValueChange, itemHeight]);

  useEffect(() => {
    const selectedIndex = items.indexOf(selectedValue);
    if (selectedIndex !== -1 && containerRef.current && !isScrolling) {
      const targetScrollTop = selectedIndex * itemHeight;
      containerRef.current.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
    }
  }, [selectedValue, items, itemHeight, isScrolling]);

  // Очистка таймаута при размонтировании
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleItemClick = (item: string | number, index: number) => {
    if (containerRef.current) {
      setIsScrolling(true);
      const targetScrollTop = index * itemHeight;
      containerRef.current.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
      onValueChange(item);
      
      // Сбросить флаг скроллинга после анимации
      setTimeout(() => setIsScrolling(false), 300);
    }
  };

  return (
    <div className={cn("relative h-48 overflow-hidden", className)}>
      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
      
      {/* Selection indicator - точно по центру */}
      <div 
        className="absolute left-0 right-0 h-12 border-t-2 border-b-2 border-teal-300 bg-teal-50/50 z-10 pointer-events-none" 
        style={{ 
          top: `calc(50% - 24px)` // Используем фиксированное значение вместо переменной
        }} 
      />
      
      {/* Scrollable container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll scrollbar-hide"
        onScroll={handleScroll}
        style={{
          paddingTop: `${itemHeight * paddingItems}px`,
          paddingBottom: `${itemHeight * paddingItems}px`,
          scrollSnapType: 'y mandatory'
        }}
      >
        {items.map((item, index) => {
          const isSelected = item === selectedValue;
          return (
            <div
              key={`${item}-${index}`} // Более уникальный key
              className={cn(
                "flex items-center justify-center text-lg font-medium cursor-pointer transition-all duration-200",
                "hover:bg-teal-50",
                isSelected ? "text-teal-600 font-semibold" : "text-gray-700"
              )}
              style={{ 
                height: `${itemHeight}px`,
                scrollSnapAlign: 'center'
              }}
              onClick={() => handleItemClick(item, index)}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};