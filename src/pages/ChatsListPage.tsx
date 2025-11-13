import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, MessageCircle, Search, User, Clock, MapPin, Shield } from 'lucide-react';
import { useChats } from '@/hooks/useChats';
import BottomNavigation from '@/components/BottomNavigation';
import MobilePageLayout from '@/components/MobilePageLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { useUser } from '@/contexts/UserContext';
import UserAvatar from '@/components/UserAvatar';

const ChatsListPage = () => {
  const navigate = useNavigate();
  const { chats, isLoading } = useChats();
  const { role } = useUserRole();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat => {
    const currentUserId = user?.id;
    const otherParticipant = chat.participant1_id !== currentUserId ? chat.participant1 : chat.participant2;
    const chatName = otherParticipant?.name || 'Пользователь';
    return chatName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatTime = (dateStr: string | undefined): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid Time';
    }
  };

  const getLastMessagePreview = (message: string | null): string => {
    if (!message) return 'No messages yet';
    return message.length > 50 ? message.substring(0, 50) + '...' : message;
  };

  return (
    <MobilePageLayout className="bg-gradient-to-br from-yoldosh-brand-light via-background to-secondary">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary to-yoldosh-brand shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Сообщения</h1>
                <p className="text-xs text-white/80">{filteredChats.length} активных чатов</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Demo Button */}
        <div className="mb-4">
          <Button
            onClick={() => navigate('/chat-demo')}
            className="w-full bg-gradient-to-r from-accent to-primary hover:shadow-lg transition-all"
          >
            🎨 Открыть демо-чат для тестирования дизайна
          </Button>
        </div>

        {/* Search with modern design */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Поиск чатов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white/80 backdrop-blur-sm border-primary/20 rounded-2xl shadow-sm focus:shadow-md transition-all"
            />
          </div>
        </div>

        {/* Chats List */}
        <div className="space-y-3">
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
              <p className="mt-4 text-sm text-muted-foreground">Загрузка чатов...</p>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-3xl shadow-sm">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchQuery ? 'Чаты не найдены' : 'Нет сообщений'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Ваши чаты появятся здесь'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredChats.map((chat) => {
                const currentUserId = user?.id;
                const otherParticipant = chat.participant1_id !== currentUserId ? chat.participant1 : chat.participant2;
                const lastMessagePreview = getLastMessagePreview(chat.lastMessage?.content || null);
                
                return (
                  <div
                    key={chat.id}
                    onClick={() => navigate(`/chat/${chat.id}`)}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-primary/10 p-4 cursor-pointer hover:shadow-lg hover:border-primary/30 hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <UserAvatar
                          userId={otherParticipant?.id}
                          name={otherParticipant?.name}
                          size="lg"
                        />
                        {chat.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-gradient-to-br from-primary to-accent text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg ring-2 ring-white">
                            {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-foreground truncate text-base">
                            {otherParticipant?.name || 'Пользователь'}
                          </h3>
                          {otherParticipant?.is_verified && (
                            <div className="bg-gradient-to-br from-primary to-accent p-1 rounded-full">
                              <Shield className="h-3 w-3 text-white flex-shrink-0" />
                            </div>
                          )}
                        </div>
                        
                        {chat.ride && (
                          <div className="flex items-center gap-1.5 text-xs text-primary font-medium mb-2 bg-primary/5 px-2 py-1 rounded-lg w-fit">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">
                              {chat.ride.from_city} → {chat.ride.to_city}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-muted-foreground truncate flex-1">
                            {lastMessagePreview}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(chat.last_message_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </MobilePageLayout>
  );
};

export default ChatsListPage;
