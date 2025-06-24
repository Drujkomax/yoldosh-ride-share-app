
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, User, Send, MapPin, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Message {
  id: number;
  text?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  timestamp: Date;
  sender: 'me' | 'other';
}

const ChatPage = () => {
  const navigate = useNavigate();
  const { name } = useParams();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Привет! Я уже в пути к месту встречи.',
      timestamp: new Date(Date.now() - 10 * 60000),
      sender: 'other'
    },
    {
      id: 2,
      text: 'Отлично! Увидимся через 10 минут.',
      timestamp: new Date(Date.now() - 8 * 60000),
      sender: 'me'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: inputText,
      timestamp: new Date(),
      sender: 'me'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
  };

  const handleSendLocation = () => {
    setIsLocationLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Simulate reverse geocoding
          const mockAddress = `ул. Примерная, ${Math.floor(Math.random() * 100)}, Ташкент`;
          
          const locationMessage: Message = {
            id: Date.now(),
            location: {
              lat: latitude,
              lng: longitude,
              address: mockAddress
            },
            timestamp: new Date(),
            sender: 'me'
          };

          setMessages(prev => [...prev, locationMessage]);
          setIsLocationLoading(false);
        },
        (error) => {
          console.error('Ошибка получения геолокации:', error);
          alert('Не удалось получить геолокацию. Проверьте разрешения браузера.');
          setIsLocationLoading(false);
        }
      );
    } else {
      alert('Геолокация не поддерживается вашим браузером');
      setIsLocationLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

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
              <h1 className="text-lg font-semibold">{name}</h1>
            </div>
            <div></div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'me'
                  ? 'bg-yoldosh-blue text-white'
                  : 'bg-white border shadow-sm'
              }`}
            >
              {message.text && (
                <p className="text-sm">{message.text}</p>
              )}
              
              {message.location && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Местоположение</span>
                  </div>
                  <p className="text-xs opacity-75">{message.location.address}</p>
                  <div className="text-xs opacity-60">
                    {message.location.lat.toFixed(6)}, {message.location.lng.toFixed(6)}
                  </div>
                </div>
              )}
              
              <div className={`flex items-center space-x-1 mt-1 text-xs ${
                message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                <Clock className="h-3 w-3" />
                <span>{formatTime(message.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
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
            />
          </div>
          <Button
            onClick={handleSendLocation}
            variant="outline"
            size="icon"
            disabled={isLocationLoading}
            className="shrink-0"
          >
            <MapPin className={`h-4 w-4 ${isLocationLoading ? 'animate-pulse' : ''}`} />
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
