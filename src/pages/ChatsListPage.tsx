import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, MessageCircle, Search, User, Clock, MapPin, Shield } from 'lucide-react';
import { useChats } from '@/hooks/useChats';
import BottomNavigation from '@/components/BottomNavigation';
import MobilePageLayout from '@/components/MobilePageLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { useUser } from '@/contexts/UserContext';

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
    <MobilePageLayout className="bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-lg border-b border-white/20 dark:border-slate-700/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="hover:bg-yoldosh-primary/10 mobile-tap-highlight-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">Входящие сообщения</h1>
            <div className="flex items-center space-x-2">
              {role && (
                <Badge variant="outline" className="text-xs">
                  {role === 'driver' ? 'Водитель' : 'Пассажир'}
                </Badge>
              )}
            </div>
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
              className="pl-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-slate-200 dark:border-slate-700 mobile-tap-highlight-transparent"
            />
          </div>
        </div>

        {/* Chats List */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-800 dark:text-slate-200">
              <MessageCircle className="h-6 w-6 mr-3 text-yoldosh-primary" />
              Активные чаты ({filteredChats.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yoldosh-primary"></div>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
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
                      className="p-4 rounded-2xl bg-gradient-to-r from-white to-slate-50 dark:from-slate-700 dark:to-slate-800 border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] mobile-tap-highlight-transparent"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                {otherParticipant?.name || 'Пользователь'}
                              </h3>
                              {otherParticipant?.is_verified && (
                                <Shield className="h-4 w-4 text-yoldosh-success" />
                              )}
                              {chat.unreadCount > 0 && (
                                <Badge className="bg-red-500 text-white text-xs">
                                  {chat.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                              {formatTime(chat.last_message_at)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                            {lastMessagePreview}
                          </p>
                          
                          {chat.ride && (
                            <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
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
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </MobilePageLayout>
  );
};

export default ChatsListPage;
