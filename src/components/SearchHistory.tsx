
import React from 'react';
import { Clock, MapPin, Users, Calendar, X } from 'lucide-react';
import { useSearchHistory } from '@/hooks/useSearchHistory';

interface SearchHistoryProps {
  onSelectHistory: (item: {
    from_city: string;
    to_city: string;
    departure_date?: string;
    passengers_count?: number;
  }) => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ onSelectHistory }) => {
  const { searchHistory, removeFromHistory, clearHistory } = useSearchHistory();

  if (searchHistory.length === 0) {
    return null;
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-800">История поиска</h3>
        </div>
        <button
          onClick={clearHistory}
          className="text-xs text-gray-500 hover:text-red-500 transition-colors"
        >
          Очистить всё
        </button>
      </div>
      
      <div className="space-y-2">
        {searchHistory.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group"
            onClick={() => onSelectHistory({
              from_city: item.from_city,
              to_city: item.to_city,
              departure_date: item.departure_date,
              passengers_count: item.passengers_count
            })}
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-800">
                  {item.from_city} → {item.to_city}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                {item.departure_date && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(item.departure_date)}</span>
                  </div>
                )}
                {item.passengers_count && (
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{item.passengers_count} пас.</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFromHistory(item.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchHistory;
