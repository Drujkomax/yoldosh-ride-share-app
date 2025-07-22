import React from 'react';
import { Switch } from '@/components/ui/switch';

interface NotificationToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export const NotificationToggle: React.FC<NotificationToggleProps> = ({
  label,
  description,
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-between py-2.5 px-3">
      <div className="flex-1 pr-3">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
        )}
      </div>
      <Switch
        checked={value}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
};