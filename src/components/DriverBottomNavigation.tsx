
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Plus, Car, MessageCircle, User } from 'lucide-react';

const DriverBottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      icon: Search,
      label: 'Поиск',
      path: '/driver-search-rides',
      isActive: location.pathname === '/driver-search-rides'
    },
    {
      icon: Plus,
      label: 'Опубликовать',
      path: '/ride-creation-flow',
      isActive: location.pathname === '/ride-creation-flow'
    },
    {
      icon: Car,
      label: 'Мои поездки',
      path: '/driver-home',
      isActive: location.pathname === '/driver-home'
    },
    {
      icon: MessageCircle,
      label: 'Чаты',
      path: '/driver-chats',
      isActive: location.pathname === '/driver-chats'
    },
    {
      icon: User,
      label: 'Профиль',
      path: '/profile',
      isActive: location.pathname === '/profile'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center h-16 w-full rounded-none ${
                item.isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default DriverBottomNavigation;
