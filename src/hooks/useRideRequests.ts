
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';

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

      return data.map(request => ({
        ...request,
        passenger: request.profiles
      })) as RideRequest[];
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async (newRequest: Omit<RideRequest, 'id' | 'created_at' | 'updated_at' | 'passenger'>) => {
      console.log('useRideRequests - Создание заявки:', newRequest);
      
      const { data, error } = await supabase
        .from('ride_requests')
        .insert([newRequest])
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

      // Создаем чат между водителем и пассажиром
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .insert([{
          participant1_id: user.id, // водитель
          participant2_id: (await supabase
            .from('ride_requests')
            .select('passenger_id')
            .eq('id', requestId)
            .single()).data?.passenger_id,
        }])
        .select()
        .single();

      if (chatError) {
        console.error('useRideRequests - Ошибка создания чата:', chatError);
        throw chatError;
      }

      // Отправляем первое сообщение
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert([{
          chat_id: chatData.id,
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

      return { chat: chatData, message: messageData };
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
