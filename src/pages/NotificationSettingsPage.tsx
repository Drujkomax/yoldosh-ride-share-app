import React from 'react';
import { SettingsLayout } from '@/components/ui/settings-layout';
import { Card } from '@/components/ui/card';
import { NotificationToggle } from '@/components/ui/notification-toggle';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { ChevronRight, Bell, Mail, MessageSquare, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export const NotificationSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { preferences, isLoading, updatePreferences } = useNotificationPreferences();

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

  const notificationCategories = [
    {
      icon: Bell,
      title: 'Push-уведомления',
      description: 'Уведомления на экране устройства',
      enabled: preferences.push_enabled,
      path: '/settings/notifications/push',
      onToggle: (value: boolean) => updatePreferences({ push_enabled: value }),
    },
    {
      icon: Mail,
      title: 'Email уведомления',
      description: 'Уведомления на электронную почту',
      enabled: preferences.email_enabled,
      path: '/settings/notifications/email',
      onToggle: (value: boolean) => updatePreferences({ email_enabled: value }),
    },
    {
      icon: MessageSquare,
      title: 'SMS уведомления',
      description: 'Текстовые сообщения',
      enabled: preferences.sms_enabled,
      path: '/settings/notifications/sms',
      onToggle: (value: boolean) => updatePreferences({ sms_enabled: value }),
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
      <div className="p-4 space-y-4">
        {/* Global Marketing Toggle */}
        <Card>
          <NotificationToggle
            label="Маркетинговые уведомления"
            description="Получать предложения и акции"
            value={preferences.marketing_enabled}
            onChange={(value) => updatePreferences({ marketing_enabled: value })}
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
                    />
                  </div>
                  <button
                    onClick={() => navigate(category.path)}
                    className="flex items-center gap-2 px-4 py-4 text-muted-foreground hover:text-foreground transition-colors"
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