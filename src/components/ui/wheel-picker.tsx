import React, { useEffect, useRef, useState } from 'react';
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

  const handleScroll = () => {
    if (!containerRef.current || isScrolling) return;
    
    const scrollTop = containerRef.current.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    
    if (items[clampedIndex] !== selectedValue) {
      onValueChange(items[clampedIndex]);
      // Точно центрируем выбранный элемент
      setTimeout(() => {
        setIsScrolling(true);
        scrollToItem(clampedIndex);
        setTimeout(() => setIsScrolling(false), 200);
      }, 100);
    }
  };

  useEffect(() => {
    const selectedIndex = items.indexOf(selectedValue);
    if (selectedIndex !== -1) {
      setIsScrolling(true);
      scrollToItem(selectedIndex);
      setTimeout(() => setIsScrolling(false), 300);
    }
  }, [selectedValue, items]);

  return (
    <div className={cn("relative h-48 overflow-hidden", className)}>
      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
      
      {/* Selection indicator */}
      <div className="absolute top-1/2 left-0 right-0 h-12 border-t-2 border-b-2 border-teal-300 bg-teal-50/50 z-10 pointer-events-none transform -translate-y-1/2" />
      
      {/* Scrollable container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll scrollbar-hide"
        onScroll={handleScroll}
        style={{
          paddingTop: `${itemHeight * 2}px`,
          paddingBottom: `${itemHeight * 2}px`
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="h-12 flex items-center justify-center text-lg font-medium cursor-pointer hover:bg-teal-50 transition-colors"
            onClick={() => {
              onValueChange(item);
              setIsScrolling(true);
              scrollToItem(index);
              setTimeout(() => setIsScrolling(false), 200);
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};