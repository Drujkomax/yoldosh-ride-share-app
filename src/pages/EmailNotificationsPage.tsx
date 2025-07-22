import React from 'react';
import { SettingsLayout } from '@/components/ui/settings-layout';
import { Card } from '@/components/ui/card';
import { NotificationToggle } from '@/components/ui/notification-toggle';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { Skeleton } from '@/components/ui/skeleton';

export const EmailNotificationsPage: React.FC = () => {
  const { preferences, isLoading, updatePreferences } = useNotificationPreferences();

  if (isLoading) {
    return (
      <SettingsLayout title="Email уведомления" backTo="/settings/notifications">
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
      <SettingsLayout title="Email уведомления" backTo="/settings/notifications">
        <div className="p-4">
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Не удалось загрузить настройки</p>
          </Card>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout title="Email уведомления" backTo="/settings/notifications">
      <div className="p-4 space-y-4">
        {/* Main Toggle */}
        <Card>
          <NotificationToggle
            label="Email уведомления"
            description="Включить или отключить все email уведомления"
            value={preferences.email_enabled}
            onChange={(value) => updatePreferences({ email_enabled: value })}
          />
        </Card>

        {/* Specific Email Notifications */}
        <div className="space-y-2">
          <Card>
            <NotificationToggle
              label="Обновления поездок"
              description="Новые заявки, подтверждения, изменения"
              value={preferences.email_ride_updates}
              onChange={(value) => updatePreferences({ email_ride_updates: value })}
              disabled={!preferences.email_enabled}
            />
          </Card>

          <Card>
            <NotificationToggle
              label="Сообщения"
              description="Новые сообщения в чатах"
              value={preferences.email_messages}
              onChange={(value) => updatePreferences({ email_messages: value })}
              disabled={!preferences.email_enabled}
            />
          </Card>

          <Card>
            <NotificationToggle
              label="Еженедельная сводка"
              description="Статистика и рекомендации"
              value={preferences.email_weekly_summary}
              onChange={(value) => updatePreferences({ email_weekly_summary: value })}
              disabled={!preferences.email_enabled}
            />
          </Card>

          <Card>
            <NotificationToggle
              label="Промо-акции"
              description="Специальные предложения и скидки"
              value={preferences.email_promotions}
              onChange={(value) => updatePreferences({ email_promotions: value })}
              disabled={!preferences.email_enabled}
            />
          </Card>
        </div>

        {!preferences.email_enabled && (
          <Card className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              Включите email уведомления, чтобы настроить отдельные типы уведомлений
            </p>
          </Card>
        )}
      </div>
    </SettingsLayout>
  );
};