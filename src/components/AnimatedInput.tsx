
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AnimatedInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  maxLength?: number;
  icon?: React.ReactNode;
  className?: string;
}

const AnimatedInput = ({ 
  id, 
  label, 
  type = "text", 
  value, 
  onChange, 
  onBlur,
  placeholder, 
  maxLength, 
  icon,
  className 
}: AnimatedInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      <div className="relative">
        <Label 
          htmlFor={id} 
          className={cn(
            "absolute left-3 transition-all duration-300 pointer-events-none text-slate-500",
            isFocused || value ? 
              "-top-2.5 left-2 text-xs bg-white px-2 text-yoldosh-primary font-medium" : 
              "top-3 text-sm"
          )}
        >
          {label}
        </Label>
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-3.5 text-slate-400">
              {icon}
            </div>
          )}
          <Input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            placeholder={isFocused ? placeholder : ""}
            maxLength={maxLength}
            className={cn(
              "h-12 rounded-xl border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm",
              "focus:border-yoldosh-primary focus:ring-4 focus:ring-yoldosh-primary/20",
              "hover:border-slate-300 animate-input-focus",
              icon && "pl-10",
              isFocused && "scale-[1.02] shadow-lg",
              className
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default AnimatedInput;
