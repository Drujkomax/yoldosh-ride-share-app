
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
  disabled?: boolean;
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
  className,
  disabled = false
}: AnimatedInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      <div className="relative">
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
            placeholder={placeholder || ""}
            maxLength={maxLength}
            disabled={disabled}
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
