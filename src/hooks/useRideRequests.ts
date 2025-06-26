
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { useEffect } from 'react';

export interface RideRequest {
  id: string;
  passenger_id: string;
  from_city: string;
  to_city: string;
  preferred_date: string;
  passengers_count: number;
  max_price_per_seat: number;
  description?: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  passenger?: {
    name: string;
    phone: string;
    rating?: number;
    total_rides: number;
    is_verified: boolean;
  };
}

export const useRideRequests = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ['ride-requests'],
    queryFn: async () => {
      console.log('useRideRequests - Загрузка заявок пассажиров');
      
      const { data, error } = await supabase
        .from('ride_requests')
        .select(`
          *,
          profiles:passenger_id (
            name,
            phone,
            rating,
            total_rides,
            is_verified
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useRideRequests - Ошибка загрузки заявок:', error);
        throw error;
      }

      console.log('useRideRequests - Загружено заявок:', data?.length || 0);

      // Правильно маппим данные профилей
      return (data || []).map(request => ({
        ...request,
        passenger: request.profiles ? {
          name: request.profiles.name,
          phone: request.profiles.phone,
          rating: request.profiles.rating,
          total_rides: request.profiles.total_rides,
          is_verified: request.profiles.is_verified
        } : undefined
      })) as RideRequest[];
    },
  });

  // Realtime подписка на обновления заявок
  useEffect(() => {
    console.log('useRideRequests - Подписка на realtime обновления заявок');

    const channel = supabase
      .channel('ride-requests-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ride_requests'
        },
        (payload) => {
          console.log('useRideRequests - Обновление заявки:', payload);
          queryClient.invalidateQueries({ queryKey: ['ride-requests'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createRequestMutation = useMutation({
    mutationFn: async (newRequest: Omit<RideRequest, 'id' | 'created_at' | 'updated_at' | 'passenger'>) => {
      console.log('useRideRequests - Создание заявки:', newRequest);
      
      if (!user) {
        throw new Error('Пользователь не авторизован');
      }

      const requestData = {
        ...newRequest,
        passenger_id: user.id
      };
      
      const { data, error } = await supabase
        .from('ride_requests')
        .insert([requestData])
        .select()
        .single();

      if (error) {
        console.error('useRideRequests - Ошибка создания заявки:', error);
        throw error;
      }
      
      console.log('useRideRequests - Заявка создана:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ride-requests'] });
      toast.success("Ваша заявка создана и отправлена водителям");
    },
    onError: (error) => {
      console.error('Create request error:', error);
      toast.error("Не удалось создать заявку");
    },
  });

  const respondToRequestMutation = useMutation({
    mutationFn: async ({ requestId, message }: { requestId: string; message: string }) => {
      console.log('useRideRequests - Отклик на заявку:', { requestId, message });
      
      if (!user) {
        throw new Error('Пользователь не авторизован');
      }

      // Получаем информацию о заявке для получения ID пассажира
      const { data: requestData, error: requestError } = await supabase
        .from('ride_requests')
        .select('passenger_id')
        .eq('id', requestId)
        .single();

      if (requestError || !requestData) {
        console.error('useRideRequests - Ошибка получения заявки:', requestError);
        throw requestError || new Error('Заявка не найдена');
      }

      // Проверяем, существует ли уже чат между этими пользователями
      const { data: existingChat, error: chatSearchError } = await supabase
        .from('chats')
        .select('id')
        .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${requestData.passenger_id}),and(participant1_id.eq.${requestData.passenger_id},participant2_id.eq.${user.id})`)
        .maybeSingle();

      let chatId: string;

      if (existingChat && !chatSearchError) {
        // Используем существующий чат
        chatId = existingChat.id;
        console.log('useRideRequests - Используем существующий чат:', chatId);
      } else {
        // Создаем новый чат между водителем и пассажиром
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .insert([{
            participant1_id: user.id, // водитель
            participant2_id: requestData.passenger_id, // пассажир
          }])
          .select()
          .single();

        if (chatError) {
          console.error('useRideRequests - Ошибка создания чата:', chatError);
          throw chatError;
        }

        chatId = chatData.id;
        console.log('useRideRequests - Создан новый чат:', chatId);
      }

      // Отправляем первое сообщение
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert([{
          chat_id: chatId,
          sender_id: user.id,
          content: message,
          message_type: 'text'
        }])
        .select()
        .single();

      if (messageError) {
        console.error('useRideRequests - Ошибка отправки сообщения:', messageError);
        throw messageError;
      }

      // Обновляем время последнего сообщения в чате
      await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', chatId);

      return { chatId, message: messageData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      toast.success("Ваш отклик отправлен пассажиру");
    },
    onError: (error) => {
      console.error('Respond to request error:', error);
      toast.error("Не удалось отправить отклик");
    },
  });

  return {
    requests,
    isLoading,
    error,
    createRequest: createRequestMutation.mutateAsync,
    respondToRequest: respondToRequestMutation.mutateAsync,
    isCreating: createRequestMutation.isPending,
    isResponding: respondToRequestMutation.isPending,
  };
};
