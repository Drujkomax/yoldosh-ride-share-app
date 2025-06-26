
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageCircle, User } from 'lucide-react';
import { useChats } from '@/hooks/useChats';
import { useUser } from '@/contexts/UserContext';
import DriverBottomNavigation from '@/components/DriverBottomNavigation';

const DriverChatsPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { chats, isLoading } = useChats();

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
      const date = new Date(dateStr);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Сегодня';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Вчера';
      } else {
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
      }
    } catch {
      return '';
    }
  };

  const getOtherParticipant = (chat: any) => {
    if (!user) return null;
    
    if (chat.participant1_id === user.id) {
      return chat.participant2;
    } else {
      return chat.participant1;
    }
  };

  const handleChatClick = (chatId: string, otherParticipant: any) => {
    if (otherParticipant?.name) {
      navigate(`/chat/${otherParticipant.name}?chatId=${chatId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 pb-24">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/driver-home')}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <h1 className="text-xl font-bold text-high-contrast">Мои чаты</h1>
            <div className="w-16" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yoldosh-blue mx-auto"></div>
            <p className="text-slate-500 mt-2">Загрузка чатов...</p>
          </div>
        ) : chats.length === 0 ? (
          <Card className="card-high-contrast rounded-3xl shadow-xl">
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-high-contrast mb-2">Нет активных чатов</h3>
              <p className="text-slate-600">
                Чаты появятся после того, как пассажиры забронируют ваши поездки
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {chats.map((chat) => {
              const otherParticipant = getOtherParticipant(chat);
              
              return (
                <Card 
                  key={chat.id} 
                  className="card-high-contrast rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer animate-fade-in"
                  onClick={() => handleChatClick(chat.id, otherParticipant)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-yoldosh-secondary rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-high-contrast">
                              {otherParticipant?.name || 'Пассажир'}
                            </h3>
                            {otherParticipant?.is_verified && (
                              <Badge className="bg-yoldosh-success/10 text-yoldosh-success border-0 text-xs">
                                ✓
                              </Badge>
                            )}
                          </div>
                          {chat.ride && (
                            <p className="text-sm text-slate-600">
                              {chat.ride.from_city} → {chat.ride.to_city}
                            </p>
                          )}
                          {chat.lastMessage && (
                            <p className="text-sm text-slate-500 truncate max-w-xs">
                              {chat.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {chat.lastMessage && (
                          <div className="text-xs text-slate-400">
                            <div>{formatDate(chat.lastMessage.created_at)}</div>
                            <div>{formatTime(chat.lastMessage.created_at)}</div>
                          </div>
                        )}
                        {chat.unreadCount > 0 && (
                          <Badge className="bg-yoldosh-primary text-white border-0 mt-2">
                            {chat.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Driver Bottom Navigation */}
      <DriverBottomNavigation />
    </div>
  );
};

export default DriverChatsPage;
