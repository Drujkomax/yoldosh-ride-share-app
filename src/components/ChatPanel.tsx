
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User, Car, MapPin, Clock, X, ChevronUp, ChevronDown } from 'lucide-react';

interface Chat {
  id: string;
  name: string;
  type: 'driver' | 'passenger';
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  rideDetails: {
    from: string;
    to: string;
    date: string;
    time: string;
    rideId: string;
  };
}

const ChatPanel = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock chats data
  const chats: Chat[] = [
    {
      id: '1',
      name: 'Алишер',
      type: 'driver',
      lastMessage: 'Я уже в пути к месту встречи',
      timestamp: new Date(Date.now() - 5 * 60000),
      unreadCount: 2,
      rideDetails: {
        from: 'Ташкент',
        to: 'Самарканд',
        date: '25 декабря',
        time: '09:00',
        rideId: '1'
      }
    },
    {
      id: '2',
      name: 'Жамшид',
      type: 'passenger',
      lastMessage: 'Спасибо за поездку!',
      timestamp: new Date(Date.now() - 30 * 60000),
      unreadCount: 0,
      rideDetails: {
        from: 'Ташкент',
        to: 'Бухара',
        date: '24 декабря',
        time: '14:00',
        rideId: '2'
      }
    },
    {
      id: '3',
      name: 'Фарход',
      type: 'driver',
      lastMessage: 'Встретимся у метро',
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      unreadCount: 1,
      rideDetails: {
        from: 'Ташкент',
        to: 'Фергана',
        date: '23 декабря',
        time: '08:30',
        rideId: '3'
      }
    }
  ];

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}м назад`;
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)}ч назад`;
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
  };

  const handleChatClick = (chat: Chat) => {
    const params = new URLSearchParams({
      type: chat.type,
      rideId: chat.rideDetails.rideId,
      from: chat.rideDetails.from,
      to: chat.rideDetails.to,
      date: chat.rideDetails.date,
      time: chat.rideDetails.time
    });
    navigate(`/chat/${chat.name}?${params.toString()}`);
  };

  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          className="h-14 w-14 rounded-full bg-yoldosh-blue hover:bg-blue-700 shadow-lg relative"
        >
          <MessageCircle className="h-6 w-6" />
          {totalUnread > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {totalUnread}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Сообщения
              {totalUnread > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">
                  {totalUnread}
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
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat)}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {chat.type === 'driver' ? (
                        <Car className="h-5 w-5 text-gray-400" />
                      ) : (
                        <User className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{chat.name}</span>
                          <Badge 
                            variant={chat.type === 'driver' ? 'default' : 'secondary'} 
                            className="text-xs"
                          >
                            {chat.type === 'driver' ? 'Водитель' : 'Пассажир'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">
                            {formatTime(chat.timestamp)}
                          </span>
                          {chat.unreadCount > 0 && (
                            <Badge className="h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-600 mb-1">
                        <MapPin className="h-3 w-3" />
                        <span>{chat.rideDetails.from} → {chat.rideDetails.to}</span>
                        <Clock className="h-3 w-3 ml-2" />
                        <span>{chat.rideDetails.date}</span>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate">
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatPanel;
