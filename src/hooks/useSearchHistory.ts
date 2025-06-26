
import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';

export interface SearchHistoryItem {
  id: string;
  from_city: string;
  to_city: string;
  departure_date?: string;
  searchCount: number;
  lastSearched: string;
}

export const useSearchHistory = () => {
  const { user } = useUser();
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  const storageKey = `search_history_${user?.id || 'guest'}`;

  useEffect(() => {
    // Загружаем историю поиска из localStorage
    const loadSearchHistory = () => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          setSearchHistory(parsed);
          console.log('История поиска загружена:', parsed.length, 'записей');
        }
      } catch (error) {
        console.error('Ошибка загрузки истории поиска:', error);
      }
    };

    loadSearchHistory();
  }, [storageKey]);

  const addToHistory = (searchParams: {
    from_city: string;
    to_city: string;
    departure_date?: string;
  }) => {
    try {
      const newHistory = [...searchHistory];
      
      // Проверяем, есть ли уже такой поиск
      const existingIndex = newHistory.findIndex(
        item => 
          item.from_city === searchParams.from_city && 
          item.to_city === searchParams.to_city &&
          item.departure_date === searchParams.departure_date
      );

      if (existingIndex !== -1) {
        // Обновляем существующую запись
        newHistory[existingIndex] = {
          ...newHistory[existingIndex],
          searchCount: newHistory[existingIndex].searchCount + 1,
          lastSearched: new Date().toISOString()
        };
      } else {
        // Добавляем новую запись
        const newItem: SearchHistoryItem = {
          id: Date.now().toString(),
          ...searchParams,
          searchCount: 1,
          lastSearched: new Date().toISOString()
        };
        newHistory.unshift(newItem);
      }

      // Ограничиваем количество записей (максимум 20)
      const limitedHistory = newHistory.slice(0, 20);
      
      setSearchHistory(limitedHistory);
      localStorage.setItem(storageKey, JSON.stringify(limitedHistory));
      
      console.log('Добавлено в историю поиска:', searchParams);
    } catch (error) {
      console.error('Ошибка добавления в историю поиска:', error);
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(storageKey);
    console.log('История поиска очищена');
  };

  const removeFromHistory = (id: string) => {
    const newHistory = searchHistory.filter(item => item.id !== id);
    setSearchHistory(newHistory);
    localStorage.setItem(storageKey, JSON.stringify(newHistory));
    console.log('Удалено из истории поиска:', id);
  };

  // Получаем популярные направления (топ-5 по количеству поисков)
  const getPopularRoutes = () => {
    return searchHistory
      .sort((a, b) => b.searchCount - a.searchCount)
      .slice(0, 5);
  };

  // Получаем недавние поиски (топ-10 по времени)
  const getRecentSearches = () => {
    return searchHistory
      .sort((a, b) => new Date(b.lastSearched).getTime() - new Date(a.lastSearched).getTime())
      .slice(0, 10);
  };

  return {
    searchHistory,
    addToHistory,
    clearHistory,
    removeFromHistory,
    getPopularRoutes,
    getRecentSearches,
  };
};
