
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Trash2, TrendingUp } from 'lucide-react';
import { useSearchHistory, SearchHistoryItem } from '@/hooks/useSearchHistory';

interface SearchHistoryProps {
  onApplySearch: (searchParams: {
    from_city: string;
    to_city: string;
    departure_date?: string;
  }) => void;
}

const SearchHistory = ({ onApplySearch }: SearchHistoryProps) => {
  const { 
    searchHistory, 
    clearHistory, 
    removeFromHistory, 
    getPopularRoutes, 
    getRecentSearches 
  } = useSearchHistory();

  const popularRoutes = getPopularRoutes();
  const recentSearches = getRecentSearches();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };

  const handleSearchClick = (item: SearchHistoryItem) => {
    onApplySearch({
      from_city: item.from_city,
      to_city: item.to_city,
      departure_date: item.departure_date
    });
  };

  if (searchHistory.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>История поиска пуста</p>
          <p className="text-sm">Ваши поиски будут сохраняться здесь</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Популярные маршруты */}
      {popularRoutes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Популярные маршруты
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {popularRoutes.map((item) => (
              <div
                key={`popular-${item.id}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => handleSearchClick(item)}
              >
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-yoldosh-blue" />
                  <div>
                    <p className="font-medium text-sm">
                      {item.from_city} → {item.to_city}
                    </p>
                    {item.departure_date && (
                      <p className="text-xs text-gray-500">
                        {formatDate(item.departure_date)}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {item.searchCount} раз
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Недавние поиски */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Недавние поиски
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentSearches.map((item) => (
            <div
              key={`recent-${item.id}`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors group"
              onClick={() => handleSearchClick(item)}
            >
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium text-sm">
                    {item.from_city} → {item.to_city}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>
                      {formatDate(item.lastSearched)}
                    </span>
                    {item.departure_date && (
                      <>
                        <span>•</span>
                        <span>{formatDate(item.departure_date)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromHistory(item.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchHistory;
