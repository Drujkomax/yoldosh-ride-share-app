
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
    message_type?: string;
    location_data?: any;
  };
  unreadCount: number;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'location';
  location_data?: {
    latitude: number;
    longitude: number;
    address?: string;
    timestamp: string;
  };
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
    queryKey: ['chats', user?.id],
    queryFn: async () => {
      console.log('useChats - Загрузка чатов пользователя:', user?.id);
      
      if (!user?.id) {
        console.log('useChats - Пользователь не найден');
        return [];
      }

      // Загружаем чаты где пользователь является участником
      const { data: chatsData, error } = await supabase
        .from('chats')
        .select('*')
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('useChats - Ошибка загрузки чатов:', error);
        return [];
      }

      // Загружаем дополнительные данные для каждого чата
      const chatsWithData = await Promise.all(
        (chatsData || []).map(async (chat) => {
          // Загружаем участников
          const [participant1Response, participant2Response] = await Promise.all([
            supabase
              .from('profiles')
              .select('name, phone, rating, total_rides, is_verified')
              .eq('id', chat.participant1_id)
              .single(),
            supabase
              .from('profiles')
              .select('name, phone, rating, total_rides, is_verified')
              .eq('id', chat.participant2_id)
              .single()
          ]);

          // Загружаем поездку если есть
          let ride = null;
          if (chat.ride_id) {
            const { data: rideData } = await supabase
              .from('rides')
              .select('from_city, to_city, departure_date, departure_time')
              .eq('id', chat.ride_id)
              .single();
            ride = rideData;
          }

          // Последнее сообщение
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at, sender_id, message_type, location_data')
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
            participant1: participant1Response.data,
            participant2: participant2Response.data,
            ride,
            lastMessage,
            unreadCount: unreadCount || 0
          };
        })
      );

      console.log('useChats - Загружено чатов:', chatsWithData.length);
      return chatsWithData as Chat[];
    },
    enabled: !!user?.id,
  });

  // Realtime подписка на обновления чатов
  useEffect(() => {
    if (!user?.id) return;

    console.log('useChats - Подписка на realtime обновления чатов');

    const chatsChannel = supabase
      .channel('chats-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats'
        },
        () => {
          console.log('useChats - Обновление чата');
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
  }, [user?.id, queryClient]);

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
      
      if (!chatId) {
        return [];
      }

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
        return [];
      }

      console.log('useMessages - Загружено сообщений:', data?.length || 0);
      return data as Message[];
    },
    enabled: !!chatId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, messageType = 'text', locationData }: { 
      content: string; 
      messageType?: 'text' | 'location';
      locationData?: any;
    }) => {
      console.log('useMessages - Отправка сообщения:', { content, messageType, locationData, chatId, userId: user?.id });
      
      if (!user?.id) {
        throw new Error('Пользователь не авторизован');
      }

      if (!chatId) {
        throw new Error('Chat ID не указан');
      }

      // Отправляем сообщение
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          chat_id: chatId,
          sender_id: user.id,
          content,
          message_type: messageType,
          location_data: locationData || null
        }])
        .select()
        .single();

      if (error) {
        console.error('useMessages - Ошибка отправки сообщения:', error);
        throw error;
      }

      console.log('useMessages - Сообщение отправлено:', data);

      // Обновляем время последнего сообщения в чате
      await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', chatId);

      return data;
    },
    onSuccess: () => {
      console.log('useMessages - Сообщение успешно отправлено, обновляем кэш');
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    onError: (error) => {
      console.error('Send message error:', error);
      toast.error(`Не удалось отправить сообщение: ${error.message}`);
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageIds: string[]) => {
      console.log('useMessages - Отмечаем сообщения как прочитанные:', messageIds);
      
      if (!messageIds.length) return;
      
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

// Функция для создания чата между пользователями
export const createChat = async (ride_id: string, participant1_id: string, participant2_id: string) => {
  console.log('createChat - Создание чата:', { ride_id, participant1_id, participant2_id });
  
  // Проверяем, существует ли уже чат
  const { data: existingChat } = await supabase
    .from('chats')
    .select('id')
    .eq('ride_id', ride_id)
    .or(`and(participant1_id.eq.${participant1_id},participant2_id.eq.${participant2_id}),and(participant1_id.eq.${participant2_id},participant2_id.eq.${participant1_id})`)
    .single();

  if (existingChat) {
    console.log('createChat - Чат уже существует:', existingChat.id);
    return existingChat.id;
  }

  // Создаем новый чат
  const { data: newChat, error } = await supabase
    .from('chats')
    .insert([{
      ride_id,
      participant1_id,
      participant2_id,
    }])
    .select('id')
    .single();

  if (error) {
    console.error('createChat - Ошибка создания чата:', error);
    throw error;
  }

  console.log('createChat - Чат создан:', newChat.id);
  return newChat.id;
};
