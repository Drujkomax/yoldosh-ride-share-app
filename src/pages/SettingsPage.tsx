import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, User, Phone, Palette, Globe, Bell, LogOut, History, Star } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';
import AnimatedInput from '@/components/AnimatedInput';
import PhotoUpload from '@/components/PhotoUpload';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useUser();
  const { theme, language, setTheme, setLanguage, t } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [photo, setPhoto] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(true);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSaveProfile = () => {
    alert(t('profile_updated'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-lg border-b border-white/20 dark:border-slate-700/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="rounded-xl hover:bg-yoldosh-primary/10 p-3 hover:scale-105 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              {t('back')}
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {t('settings')}
            </h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Profile Photo */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center">
              <User className="h-5 w-5 mr-3 text-yoldosh-primary" />
              Фото профиля
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoUpload
              value={photo}
              onChange={setPhoto}
              placeholder="Загрузите фото профиля"
            />
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200">{t('personal_data')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="w-full">
              <AnimatedInput
                id="name"
                label="Имя и фамилия"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<User className="h-4 w-4" />}
                className="w-full"
              />
            </div>
            <div className="w-full">
              <AnimatedInput
                id="phone"
                label="Номер телефона"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                icon={<Phone className="h-4 w-4" />}
                className="w-full"
              />
            </div>
            <Button 
              onClick={handleSaveProfile}
              className="w-full bg-gradient-primary hover:scale-105 transition-all duration-300 rounded-xl"
            >
              {t('save_changes')}
            </Button>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200">{t('app_settings')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-700 dark:to-purple-800 rounded-2xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <Palette className="h-5 w-5 text-yoldosh-primary" />
                <span className="font-medium text-slate-800 dark:text-slate-200">{t('dark_theme')}</span>
              </div>
              <Switch 
                checked={theme === 'dark'} 
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} 
              />
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                <Globe className="h-4 w-4 mr-2 text-yoldosh-primary" />
                {t('app_language')}
              </label>
              <Select value={language} onValueChange={(value: 'ru' | 'uz' | 'en') => setLanguage(value)}>
                <SelectTrigger className="h-12 rounded-xl border-2 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm hover:scale-105 transition-all duration-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg">
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="uz">O'zbekcha</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-blue-800 rounded-2xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-yoldosh-primary" />
                <span className="font-medium text-slate-800 dark:text-slate-200">{t('notifications')}</span>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Button
            onClick={() => navigate('/ride-history')}
            variant="outline"
            className="w-full h-14 rounded-2xl border-2 border-yoldosh-accent text-yoldosh-accent hover:bg-yoldosh-accent/10 hover:scale-105 transition-all duration-300"
          >
            <History className="h-5 w-5 mr-3" />
            {t('ride_history')}
          </Button>
          
          <Button
            onClick={() => navigate('/my-reviews')}
            variant="outline"
            className="w-full h-14 rounded-2xl border-2 border-yoldosh-secondary text-yoldosh-secondary hover:bg-yoldosh-secondary/10 hover:scale-105 transition-all duration-300"
          >
            <Star className="h-5 w-5 mr-3" />
            {t('my_reviews')}
          </Button>
          
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full h-14 rounded-2xl border-2 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-105 transition-all duration-300"
          >
            <LogOut className="h-5 w-5 mr-3" />
            {t('logout')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
