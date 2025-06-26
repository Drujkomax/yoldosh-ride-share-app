
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  rating: number;
  comment?: string;
  review_type: 'driver_to_passenger' | 'passenger_to_driver';
  created_at: string;
  updated_at: string;
  reviewer?: {
    name: string;
    phone: string;
  };
  reviewed_user?: {
    name: string;
    phone: string;
  };
  booking?: {
    ride: {
      from_city: string;
      to_city: string;
      departure_date: string;
    };
  };
}

export const useReviews = (userId?: string) => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const targetUserId = userId || user?.id;

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', targetUserId],
    queryFn: async () => {
      console.log('useReviews - Загрузка отзывов для пользователя:', targetUserId);
      
      if (!targetUserId) {
        return [];
      }

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles!reviews_reviewer_id_fkey (
            name,
            phone
          ),
          reviewed_user:profiles!reviews_reviewed_user_id_fkey (
            name,
            phone
          ),
          booking:bookings (
            ride:rides (
              from_city,
              to_city,
              departure_date
            )
          )
        `)
        .eq('reviewed_user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useReviews - Ошибка загрузки отзывов:', error);
        throw error;
      }

      console.log('useReviews - Загружено отзывов:', data?.length || 0);
      return data as Review[];
    },
    enabled: !!targetUserId,
  });

  const createReviewMutation = useMutation({
    mutationFn: async (newReview: {
      booking_id: string;
      reviewed_user_id: string;
      rating: number;
      comment?: string;
      review_type: 'driver_to_passenger' | 'passenger_to_driver';
    }) => {
      console.log('useReviews - Создание отзыва:', newReview);
      
      if (!user) {
        throw new Error('Пользователь не авторизован');
      }

      const reviewData = {
        ...newReview,
        reviewer_id: user.id
      };
      
      const { data, error } = await supabase
        .from('reviews')
        .insert([reviewData])
        .select()
        .single();

      if (error) {
        console.error('useReviews - Ошибка создания отзыва:', error);
        throw error;
      }
      
      // Обновляем рейтинг пользователя
      await updateUserRating(newReview.reviewed_user_id);
      
      console.log('useReviews - Отзыв создан:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success("Отзыв успешно оставлен");
    },
    onError: (error: any) => {
      console.error('Create review error:', error);
      if (error.code === '23505') {
        toast.error("Вы уже оставили отзыв для этой поездки");
      } else {
        toast.error("Не удалось оставить отзыв");
      }
    },
  });

  const updateUserRating = async (userId: string) => {
    try {
      // Получаем все отзывы пользователя для пересчета рейтинга
      const { data: userReviews, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewed_user_id', userId);

      if (error) {
        console.error('Ошибка получения отзывов для пересчета рейтинга:', error);
        return;
      }

      if (userReviews && userReviews.length > 0) {
        const avgRating = userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length;
        
        // Обновляем рейтинг в профиле
        await supabase
          .from('profiles')
          .update({ 
            rating: Math.round(avgRating * 10) / 10, // Округляем до 1 знака после запятой
            total_rides: userReviews.length
          })
          .eq('id', userId);

        console.log('Рейтинг пользователя обновлен:', avgRating);
      }
    } catch (error) {
      console.error('Ошибка обновления рейтинга:', error);
    }
  };

  // Получение отзывов, которые нужно оставить
  const { data: pendingReviews = [] } = useQuery({
    queryKey: ['pending-reviews', user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log('useReviews - Загрузка ожидающих отзывов');

      // Находим завершенные бронирования без отзывов
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          ride:rides (
            *,
            driver:profiles!rides_driver_id_fkey (
              name,
              phone
            )
          )
        `)
        .or(`passenger_id.eq.${user.id},ride.driver_id.eq.${user.id}`)
        .eq('status', 'completed');

      if (error) {
        console.error('Ошибка получения завершенных бронирований:', error);
        return [];
      }

      // Фильтруем те, для которых еще не оставлен отзыв
      const bookingsNeedingReview = [];
      
      for (const booking of data || []) {
        const { data: existingReview } = await supabase
          .from('reviews')
          .select('id')
          .eq('booking_id', booking.id)
          .eq('reviewer_id', user.id)
          .maybeSingle();

        if (!existingReview) {
          bookingsNeedingReview.push(booking);
        }
      }

      return bookingsNeedingReview;
    },
    enabled: !!user,
  });

  return {
    reviews,
    isLoading,
    createReview: createReviewMutation.mutateAsync,
    isCreating: createReviewMutation.isPending,
    pendingReviews,
  };
};
