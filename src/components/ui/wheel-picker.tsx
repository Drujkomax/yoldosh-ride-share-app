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
    
    // Установить новый таймаут для snap-to-center
    scrollTimeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return;
      
      const scrollTop = containerRef.current.scrollTop;
      // Правильный расчет индекса без смещения
      const index = Math.round(scrollTop / itemHeight);
      const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
      
      // Плавно центрировать выбранный элемент
      const targetScrollTop = clampedIndex * itemHeight;
      containerRef.current.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
      
      // Обновить выбранное значение
      if (items[clampedIndex] !== selectedValue) {
        onValueChange(items[clampedIndex]);
      }
    }, 100); // Уменьшил задержку
  }, [items, selectedValue, onValueChange, itemHeight]);

  useEffect(() => {
    const selectedIndex = items.indexOf(selectedValue);
    if (selectedIndex !== -1 && containerRef.current) {
      setIsScrolling(true);
      const targetScrollTop = selectedIndex * itemHeight;
      containerRef.current.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
      setTimeout(() => setIsScrolling(false), 300);
    }
  }, [selectedValue, items, itemHeight]);

  // Очистка таймаута при размонтировании
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("relative h-48 overflow-hidden", className)}>
      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
      
      {/* Selection indicator - точно по центру */}
      <div 
        className="absolute left-0 right-0 h-12 border-t-2 border-b-2 border-teal-300 bg-teal-50/50 z-10 pointer-events-none" 
        style={{ 
          top: `calc(50% - ${itemHeight / 2}px)` 
        }} 
      />
      
      {/* Scrollable container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll scrollbar-hide"
        onScroll={handleScroll}
        style={{
          paddingTop: `${itemHeight * 2}px`,
          paddingBottom: `${itemHeight * 2}px`,
          scrollSnapType: 'y mandatory'
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="h-12 flex items-center justify-center text-lg font-medium cursor-pointer hover:bg-teal-50 transition-colors"
            style={{ 
              scrollSnapAlign: 'center',
              lineHeight: `${itemHeight}px`
            }}
            onClick={() => {
              const targetScrollTop = index * itemHeight;
              containerRef.current?.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
              });
              onValueChange(item);
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};