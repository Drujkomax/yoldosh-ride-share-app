
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { useEffect } from 'react';

export interface Chat {
  id: string;
  ride_id?: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at: string;
  created_at: string;
  participant1?: {
    name: string;
    phone: string;
    rating?: number;
    total_rides: number;
    is_verified: boolean;
  };
  participant2?: {
    name: string;
    phone: string;
    rating?: number;
    total_rides: number;
    is_verified: boolean;
  };
  ride?: {
    from_city: string;
    to_city: string;
    departure_date: string;
    departure_time: string;
  };
  lastMessage?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unreadCount: number;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'location';
  read_at?: string;
  created_at: string;
  sender?: {
    name: string;
  };
}

export const useChats = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      console.log('useChats - Загрузка чатов пользователя');
      
      if (!user) {
        console.log('useChats - Пользователь не найден');
        return [];
      }

      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          participant1:profiles!chats_participant1_id_fkey (
            name,
            phone,
            rating,
            total_rides,
            is_verified
          ),
          participant2:profiles!chats_participant2_id_fkey (
            name,
            phone,
            rating,
            total_rides,
            is_verified
          ),
          ride:rides (
            from_city,
            to_city,
            departure_date,
            departure_time
          )
        `)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('useChats - Ошибка загрузки чатов:', error);
        throw error;
      }

      // Загружаем последние сообщения и подсчитываем непрочитанные
      const chatsWithMessages = await Promise.all(
        (data || []).map(async (chat) => {
          // Последнее сообщение
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at, sender_id')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Количество непрочитанных сообщений
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chat.id)
            .neq('sender_id', user.id)
            .is('read_at', null);

          return {
            ...chat,
            lastMessage,
            unreadCount: unreadCount || 0
          };
        })
      );

      console.log('useChats - Загружено чатов:', chatsWithMessages.length);
      return chatsWithMessages as Chat[];
    },
    enabled: !!user,
  });

  // Realtime подписка на обновления чатов
  useEffect(() => {
    if (!user) return;

    console.log('useChats - Подписка на realtime обновления чатов');

    const chatsChannel = supabase
      .channel('chats-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
          filter: `participant1_id=eq.${user.id}`
        },
        () => {
          console.log('useChats - Обновление чата (participant1)');
          queryClient.invalidateQueries({ queryKey: ['chats'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
          filter: `participant2_id=eq.${user.id}`
        },
        () => {
          console.log('useChats - Обновление чата (participant2)');
          queryClient.invalidateQueries({ queryKey: ['chats'] });
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          console.log('useChats - Новое сообщение');
          queryClient.invalidateQueries({ queryKey: ['chats'] });
          queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user, queryClient]);

  return {
    chats,
    isLoading,
  };
};

export const useMessages = (chatId: string) => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      console.log('useMessages - Загрузка сообщений для чата:', chatId);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (
            name
          )
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('useMessages - Ошибка загрузки сообщений:', error);
        throw error;
      }

      console.log('useMessages - Загружено сообщений:', data.length);
      return data as Message[];
    },
    enabled: !!chatId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, messageType = 'text' }: { content: string; messageType?: 'text' | 'location' }) => {
      console.log('useMessages - Отправка сообщения:', { content, messageType });
      
      if (!user) {
        throw new Error('Пользователь не авторизован');
      }

      // Сначала проверяем, существует ли чат
      const { data: chatExists } = await supabase
        .from('chats')
        .select('id')
        .eq('id', chatId)
        .single();

      if (!chatExists) {
        throw new Error('Чат не найден');
      }

      const { data, error } = await supabase
        .from('messages')
        .insert([{
          chat_id: chatId,
          sender_id: user.id,
          content,
          message_type: messageType
        }])
        .select()
        .single();

      if (error) {
        console.error('useMessages - Ошибка отправки сообщения:', error);
        throw error;
      }

      // Обновляем время последнего сообщения в чате
      await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', chatId);

      console.log('useMessages - Сообщение отправлено:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    onError: (error) => {
      console.error('Send message error:', error);
      toast.error("Не удалось отправить сообщение");
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageIds: string[]) => {
      console.log('useMessages - Отмечаем сообщения как прочитанные:', messageIds);
      
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', messageIds)
        .neq('sender_id', user?.id || '');

      if (error) {
        console.error('useMessages - Ошибка отметки сообщений как прочитанных:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  // Realtime подписка на новые сообщения
  useEffect(() => {
    if (!chatId) return;

    console.log('useMessages - Подписка на realtime сообщения для чата:', chatId);

    const channel = supabase
      .channel(`messages-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          console.log('useMessages - Новое сообщение в чате:', payload);
          queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, queryClient]);

  return {
    messages,
    isLoading,
    sendMessage: sendMessageMutation.mutateAsync,
    markAsRead: markAsReadMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
  };
};
