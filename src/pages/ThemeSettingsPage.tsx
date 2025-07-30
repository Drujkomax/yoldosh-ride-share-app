import React from 'react';
import { SettingsLayout } from '@/components/ui/settings-layout';
import { Card } from '@/components/ui/card';
import { useThemePreferences } from '@/hooks/useThemePreferences';
import { Skeleton } from '@/components/ui/skeleton';
import { Sun, Moon } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const ThemeSettingsPage: React.FC = () => {
  const { preferences, isLoading, currentTheme, updateThemeMode } = useThemePreferences();
  const [searchParams] = useSearchParams();
  
  // Check if we should return to account tab
  const backTo = searchParams.get('backTo');
  const backUrl = backTo === 'account' ? '/profile?tab=account' : '/profile';

  if (isLoading) {
    return (
      <SettingsLayout title="Темная тема" backTo={backUrl}>
        <div className="p-4 space-y-4">
          <Card className="p-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </Card>
        </div>
      </SettingsLayout>
    );
  }

  const themeOptions = [
    {
      id: 'light' as const,
      title: 'Выключена',
      description: 'Светлая тема',
      icon: Sun,
    },
    {
      id: 'dark' as const,
      title: 'Включена',
      description: 'Темная тема',
      icon: Moon,
    },
  ];

  const currentMode = preferences?.theme_mode === 'dark' ? 'dark' : 'light';

  return (
    <SettingsLayout title="Темная тема" backTo={backUrl}>
      <div className="p-4">
        {/* Theme illustration */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 via-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center transition-all duration-300">
                {currentMode === 'dark' ? (
                  <Moon className="h-8 w-8 text-slate-300" />
                ) : (
                  <Sun className="h-8 w-8 text-yellow-300" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Theme options */}
        <div className="space-y-3">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = currentMode === option.id;

            return (
              <Card
                key={option.id}
                className={`transition-all duration-200 ${
                  isSelected 
                    ? 'border-teal-600 bg-teal-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <button
                  onClick={() => updateThemeMode(option.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected 
                          ? 'border-teal-600 bg-teal-600' 
                          : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <div className={`font-medium ${
                          isSelected ? 'text-teal-700' : 'text-gray-900'
                        }`}>
                          {option.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {option.description}
                        </div>
                      </div>
                    </div>
                    <Icon className={`h-5 w-5 ${
                      isSelected ? 'text-teal-600' : 'text-gray-400'
                    }`} />
                  </div>
                </button>
              </Card>
            );
          })}
        </div>

        {/* Current status */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Текущая тема: <span className="font-medium text-gray-700">
              {currentTheme === 'dark' ? 'Темная' : 'Светлая'}
            </span>
          </p>
        </div>
      </div>
    </SettingsLayout>
  );
};