
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Send, MapPin, Clock, Car, Calendar, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useMessages } from '@/hooks/useChats';
import { useUser } from '@/contexts/UserContext';

const ChatPage = () => {
  const navigate = useNavigate();
  const { name } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Получаем ID чата и детали из URL параметров
  const chatId = searchParams.get('chatId') || '';
  const chatType = searchParams.get('type'); // 'driver' или 'passenger'
  const rideId = searchParams.get('rideId');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');
  const time = searchParams.get('time');

  const { messages, isLoading, sendMessage, markAsRead, isSending } = useMessages(chatId);
  const [inputText, setInputText] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Отмечаем сообщения как прочитанные при загрузке
  useEffect(() => {
    if (messages.length > 0 && user) {
      const unreadMessages = messages
        .filter(msg => !msg.read_at && msg.sender_id !== user.id)
        .map(msg => msg.id);
      
      if (unreadMessages.length > 0) {
        markAsRead(unreadMessages).catch(console.error);
      }
    }
  }, [messages, user, markAsRead]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isSending) return;

    try {
      await sendMessage({ content: inputText });
      setInputText('');
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  };

  const handleSendLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const locationText = `Мое местоположение: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          try {
            await sendMessage({ 
              content: locationText, 
              messageType: 'location' 
            });
          } catch (error) {
            console.error('Ошибка отправки геолокации:', error);
          }
        },
        (error) => {
          console.error('Ошибка получения геолокации:', error);
          alert('Не удалось получить геолокацию. Проверьте разрешения браузера.');
        }
      );
    } else {
      alert('Геолокация не поддерживается вашим браузером');
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-center">
                <h1 className="text-lg font-semibold">{name}</h1>
                <div className="flex items-center space-x-2">
                  <Badge variant={chatType === 'driver' ? 'default' : 'secondary'} className="text-xs">
                    {chatType === 'driver' ? (
                      <>
                        <Car className="h-3 w-3 mr-1" />
                        Водитель
                      </>
                    ) : (
                      <>
                        <User className="h-3 w-3 mr-1" />
                        Пассажир
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>
            <div></div>
          </div>
        </div>
      </div>

      {/* Trip Info */}
      {from && to && (
        <div className="bg-blue-50 border-b p-3">
          <div className="container mx-auto">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{from} → {to}</span>
              </div>
              {date && time && (
                <div className="flex items-center space-x-2 text-blue-700">
                  <Calendar className="h-4 w-4" />
                  <span>{date} в {time}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Начните общение</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender_id === user?.id
                    ? 'bg-yoldosh-blue text-white'
                    : 'bg-white border shadow-sm'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                
                <div className={`flex items-center justify-between space-x-2 mt-1 text-xs ${
                  message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(message.created_at)}</span>
                  </div>
                  {message.sender_id === user?.id && (
                    <span>{message.read_at ? '✓✓' : '✓'}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <Input
              placeholder="Напишите сообщение..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full"
              disabled={isSending}
            />
          </div>
          <Button
            onClick={handleSendLocation}
            variant="outline"
            size="icon"
            disabled={isSending}
            className="shrink-0"
          >
            <MapPin className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isSending}
            size="icon"
            className="shrink-0"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
