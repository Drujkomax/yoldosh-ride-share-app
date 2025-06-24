
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User, Car, MapPin, Clock, Search, ArrowLeft } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';

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

const ChatsListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock chats data
  const allChats: Chat[] = [
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
    },
    {
      id: '4',
      name: 'Дилшод',
      type: 'driver',
      lastMessage: 'Добро пожаловать в поездку',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60000),
      unreadCount: 0,
      rideDetails: {
        from: 'Самарканд',
        to: 'Ташкент',
        date: '22 декабря',
        time: '16:00',
        rideId: '4'
      }
    }
  ];

  const filteredChats = allChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.rideDetails.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.rideDetails.to.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/passenger')}
              className="rounded-xl hover:bg-yoldosh-primary/10 p-3"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад
            </Button>
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Сообщения
              </h1>
              <p className="text-slate-600 mt-1">Ваши активные чаты</p>
            </div>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Search */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по имени или маршруту..."
                className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-slate-200 focus:border-yoldosh-primary focus:ring-4 focus:ring-yoldosh-primary/20 bg-white/80 backdrop-blur-sm transition-all duration-300"
              />
            </div>
          </CardContent>
        </Card>

        {/* Chats List */}
        <Card className="bg-white/80 backdrop-blur-lg border-0 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Все чаты
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredChats.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Нет чатов</p>
                <p className="text-sm">Начните поиск поездок, чтобы начать общение</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleChatClick(chat)}
                    className="p-6 hover:bg-gradient-to-r hover:from-white hover:to-slate-50 cursor-pointer transition-all duration-300 hover:scale-105 first:rounded-t-3xl last:rounded-b-3xl"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
                        {chat.type === 'driver' ? (
                          <Car className="h-6 w-6 text-white" />
                        ) : (
                          <User className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-lg text-slate-800">{chat.name}</span>
                            <Badge 
                              className={`text-xs ${
                                chat.type === 'driver' 
                                  ? 'bg-yoldosh-primary/10 text-yoldosh-primary border-0' 
                                  : 'bg-yoldosh-secondary/10 text-yoldosh-secondary border-0'
                              }`}
                            >
                              {chat.type === 'driver' ? 'Водитель' : 'Пассажир'}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-slate-500">
                              {formatTime(chat.timestamp)}
                            </span>
                            {chat.unreadCount > 0 && (
                              <Badge className="h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                {chat.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 text-sm text-slate-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span className="font-medium">{chat.rideDetails.from} → {chat.rideDetails.to}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{chat.rideDetails.date}</span>
                          </div>
                        </div>
                        
                        <p className="text-slate-700 font-medium truncate">
                          {chat.lastMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ChatsListPage;
