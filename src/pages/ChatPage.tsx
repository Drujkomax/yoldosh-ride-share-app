
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, User, Check, CheckCheck } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useMessages } from '@/hooks/useChats';
import { supabase } from '@/integrations/supabase/client';
import ChatRideInfo from '@/components/ChatRideInfo';
import { toast } from 'sonner';

const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { messages, sendMessage, markAsRead, isLoading, isSending } = useMessages(chatId || '');
  const [newMessage, setNewMessage] = useState('');
  const [chat, setChat] = useState<any>(null);
  const [chatLoading, setChatLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Загружаем информацию о чате
  useEffect(() => {
    const loadChat = async () => {
      if (!chatId) return;
      
      setChatLoading(true);
      try {
        const { data: chatData, error } = await supabase
          .from('chats')
          .select(`
            *,
            participant1:profiles!chats_participant1_id_fkey (
              name, phone, rating, total_rides, is_verified
            ),
            participant2:profiles!chats_participant2_id_fkey (
              name, phone, rating, total_rides, is_verified
            ),
            ride:rides!chats_ride_id_fkey (
              id, from_city, to_city, departure_date, departure_time, available_seats
            )
          `)
          .eq('id', chatId)
          .single();

        if (error) {
          console.error('Ошибка загрузки чата:', error);
          return;
        }

        setChat(chatData);
      } catch (error) {
        console.error('Ошибка загрузки чата:', error);
      } finally {
        setChatLoading(false);
      }
    };

    loadChat();
  }, [chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Отмечаем сообщения как прочитанные когда пользователь открывает чат
  useEffect(() => {
    if (messages.length > 0 && user?.id && chat) {
      const unreadMessages = messages.filter(
        (message) => !message.read_at && message.sender_id !== user.id
      );
      
      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map((message) => message.id);
        markAsRead(messageIds);
      }
    }
  }, [messages, user?.id, chat, markAsRead]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId) {
      console.log('handleSendMessage - Сообщение пустое или chatId отсутствует', { newMessage, chatId });
      return;
    }

    if (!user?.id) {
      console.log('handleSendMessage - Пользователь не авторизован');
      toast.error('Необходимо войти в систему для отправки сообщений');
      return;
    }

    // Проверяем, является ли пользователь участником чата
    if (!chat || (chat.participant1_id !== user.id && chat.participant2_id !== user.id)) {
      console.log('handleSendMessage - Пользователь не является участником чата');
      toast.error('У вас нет прав для отправки сообщений в этот чат');
      return;
    }
    
    console.log('handleSendMessage - Отправка сообщения:', { 
      content: newMessage, 
      chatId, 
      userId: user.id,
      isParticipant: chat.participant1_id === user.id || chat.participant2_id === user.id
    });
    
    try {
      await sendMessage({ content: newMessage });
      setNewMessage('');
      console.log('handleSendMessage - Сообщение успешно отправлено');
    } catch (error) {
      console.error('handleSendMessage - Ошибка отправки сообщения:', error);
      toast.error(`Не удалось отправить сообщение: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBackClick = () => {
    // Определяем куда возвращать пользователя в зависимости от его роли
    if (user?.role === 'driver') {
      navigate('/driver');
    } else {
      navigate('/passenger');
    }
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

  if (isLoading || chatLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Загрузка чата...</p>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Чат не найден</p>
          <Button onClick={handleBackClick}>
            Вернуться назад
          </Button>
        </div>
      </div>
    );
  }

  const otherParticipant = chat.participant1_id === user?.id 
    ? chat.participant2 
    : chat.participant1;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleBackClick}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div 
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={() => navigate(`/profile/${otherParticipant?.id}`)}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">{otherParticipant?.name || 'Пользователь'}</h1>
                  <p className="text-sm text-gray-600">{otherParticipant?.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ride Info */}
      {chat.ride && (
        <div className="bg-white border-b px-4 py-2">
          <ChatRideInfo
            rideId={chat.ride.id}
            fromCity={chat.ride.from_city}
            toCity={chat.ride.to_city}
            departureDate={chat.ride.departure_date}
            departureTime={chat.ride.departure_time}
            availableSeats={chat.ride.available_seats}
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Начните общение с вашим попутчиком</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMyMessage = message.sender_id === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                 <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    isMyMessage
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-900 border'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className={`flex items-center justify-between mt-1`}>
                    <p
                      className={`text-xs ${
                        isMyMessage ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </p>
                    {/* Галочки только для моих сообщений */}
                    {isMyMessage && (
                      <div className="ml-2">
                        {message.read_at ? (
                          <CheckCheck className="h-3 w-3 text-blue-200" />
                        ) : (
                          <Check className="h-3 w-3 text-blue-200" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Напишите сообщение..."
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
