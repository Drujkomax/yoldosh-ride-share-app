import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, User, Check, CheckCheck, CheckCircle, XCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useMessages } from '@/hooks/useChats';
import { supabase } from '@/integrations/supabase/client';
import ChatRideInfo from '@/components/ChatRideInfo';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/hooks/useUserRole';
import UserAvatar from '@/components/UserAvatar';

const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { role: currentUserRole } = useUserRole();
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
        console.log('Загрузка чата:', chatId);
        const { data: chatData, error } = await supabase
          .from('chats')
          .select(`
            *,
            participant1:profiles!chats_participant1_id_fkey (
              id, name, phone, rating, total_rides, is_verified
            ),
            participant2:profiles!chats_participant2_id_fkey (
              id, name, phone, rating, total_rides, is_verified
            ),
            ride:rides!chats_ride_id_fkey (
              id, from_city, to_city, departure_date, departure_time, available_seats
            )
          `)
          .eq('id', chatId)
          .maybeSingle();

        if (error) {
          console.error('Ошибка загрузки чата:', error);
          return;
        }

        if (!chatData) {
          console.log('Чат не найден:', chatId);
          return;
        }

        // Проверяем, является ли пользователь участником чата
        if (user?.id && chatData.participant1_id !== user.id && chatData.participant2_id !== user.id) {
          console.error('Пользователь не является участником чата:', {
            userId: user.id,
            participant1: chatData.participant1_id,
            participant2: chatData.participant2_id
          });
          return;
        }

        console.log('Чат загружен:', chatData);
        setChat(chatData);
      } catch (error) {
        console.error('Ошибка загрузки чата:', error);
      } finally {
        setChatLoading(false);
      }
    };

    loadChat();
  }, [chatId, user?.id]);

  // Принудительно перезагружаем данные при возвращении на страницу
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && chatId) {
        console.log('Страница стала видимой, перезагружаем чат:', chatId);
        // Перезагружаем чат
        setChat(null);
        setChatLoading(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
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

  // Обработка ответа водителя на запрос бронирования
  const handleBookingResponse = async (messageId: string, bookingRequestId: string, action: 'accept' | 'reject') => {
    try {
      console.log('Обработка ответа на бронирование:', { messageId, bookingRequestId, action });
      
      // Обновляем статус бронирования
      const newStatus = action === 'accept' ? 'confirmed' : 'rejected';
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingRequestId);

      if (bookingError) {
        console.error('Ошибка обновления бронирования:', bookingError);
        throw bookingError;
      }

      // Отмечаем сообщение как обработанное
      const { error: messageError } = await supabase
        .from('messages')
        .update({ is_action_completed: true })
        .eq('id', messageId);

      if (messageError) {
        console.error('Ошибка обновления сообщения:', messageError);
        throw messageError;
      }

      // Отправляем системное сообщение о результате
      const responseText = action === 'accept' 
        ? '✅ Команда Yoldosh: Запрос на бронирование подтвержден!' 
        : '❌ Команда Yoldosh: Запрос на бронирование отклонен.';

      await sendMessage({
        content: responseText,
        senderType: 'system',
        systemActionType: 'booking_confirmation'
      });

      toast.success(action === 'accept' ? 'Запрос подтвержден' : 'Запрос отклонен');
    } catch (error) {
      console.error('Ошибка обработки запроса бронирования:', error);
      toast.error('Не удалось обработать запрос');
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

  const getParticipantRole = (participantId: string) => {
    // Определяем роль относительно этой поездки
    if (!chat?.ride) return 'passenger';
    
    // Если это водитель поездки - показываем как водителя
    if (chat.ride && chat.participant1_id === chat.ride.driver_id) {
      return participantId === chat.participant1_id ? 'driver' : 'passenger';
    } else if (chat.ride && chat.participant2_id === chat.ride.driver_id) {
      return participantId === chat.participant2_id ? 'driver' : 'passenger';
    }
    
    return 'passenger';
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'driver' 
      ? 'bg-yoldosh-primary/10 text-yoldosh-primary border-0' 
      : 'bg-yoldosh-secondary/10 text-yoldosh-secondary border-0';
  };

  if (isLoading || chatLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yoldosh-brand-light via-background to-secondary flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mb-4"></div>
          <p className="text-muted-foreground">Загрузка чата...</p>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yoldosh-brand-light via-background to-secondary flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8">
          <div className="bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Чат не найден</h3>
          <p className="text-muted-foreground mb-4">Этот чат больше не доступен</p>
          <Button onClick={handleBackClick} className="bg-primary hover:bg-primary/90">
            Вернуться назад
          </Button>
        </div>
      </div>
    );
  }

  const otherParticipant = chat.participant1_id === user?.id 
    ? chat.participant2 
    : chat.participant1;

  const otherParticipantRole = getParticipantRole(otherParticipant?.id || '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-yoldosh-brand-light via-background to-secondary flex flex-col">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary to-yoldosh-brand shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleBackClick}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div 
                className="flex items-center gap-3 cursor-pointer hover:bg-white/10 p-2 rounded-xl transition-all active:scale-95"
                onClick={() => navigate(`/profile/${otherParticipant?.id}`)}
              >
                <div className="relative">
                  <UserAvatar 
                    size="md" 
                    userId={otherParticipant?.id}
                    name={otherParticipant?.name}
                    avatarUrl={otherParticipant?.avatar_url}
                  />
                  {otherParticipant?.is_verified && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-base font-bold text-white truncate">{otherParticipant?.name || 'Пользователь'}</h1>
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs">
                      {otherParticipantRole === 'driver' ? '🚗 Водитель' : '👤 Пассажир'}
                    </Badge>
                  </div>
                  {otherParticipant?.rating && (
                    <p className="text-xs text-white/80">
                      ⭐ {otherParticipant.rating.toFixed(1)} • {otherParticipant.total_rides} поездок
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ride Info */}
      {chat.ride && (
        <div className="bg-white/60 backdrop-blur-sm border-b border-primary/10 px-4 py-3">
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
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center mt-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 inline-block">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Начните общение</h3>
              <p className="text-sm text-muted-foreground">
                Напишите первое сообщение вашему попутчику
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isMyMessage = message.sender_id === user?.id;
            const isSystemMessage = message.sender_type === 'system';
            const isDriverAndCanRespond = currentUserRole === 'driver' && 
              message.system_action_type === 'booking_request' && 
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
                        onClick={() => handleBookingResponse(message.id, message.booking_request_id!, 'accept')}
                        className="bg-yoldosh-success hover:bg-yoldosh-success/90 text-white flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Подтвердить
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBookingResponse(message.id, message.booking_request_id!, 'reject')}
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
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-primary/10 p-4 safe-bottom">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Напишите сообщение..."
            className="flex-1 h-12 bg-white/80 border-primary/20 rounded-2xl px-4 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            disabled={isSending}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!newMessage.trim() || isSending}
            className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-yoldosh-brand hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
