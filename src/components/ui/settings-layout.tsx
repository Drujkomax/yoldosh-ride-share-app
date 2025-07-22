import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface SettingsLayoutProps {
  title: string;
  children: React.ReactNode;
  backTo?: string;
  headerAction?: React.ReactNode;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({ 
  title, 
  children, 
  backTo = '/profile',
  headerAction 
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(backTo)}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          </div>
          {headerAction}
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">
        {children}
      </div>
    </div>
  );
};