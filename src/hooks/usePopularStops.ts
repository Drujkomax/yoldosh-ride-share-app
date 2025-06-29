
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PopularStop {
  id: string;
  city_name: string;
  stop_name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  popularity_score: number;
}

export const usePopularStops = () => {
  const getPopularStopsForCity = async (cityName: string): Promise<PopularStop[]> => {
    console.log('usePopularStops - Загрузка популярных остановок для города:', cityName);
    
    const { data, error } = await supabase
      .from('popular_stops')
      .select('*')
      .eq('city_name', cityName)
      .order('popularity_score', { ascending: false });

    if (error) {
      console.error('usePopularStops - Ошибка при загрузке остановок:', error);
      throw error;
    }

    console.log('usePopularStops - Загружено остановок:', data?.length || 0);
    return data || [];
  };

  const getPopularStopsByCategory = async (cityName: string, category: string): Promise<PopularStop[]> => {
    const { data, error } = await supabase
      .from('popular_stops')
      .select('*')
      .eq('city_name', cityName)
      .eq('category', category)
      .order('popularity_score', { ascending: false });

    if (error) {
      console.error('usePopularStops - Ошибка при загрузке остановок по категории:', error);
      throw error;
    }

    return data || [];
  };

  return {
    getPopularStopsForCity,
    getPopularStopsByCategory,
  };
};
