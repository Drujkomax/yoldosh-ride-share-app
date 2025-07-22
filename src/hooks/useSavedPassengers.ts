import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

export interface SavedPassenger {
  id: string;
  user_id: string;
  saved_passenger_id: string;
  nickname?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data from profiles
  passenger_name?: string;
  passenger_avatar?: string;
  passenger_rating?: number;
  passenger_phone?: string;
}

export const useSavedPassengers = () => {
  const { user } = useUser();
  const [savedPassengers, setSavedPassengers] = useState<SavedPassenger[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSavedPassengers = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('saved_passengers')
        .select(`
          *,
          passenger:profiles!saved_passengers_saved_passenger_id_fkey(
            name,
            avatar_url,
            rating,
            phone
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching saved passengers:', error);
        return;
      }

      const transformedData = (data || []).map(item => ({
        ...item,
        passenger_name: item.passenger?.name,
        passenger_avatar: item.passenger?.avatar_url,
        passenger_rating: item.passenger?.rating,
        passenger_phone: item.passenger?.phone,
      }));

      setSavedPassengers(transformedData);
    } finally {
      setIsLoading(false);
    }
  };

  const addSavedPassenger = async (passengerId: string, nickname?: string, notes?: string) => {
    if (!user?.id) return false;

    try {
      const { data, error } = await supabase
        .from('saved_passengers')
        .insert({
          user_id: user.id,
          saved_passenger_id: passengerId,
          nickname,
          notes,
        })
        .select(`
          *,
          passenger:profiles!saved_passengers_saved_passenger_id_fkey(
            name,
            avatar_url,
            rating,
            phone
          )
        `)
        .single();

      if (error) {
        console.error('Error adding saved passenger:', error);
        toast.error('Ошибка при добавлении пассажира');
        return false;
      }

      const transformedData = {
        ...data,
        passenger_name: data.passenger?.name,
        passenger_avatar: data.passenger?.avatar_url,
        passenger_rating: data.passenger?.rating,
        passenger_phone: data.passenger?.phone,
      };

      setSavedPassengers(prev => [...prev, transformedData]);
      toast.success('Пассажир добавлен в сохраненные');
      return true;
    } catch (error) {
      console.error('Error adding saved passenger:', error);
      toast.error('Ошибка при добавлении пассажира');
      return false;
    }
  };

  const updateSavedPassenger = async (id: string, updates: Partial<Pick<SavedPassenger, 'nickname' | 'notes'>>) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('saved_passengers')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating saved passenger:', error);
        toast.error('Ошибка при обновлении данных');
        return false;
      }

      setSavedPassengers(prev =>
        prev.map(passenger =>
          passenger.id === id ? { ...passenger, ...updates } : passenger
        )
      );
      toast.success('Данные обновлены');
      return true;
    } catch (error) {
      console.error('Error updating saved passenger:', error);
      toast.error('Ошибка при обновлении данных');
      return false;
    }
  };

  const removeSavedPassenger = async (id: string) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('saved_passengers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing saved passenger:', error);
        toast.error('Ошибка при удалении пассажира');
        return false;
      }

      setSavedPassengers(prev => prev.filter(passenger => passenger.id !== id));
      toast.success('Пассажир удален из сохраненных');
      return true;
    } catch (error) {
      console.error('Error removing saved passenger:', error);
      toast.error('Ошибка при удалении пассажира');
      return false;
    }
  };

  useEffect(() => {
    fetchSavedPassengers();
  }, [user?.id]);

  return {
    savedPassengers,
    isLoading,
    addSavedPassenger,
    updateSavedPassenger,
    removeSavedPassenger,
    refetch: fetchSavedPassengers,
  };
};