
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, FileText, MessageCircle } from 'lucide-react';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-lg">
      <div className="flex justify-around items-center py-2 px-4">
        <Button
          onClick={() => navigate('/search-rides')}
          variant="ghost"
          className={`flex-1 flex flex-col items-center py-3 px-2 rounded-xl transition-all duration-300 hover:scale-110 ${
            isActive('/search-rides') 
              ? 'bg-yoldosh-primary/10 text-yoldosh-primary scale-110' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Search className={`h-5 w-5 mb-1 transition-all duration-300 ${isActive('/search-rides') ? 'animate-pulse' : ''}`} />
          <span className="text-xs font-medium">Поиск</span>
        </Button>
        
        <Button
          onClick={() => navigate('/create-request')}
          variant="ghost"
          className={`flex-1 flex flex-col items-center py-3 px-2 rounded-xl transition-all duration-300 hover:scale-110 ${
            isActive('/create-request') 
              ? 'bg-yoldosh-secondary/10 text-yoldosh-secondary scale-110' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className={`h-5 w-5 mb-1 transition-all duration-300 ${isActive('/create-request') ? 'animate-pulse' : ''}`} />
          <span className="text-xs font-medium">Заявка</span>
        </Button>
        
        <Button
          onClick={() => navigate('/chats')}
          variant="ghost"
          className={`flex-1 flex flex-col items-center py-3 px-2 rounded-xl transition-all duration-300 hover:scale-110 ${
            isActive('/chats') 
              ? 'bg-blue-500/10 text-blue-600 scale-110' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageCircle className={`h-5 w-5 mb-1 transition-all duration-300 ${isActive('/chats') ? 'animate-pulse' : ''}`} />
          <span className="text-xs font-medium">Чаты</span>
        </Button>
      </div>
    </div>
  );
};

export default BottomNavigation;
