import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationToggle } from '@/components/ui/notification-toggle';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useProfile } from '@/hooks/useProfile';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

export const NotificationButtons: React.FC = () => {
  const { preferences, isLoading, updatePreferences } = useNotificationPreferences();
  const { profile, updateProfile } = useProfile();

  // Синхронизация маркетинговых уведомлений между профилем и настройками уведомлений
  const handleMarketingToggle = async (enabled: boolean) => {
    try {
      // Обновляем настройки уведомлений
      const success = await updatePreferences({ marketing_enabled: enabled });
      
      if (success && profile) {
        // Синхронизируем с профилем
        await updateProfile({ marketing_consent: enabled });
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Уведомления</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Уведомления</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Не удалось загрузить настройки уведомлений</p>
        </CardContent>
      </Card>
    );
  }

  // Используем маркетинговые настройки из профиля (приоритет) или из настроек уведомлений
  const marketingEnabled = profile?.marketing_consent ?? preferences.marketing_enabled;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Уведомления
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <NotificationToggle
          label="Маркетинговые уведомления"
          description="Получать уведомления о скидках и новостях"
          value={marketingEnabled}
          onChange={handleMarketingToggle}
        />
        
        <NotificationToggle
          label="Push-уведомления"
          description="Мгновенные уведомления о сообщениях и поездках"
          value={preferences.push_enabled}
          onChange={handlePushToggle}
        />
        
        <NotificationToggle
          label="Email-уведомления"
          description="Дублирование уведомлений на почту"
          value={preferences.email_enabled}
          onChange={handleEmailToggle}
          disabled={!profile?.email}
        />
        
        <NotificationToggle
          label="SMS-уведомления"
          description="Дублирование уведомлений по SMS"
          value={preferences.sms_enabled}
          onChange={handleSmsToggle}
          disabled={!profile?.phone}
        />
      </CardContent>
    </Card>
  );
};