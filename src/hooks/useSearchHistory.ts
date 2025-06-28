
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
        // Сортируем по времени, самые новые сначала
        const sorted = parsed.sort((a: SearchHistoryItem, b: SearchHistoryItem) => b.timestamp - a.timestamp);
        setSearchHistory(sorted);
      }
    } catch (error) {
      console.error('Ошибка загрузки истории поиска:', error);
    }
  };

  const addToHistory = async (searchParams: {
    from_city: string;
    to_city: string;
    departure_date?: string;
    passengers_count?: number;
  }) => {
    const newItem: SearchHistoryItem = {
      ...searchParams,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    // Проверяем, есть ли уже такой поиск в последних 5 записях
    const recentSearches = searchHistory.slice(0, 5);
    const exists = recentSearches.some(item => 
      item.from_city === searchParams.from_city && 
      item.to_city === searchParams.to_city &&
      item.departure_date === searchParams.departure_date &&
      item.passengers_count === searchParams.passengers_count
    );

    if (!exists) {
      // Добавляем новый поиск в начало и ограничиваем до 10 записей
      const updatedHistory = [newItem, ...searchHistory].slice(0, 10);
      setSearchHistory(updatedHistory);
      
      try {
        localStorage.setItem('yoldosh_search_history', JSON.stringify(updatedHistory));
      } catch (error) {
        console.error('Ошибка сохранения истории поиска:', error);
      }
    } else {
      // Если поиск уже существует, обновляем его timestamp и перемещаем в начало
      const updatedHistory = searchHistory.filter(item => 
        !(item.from_city === searchParams.from_city && 
          item.to_city === searchParams.to_city &&
          item.departure_date === searchParams.departure_date &&
          item.passengers_count === searchParams.passengers_count)
      );
      const finalHistory = [newItem, ...updatedHistory].slice(0, 10);
      setSearchHistory(finalHistory);
      
      try {
        localStorage.setItem('yoldosh_search_history', JSON.stringify(finalHistory));
      } catch (error) {
        console.error('Ошибка сохранения истории поиска:', error);
      }
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('yoldosh_search_history');
  };

  const removeFromHistory = (id: string) => {
    const updatedHistory = searchHistory.filter(item => item.id !== id);
    setSearchHistory(updatedHistory);
    
    try {
      localStorage.setItem('yoldosh_search_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Ошибка удаления из истории поиска:', error);
    }
  };

  return {
    searchHistory,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
};