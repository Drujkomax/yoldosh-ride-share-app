import React from 'react';
import { SettingsLayout } from '@/components/ui/settings-layout';
import { Card } from '@/components/ui/card';
import { useThemePreferences } from '@/hooks/useThemePreferences';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, Sun, Moon, Monitor } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const ThemeSettingsPage: React.FC = () => {
  const { preferences, isLoading, currentTheme, updateThemeMode } = useThemePreferences();
  const [searchParams] = useSearchParams();
  
  // Check if we should return to account tab
  const backTo = searchParams.get('backTo');
  const backUrl = backTo === 'account' ? '/profile?tab=account' : '/profile';

  if (isLoading) {
    return (
      <SettingsLayout title="Тема приложения" backTo={backUrl}>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </Card>
          ))}
        </div>
      </SettingsLayout>
    );
  }

  const themeOptions = [
    {
      id: 'light' as const,
      title: 'Светлая тема',
      description: 'Всегда светлая тема',
      icon: Sun,
    },
    {
      id: 'dark' as const,
      title: 'Темная тема',
      description: 'Всегда темная тема',
      icon: Moon,
    },
    {
      id: 'system' as const,
      title: 'Системная',
      description: 'Следовать настройкам устройства',
      icon: Monitor,
    },
  ];

  const currentMode = preferences?.theme_mode || 'system';

  return (
    <SettingsLayout title="Тема приложения" backTo={backUrl}>
      <div className="p-4">
        <div className="space-y-2">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = currentMode === option.id;

            return (
              <Card
                key={option.id}
                className={`transition-all duration-200 ${
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-border/80'
                }`}
              >
                <button
                  onClick={() => updateThemeMode(option.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className={`font-medium ${
                          isSelected ? 'text-primary' : 'text-foreground'
                        }`}>
                          {option.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </button>
              </Card>
            );
          })}
        </div>

        {/* Preview */}
        <Card className="mt-6 p-4">
          <div className="text-sm font-medium text-foreground mb-2">
            Предварительный просмотр
          </div>
          <div className="text-xs text-muted-foreground mb-3">
            Текущая тема: {currentTheme === 'light' ? 'Светлая' : 'Темная'}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-card border border-border">
              <div className="text-xs font-medium text-card-foreground">Карточка</div>
              <div className="text-xs text-muted-foreground mt-1">Пример текста</div>
            </div>
            <div className="p-3 rounded-lg bg-primary text-primary-foreground">
              <div className="text-xs font-medium">Кнопка</div>
              <div className="text-xs opacity-90 mt-1">Активная</div>
            </div>
          </div>
        </Card>
      </div>
    </SettingsLayout>
  );
};