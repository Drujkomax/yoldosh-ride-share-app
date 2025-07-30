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
    <MobilePageLayout className="bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <h1 className="text-xl font-bold text-teal-900">Входящие сообщения</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Поиск по сообщениям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
        </div>

        {/* Chats List */}
        <div className="space-y-4">
          <div className="flex items-center mb-6">
            <MessageCircle className="h-6 w-6 mr-3 text-teal-600" />
            <h2 className="text-lg font-bold text-teal-900">
              Активные чаты ({filteredChats.length})
            </h2>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-16">
              <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                {searchQuery ? 'Чаты по запросу не найдены' : 'У вас пока нет сообщений'}
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
                    className="p-4 rounded-2xl bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                  >
                    <div className="flex items-start space-x-4">
                       <UserAvatar 
                         size="md"
                         userId={otherParticipant?.id}
                         name={otherParticipant?.name}
                       />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-gray-900 truncate">
                              {otherParticipant?.name || 'Пользователь'}
                            </h3>
                            {otherParticipant?.is_verified && (
                              <Shield className="h-4 w-4 text-teal-600" />
                            )}
                            {chat.unreadCount > 0 && (
                              <Badge className="bg-red-500 text-white text-xs">
                                {chat.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatTime(chat.last_message_at)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {lastMessagePreview}
                        </p>
                        
                        {chat.ride && (
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">
                                {chat.ride.from_city} → {chat.ride.to_city}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {new Date(chat.ride.departure_date).toLocaleDateString('ru-RU')}
                              </span>
                            </div>
                          </div>
                        )}
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
