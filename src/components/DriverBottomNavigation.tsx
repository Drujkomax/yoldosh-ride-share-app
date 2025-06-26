
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Search, MessageCircle, User, Home } from 'lucide-react';

const DriverBottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      path: '/driver-home',
      icon: Home,
      label: 'Главная',
      color: 'purple',
      onClick: () => navigate('/driver-home')
    },
    {
      path: '/create-ride',
      icon: Plus,
      label: 'Создать',
      color: 'blue',
      onClick: () => navigate('/create-ride')
    },
    {
      path: '/search-requests',
      icon: Search,
      label: 'Заявки',
      color: 'green',
      onClick: () => navigate('/search-requests')
    },
    {
      path: '/chats',
      icon: MessageCircle,
      label: 'Чаты',
      color: 'orange',
      onClick: () => navigate('/chats')
    },
    {
      path: '/profile',
      icon: User,
      label: 'Профиль',
      color: 'slate',
      onClick: () => navigate('/profile')
    }
  ];

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
              onClick={item.onClick}
              variant="ghost"
              className={`flex-1 flex flex-col items-center py-3 px-1 rounded-xl transition-all duration-300 hover:scale-105 ${
                getActiveStyles(item.color, isActiveItem)
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 transition-all duration-300 ${
                isActiveItem ? 'animate-pulse' : ''
              }`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default DriverBottomNavigation;
