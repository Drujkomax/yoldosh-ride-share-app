
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, FileText, MessageCircle, User } from 'lucide-react';
import { useChats } from '@/hooks/useChats';
import { useUser } from '@/contexts/UserContext';
import { useUserCars } from '@/hooks/useUserCars';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { chats } = useChats();
  const { canDrive } = useUserCars();

  // Подсчитываем общее количество непрочитанных сообщений
  const totalUnreadCount = chats.reduce((total, chat) => total + (chat.unreadCount || 0), 0);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Определяем навигационные элементы в зависимости от возможности водить
  const getNavItems = () => {
    const baseItems = [
      {
        path: '/search-rides',
        icon: Search,
        label: 'Поиск',
        color: 'blue'
      }
    ];

    // Если пользователь может водить, показываем кнопку "Опубликовать"
    if (canDrive) {
      baseItems.push({
        path: '/create-driver-ride',
        icon: Plus,
        label: 'Опубликовать',
        color: 'green'
      });
    }

    // Остальные элементы
    baseItems.push(
      {
        path: '/my-trips',
        icon: FileText,
        label: 'Мои поездки',
        color: 'purple'
      },
      {
        path: '/chats',
        icon: MessageCircle,
        label: 'Чаты',
        color: 'orange',
        badge: totalUnreadCount > 0 ? totalUnreadCount : undefined
      },
      {
        path: '/profile',
        icon: User,
        label: 'Профиль',
        color: 'slate'
      }
    );

    return baseItems;
  };

  const navItems = getNavItems();

  const getActiveStyles = (color: string, isActiveItem: boolean) => {
    if (!isActiveItem) return 'text-slate-600 hover:bg-slate-100';
    
    const colorMap = {
      blue: 'bg-blue-500/10 text-blue-600 scale-110',
      green: 'bg-green-500/10 text-green-600 scale-110',
      purple: 'bg-purple-500/10 text-purple-600 scale-110',
      orange: 'bg-orange-500/10 text-orange-600 scale-110',
      slate: 'bg-slate-500/10 text-slate-600 scale-110'
    };
    
    return colorMap[color] || 'bg-blue-500/10 text-blue-600 scale-110';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-lg">
      <div className="flex justify-around items-center py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActiveItem = isActive(item.path);
          
          return (
            <Button
              key={item.path}
              onClick={() => navigate(item.path)}
              variant="ghost"
              className={`flex-1 flex flex-col items-center py-3 px-1 rounded-xl transition-all duration-300 hover:scale-105 relative ${
                getActiveStyles(item.color, isActiveItem)
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 mb-1 transition-all duration-300 ${
                  isActiveItem ? 'animate-pulse' : ''
                }`} />
                {item.badge && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0 min-w-5">
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
