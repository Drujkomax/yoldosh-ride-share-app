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
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const animationFrameRef = useRef<number>();
  
  const itemHeight = 48; // высота одного элемента
  const visibleItems = 3; // количество видимых элементов
  const centerIndex = Math.floor(visibleItems / 2); // индекс центрального элемента (1 для 3 элементов)

  // Дебаунс функция
  const debounce = useCallback((func: Function, wait: number) => {
    return (...args: any[]) => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => func.apply(null, args), wait);
    };
  }, []);

  const scrollToItem = useCallback((index: number, smooth = true) => {
    if (containerRef.current) {
      const scrollTop = index * itemHeight;
      containerRef.current.scrollTo({
        top: scrollTop,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }, [itemHeight]);

  const getCurrentCenterIndex = useCallback(() => {
    if (!containerRef.current) return 0;
    
    const scrollTop = containerRef.current.scrollTop;
    // Расчет индекса центрального элемента
    const rawIndex = Math.round(scrollTop / itemHeight);
    return Math.max(0, Math.min(rawIndex, items.length - 1));
  }, [itemHeight, items.length]);

  const snapToNearestItem = useCallback(() => {
    if (!containerRef.current || isDragging) return;
    
    const centerItemIndex = getCurrentCenterIndex();
    const targetScrollTop = centerItemIndex * itemHeight;
    const currentScrollTop = containerRef.current.scrollTop;
    
    // Если позиция не точная, корректируем
    if (Math.abs(currentScrollTop - targetScrollTop) > 2) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(() => {
        scrollToItem(centerItemIndex, true);
        
        // Обновляем выбранное значение
        const newValue = items[centerItemIndex];
        if (newValue !== selectedValue) {
          onValueChange(newValue);
        }
        
        setIsScrolling(false);
      });
    } else {
      // Обновляем значение без дополнительной прокрутки
      const newValue = items[centerItemIndex];
      if (newValue !== selectedValue) {
        onValueChange(newValue);
      }
      setIsScrolling(false);
    }
  }, [getCurrentCenterIndex, itemHeight, scrollToItem, items, selectedValue, onValueChange, isDragging]);

  const debouncedSnap = useCallback(
    debounce(snapToNearestItem, 100),
    [snapToNearestItem]
  );

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    setIsScrolling(true);
    debouncedSnap();
  }, [debouncedSnap]);

  // Обработчики для touch события
  const handleTouchStart = useCallback(() => {
    setIsDragging(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    // Небольшая задержка для завершения инерционного скроллинга
    setTimeout(() => {
      snapToNearestItem();
    }, 50);
  }, [snapToNearestItem]);

  // Эффект для начальной позиции
  useEffect(() => {
    const selectedIndex = items.indexOf(selectedValue);
    if (selectedIndex !== -1 && containerRef.current && !isScrolling && !isDragging) {
      scrollToItem(selectedIndex, false);
    }
  }, [selectedValue, items, scrollToItem, isScrolling, isDragging]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleItemClick = useCallback((item: string | number, index: number) => {
    setIsScrolling(true);
    scrollToItem(index, true);
    onValueChange(item);
    
    setTimeout(() => setIsScrolling(false), 300);
  }, [scrollToItem, onValueChange]);

  const getItemOpacity = (index: number) => {
    if (!containerRef.current) return 1;
    
    const scrollTop = containerRef.current.scrollTop;
    const currentCenterIndex = scrollTop / itemHeight;
    const distance = Math.abs(index - currentCenterIndex);
    
    if (distance <= 0.5) return 1; // центральный элемент
    if (distance <= 1.5) return 0.6; // соседние элементы
    return 0.3; // дальние элементы
  };

  const getItemScale = (index: number) => {
    if (!containerRef.current) return 1;
    
    const scrollTop = containerRef.current.scrollTop;
    const currentCenterIndex = scrollTop / itemHeight;
    const distance = Math.abs(index - currentCenterIndex);
    
    if (distance <= 0.5) return 1.05; // центральный элемент немного больше
    if (distance <= 1.5) return 1; // соседние элементы нормального размера
    return 0.95; // дальние элементы немного меньше
  };

  return (
    <div className={cn("relative overflow-hidden", className)} style={{ height: `${itemHeight * visibleItems}px` }}>
      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
      
      {/* Selection indicator - точно по центру */}
      <div 
        className="absolute left-0 right-0 border-t-2 border-b-2 border-teal-400 bg-teal-50/30 z-10 pointer-events-none rounded-lg" 
        style={{ 
          height: `${itemHeight}px`,
          top: `${centerIndex * itemHeight}px`
        }} 
      />
      
      {/* Scrollable container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll scrollbar-hide"
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        style={{
          scrollSnapType: 'y mandatory',
          touchAction: 'pan-y', // Улучшает работу на мобильных устройствах
          paddingTop: `${centerIndex * itemHeight}px`,
          paddingBottom: `${centerIndex * itemHeight}px`,
        }}
      >
        {items.map((item, index) => {
          const isSelected = item === selectedValue;
          const opacity = getItemOpacity(index);
          const scale = getItemScale(index);
          
          return (
            <div
              key={`${item}-${index}`}
              className={cn(
                "flex items-center justify-center text-lg font-medium cursor-pointer transition-all duration-200 select-none",
                "hover:bg-teal-50/50",
                isSelected ? "text-teal-600 font-bold" : "text-gray-700"
              )}
              style={{ 
                height: `${itemHeight}px`,
                scrollSnapAlign: 'center',
                opacity,
                transform: `scale(${scale})`,
                lineHeight: `${itemHeight}px`
              }}
              onClick={() => handleItemClick(item, index)}
            >
              {item}
            </div>
          );
        })}
      </div>
      
      {/* Debug info - можно удалить в продакшене */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 text-xs bg-black/50 text-white p-1 rounded z-20">
          Selected: {selectedValue}
        </div>
      )}
    </div>
  );
};