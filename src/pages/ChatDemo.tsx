import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, CheckCircle, CheckCheck, Check, MapPin, Calendar, Clock, Users, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import UserAvatar from '@/components/UserAvatar';

const ChatDemo = () => {
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      content: 'Здравствуйте! Я еду из Ташкента в Самарканд завтра в 10:00. У меня есть 2 свободных места.',
      sender_id: 'other',
      sender_type: 'user',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      read_at: new Date().toISOString()
    },
    {
      id: '2',
      content: 'Отлично! Мне как раз нужно туда поехать. Сколько стоит место?',
      sender_id: 'me',
      sender_type: 'user',
      created_at: new Date(Date.now() - 3000000).toISOString(),
      read_at: new Date().toISOString()
    },
    {
      id: '3',
      content: '150,000 сум за место. Выезжаю от площади Амира Темура.',
      sender_id: 'other',
      sender_type: 'user',
      created_at: new Date(Date.now() - 2400000).toISOString(),
      read_at: new Date().toISOString()
    },
    {
      id: '4',
      content: 'Пользователь забронировал 1 место на поездку. Водитель, пожалуйста, подтвердите или отклоните запрос на бронирование.',
      sender_id: 'system',
      sender_type: 'system',
      system_action_type: 'booking_request',
      is_action_completed: false,
      booking_request_id: 'booking_123',
      created_at: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: '5',
      content: 'Меня это устраивает! Какие остановки по пути?',
      sender_id: 'me',
      sender_type: 'user',
      created_at: new Date(Date.now() - 1200000).toISOString(),
      read_at: null
    },
    {
      id: '6',
      content: 'Можем остановиться в Джизаке на 15 минут для кофе-брейка 😊',
      sender_id: 'other',
      sender_type: 'user',
      created_at: new Date(Date.now() - 600000).toISOString(),
      read_at: null
    },
    {
      id: '7',
      content: 'Прекрасно! До встречи завтра!',
      sender_id: 'me',
      sender_type: 'user',
      created_at: new Date(Date.now() - 300000).toISOString(),
      read_at: null
    }
  ]);

  const demoRide = {
    id: 'demo-ride',
    from_city: 'Ташкент',
    to_city: 'Самарканд',
    departure_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    departure_time: '10:00',
    available_seats: 2
  };

  const demoParticipant = {
    id: 'demo-driver',
    name: 'Алишер Каримов',
    is_verified: true,
    rating: 4.8,
    total_rides: 127
  };

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
      });
    } catch {
      return dateStr;
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      content: newMessage,
      sender_id: 'me',
      sender_type: 'user',
      created_at: new Date().toISOString(),
      read_at: null
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yoldosh-brand-light via-background to-secondary flex flex-col">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary to-yoldosh-brand shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 p-2 rounded-xl">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold">
                    АК
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-base font-bold text-white truncate">{demoParticipant.name}</h1>
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs">
                      🚗 Водитель
                    </Badge>
                  </div>
                  <p className="text-xs text-white/80">
                    ⭐ {demoParticipant.rating.toFixed(1)} • {demoParticipant.total_rides} поездок
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ride Info */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-primary/10 px-4 py-3">
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-xl">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-foreground text-base">
              {demoRide.from_city} → {demoRide.to_city}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-primary font-medium">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(demoRide.departure_date)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-primary font-medium">
                <Clock className="h-3.5 w-3.5" />
                <span>{demoRide.departure_time}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-lg">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span className="text-primary font-semibold">{demoRide.available_seats}</span>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            👆 Демо-поездка для тестирования
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {messages.map((message) => {
          const isMyMessage = message.sender_id === 'me';
          const isSystemMessage = message.sender_type === 'system';
          const isDriverAndCanRespond = message.system_action_type === 'booking_request' && 
            !message.is_action_completed;

          return (
            <div
              key={message.id}
              className={`flex animate-fade-in ${isSystemMessage ? 'justify-center' : isMyMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl shadow-sm ${
                  isSystemMessage
                    ? 'bg-accent/10 text-accent-foreground border border-accent/20 px-4 py-3'
                    : isMyMessage
                      ? 'bg-gradient-to-br from-primary to-yoldosh-brand text-white px-4 py-3'
                      : 'bg-white/80 backdrop-blur-sm text-foreground border border-primary/10 px-4 py-3'
                }`}
              >
                {/* Заголовок для системных сообщений */}
                {isSystemMessage && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">Y</span>
                    </div>
                    <span className="text-sm font-bold">Команда Yoldosh</span>
                  </div>
                )}
                
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {/* Кнопки подтверждения/отклонения для водителей */}
                {isDriverAndCanRespond && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="bg-yoldosh-success hover:bg-yoldosh-success/90 text-white flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Подтвердить
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-destructive text-destructive hover:bg-destructive/10 flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Отклонить
                    </Button>
                  </div>
                )}
                
                <div className="flex items-center justify-between gap-2 mt-2">
                  <p
                    className={`text-xs ${
                      isSystemMessage 
                        ? 'text-accent-foreground/70'
                        : isMyMessage 
                          ? 'text-white/80' 
                          : 'text-muted-foreground'
                    }`}
                  >
                    {formatTime(message.created_at)}
                  </p>
                  {/* Галочки только для моих сообщений */}
                  {isMyMessage && !isSystemMessage && (
                    <div>
                      {message.read_at ? (
                        <CheckCheck className="h-3.5 w-3.5 text-white/90" />
                      ) : (
                        <Check className="h-3.5 w-3.5 text-white/70" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-primary/10 p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Напишите сообщение..."
            className="flex-1 h-12 bg-white/80 border-primary/20 rounded-2xl px-4 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!newMessage.trim()}
            className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-yoldosh-brand hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Это демо-чат для тестирования дизайна
        </p>
      </div>
    </div>
  );
};

export default ChatDemo;
