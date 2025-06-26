
import { useState, useEffect } from 'react';

export interface SearchHistoryItem {
  id: string;
  from_city: string;
  to_city: string;
  departure_date?: string;
  passengers_count?: number;
  timestamp: number;
}

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = () => {
    try {
      const stored = localStorage.getItem('yoldosh_search_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSearchHistory(parsed);
      }
    } catch (error) {
      console.error('Ошибка загрузки истории поиска:', error);
    }
  };

  const addToHistory = (searchParams: Omit<SearchHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: SearchHistoryItem = {
      ...searchParams,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    // Проверяем, есть ли уже такой поиск
    const exists = searchHistory.some(item => 
      item.from_city === searchParams.from_city && 
      item.to_city === searchParams.to_city &&
      item.departure_date === searchParams.departure_date &&
      item.passengers_count === searchParams.passengers_count
    );

    if (!exists) {
      const updatedHistory = [newItem, ...searchHistory].slice(0, 10); // Храним только последние 10
      setSearchHistory(updatedHistory);
      localStorage.setItem('yoldosh_search_history', JSON.stringify(updatedHistory));
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('yoldosh_search_history');
  };

  const removeFromHistory = (id: string) => {
    const updatedHistory = searchHistory.filter(item => item.id !== id);
    setSearchHistory(updatedHistory);
    localStorage.setItem('yoldosh_search_history', JSON.stringify(updatedHistory));
  };

  return {
    searchHistory,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
};
