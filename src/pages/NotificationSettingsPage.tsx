import React from 'react';
import { SettingsLayout } from '@/components/ui/settings-layout';
import { Card } from '@/components/ui/card';
import { NotificationToggle } from '@/components/ui/notification-toggle';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useProfile } from '@/hooks/useProfile';
import { ChevronRight, Bell, Mail, MessageSquare, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export const NotificationSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { preferences, isLoading, updatePreferences } = useNotificationPreferences();
  const { profile } = useProfile();

  if (isLoading) {
    return (
      <SettingsLayout title="Уведомления">
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </Card>
          ))}
        </div>
      </SettingsLayout>
    );
  }

  if (!preferences) {
    return (
      <SettingsLayout title="Уведомления">
        <div className="p-4">
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Не удалось загрузить настройки уведомлений</p>
          </Card>
        </div>
      </SettingsLayout>
    );
  }

  // Синхронизация маркетинговых уведомлений между профилем и настройками уведомлений
  const handleMarketingToggle = async (enabled: boolean) => {
    try {
      // Обновляем настройки уведомлений
      const success = await updatePreferences({ marketing_enabled: enabled });
      
      if (success && profile) {
        // Синхронизация уже происходит в updatePreferences
      }
    } catch (error) {
      console.error('Ошибка при обновлении маркетинговых настроек:', error);
      toast.error('Ошибка при сохранении настроек');
    }
  };

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled && 'Notification' in window) {
      // Запрашиваем разрешение на push-уведомления
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Разрешение на уведомления отклонено');
        return;
      }
    }
    
    await updatePreferences({ push_enabled: enabled });
  };

  const handleEmailToggle = async (enabled: boolean) => {
    if (enabled && !profile?.email) {
      toast.error('Для email-уведомлений необходимо указать email в профиле');
      return;
    }
    
    await updatePreferences({ email_enabled: enabled });
  };

  const handleSmsToggle = async (enabled: boolean) => {
    if (enabled && !profile?.phone) {
      toast.error('Для SMS-уведомлений необходимо указать номер телефона в профиле');
      return;
    }
    
    await updatePreferences({ sms_enabled: enabled });
  };

  // Используем маркетинговые настройки из профиля (приоритет) или из настроек уведомлений
  const marketingEnabled = profile?.marketing_consent ?? preferences.marketing_enabled;

  const notificationCategories = [
    {
      icon: Bell,
      title: 'Push-уведомления',
      description: 'Мгновенные уведомления о сообщениях и поездках',
      enabled: preferences.push_enabled,
      path: '/settings/notifications/push',
      onToggle: handlePushToggle,
    },
    {
      icon: Mail,
      title: 'Email уведомления',
      description: 'Дублирование уведомлений на почту',
      enabled: preferences.email_enabled,
      path: '/settings/notifications/email',
      onToggle: handleEmailToggle,
      disabled: !profile?.email,
    },
    {
      icon: MessageSquare,
      title: 'SMS уведомления',
      description: 'Дублирование уведомлений по SMS',
      enabled: preferences.sms_enabled,
      path: '/settings/notifications/sms',
      onToggle: handleSmsToggle,
      disabled: !profile?.phone,
    },
    {
      icon: Phone,
      title: 'Звонки',
      description: 'Телефонные звонки',
      enabled: preferences.calls_enabled,
      path: '/settings/notifications/calls',
      onToggle: (value: boolean) => updatePreferences({ calls_enabled: value }),
    },
  ];

  return (
    <SettingsLayout title="Уведомления">
      <div className="p-3 space-y-3">
        {/* Global Marketing Toggle */}
        <Card>
          <NotificationToggle
            label="Маркетинговые уведомления"
            description="Получать уведомления о скидках и новостях"
            value={marketingEnabled}
            onChange={handleMarketingToggle}
          />
        </Card>

        {/* Notification Categories */}
        <div className="space-y-2">
          {notificationCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.path} className="overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <NotificationToggle
                      label={category.title}
                      description={category.description}
                      value={category.enabled}
                      onChange={category.onToggle}
                      disabled={category.disabled}
                    />
                  </div>
                  <button
                    onClick={() => navigate(category.path)}
                    className="flex items-center gap-2 px-3 py-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </SettingsLayout>
  );
};