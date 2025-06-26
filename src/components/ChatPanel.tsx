
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User, Car, MapPin, Clock, ChevronDown, Bell } from 'lucide-react';
import { useChats } from '@/hooks/useChats';
import { useUser } from '@/contexts/UserContext';

const ChatPanel = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { chats, isLoading } = useChats();
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTime = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}м назад`;
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)}ч назад`;
    } else {
      return messageDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
  };

  const getOtherParticipant = (chat: any) => {
    if (!user) return null;
    return chat.participant1_id === user.id ? chat.participant2 : chat.participant1;
  };

  const getChatType = (chat: any) => {
    if (!user) return 'passenger';
    const otherParticipant = getOtherParticipant(chat);
    // Определяем тип на основе роли текущего пользователя
    return user.role === 'driver' ? 'passenger' : 'driver';
  };

  const handleChatClick = (chat: any) => {
    const otherParticipant = getOtherParticipant(chat);
    if (!otherParticipant) return;

    const params = new URLSearchParams({
      chatId: chat.id,
      type: getChatType(chat),
      rideId: chat.ride_id || '',
      from: chat.ride?.from_city || '',
      to: chat.ride?.to_city || '',
      date: chat.ride?.departure_date ? new Date(chat.ride.departure_date).toLocaleDateString('ru-RU') : '',
      time: chat.ride?.departure_time || ''
    });
    
    navigate(`/chat/${otherParticipant.name}?${params.toString()}`);
    setIsExpanded(false); // Скрываем панель при переходе к чату
  };

  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  if (isLoading) {
    return null;
  }

  if (!isExpanded) {
    return (
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          onClick={() => setIsExpanded(true)}
          className="h-14 w-14 rounded-full bg-yoldosh-blue hover:bg-blue-700 shadow-lg relative"
        >
          <MessageCircle className="h-6 w-6" />
          {totalUnread > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse">
              {totalUnread > 99 ? '99+' : totalUnread}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 w-80">
      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Сообщения
              {totalUnread > 0 && (
                <Badge className="ml-2 bg-red-500 text-white animate-pulse">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(false)}
              className="h-8 w-8"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Нет активных чатов</p>
                <p className="text-xs mt-1">Начните общение с водителями или пассажирами</p>
              </div>
            ) : (
              chats.map((chat) => {
                const otherParticipant = getOtherParticipant(chat);
                const chatType = getChatType(chat);
                
                if (!otherParticipant) return null;

                return (
                  <div
                    key={chat.id}
                    onClick={() => handleChatClick(chat)}
                    className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors relative"
                  >
                    {chat.unreadCount > 0 && (
                      <div className="absolute top-2 right-2">
                        <Bell className="h-4 w-4 text-red-500 animate-bounce" />
                      </div>
                    )}
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yoldosh-blue to-blue-600 rounded-full flex items-center justify-center">
                        {chatType === 'driver' ? (
                          <Car className="h-5 w-5 text-white" />
                        ) : (
                          <User className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{otherParticipant.name}</span>
                            <Badge 
                              variant={chatType === 'driver' ? 'default' : 'secondary'} 
                              className="text-xs"
                            >
                              {chatType === 'driver' ? 'Водитель' : 'Пассажир'}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">
                              {formatTime(chat.last_message_at)}
                            </span>
                            {chat.unreadCount > 0 && (
                              <Badge className="h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {chat.ride && (
                          <div className="flex items-center space-x-2 text-xs text-gray-600 mb-1">
                            <MapPin className="h-3 w-3" />
                            <span>{chat.ride.from_city} → {chat.ride.to_city}</span>
                            <Clock className="h-3 w-3 ml-2" />
                            <span>{new Date(chat.ride.departure_date).toLocaleDateString('ru-RU')}</span>
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-600 truncate">
                          {chat.lastMessage?.content || 'Нет сообщений'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {chats.length > 0 && (
            <div className="p-3 border-t bg-gray-50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/chats')}
                className="w-full text-yoldosh-blue hover:text-blue-700"
              >
                Посмотреть все чаты
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatPanel;
