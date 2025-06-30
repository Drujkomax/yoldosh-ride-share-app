
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Star, User, Users, ChevronLeft } from 'lucide-react';
import { useRides } from '@/hooks/useRides';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const SearchRides = () => {
  const navigate = useNavigate();
  const { searchRides } = useRides();
  const [searchParams] = useSearchParams();
  const [searchCriteria, setSearchCriteria] = useState({
    from: '',
    to: '',
    date: '',
    seats: ''
  });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const criteria = {
      from: searchParams.get('from') || '',
      to: searchParams.get('to') || '',
      date: searchParams.get('date') || '',
      seats: searchParams.get('seats') || ''
    };
    setSearchCriteria(criteria);
    
    // Auto search if we have from, to, and date
    if (criteria.from && criteria.to && criteria.date) {
      performSearch(criteria);
    }
  }, [searchParams]);

  const performSearch = async (criteria = searchCriteria) => {
    if (!criteria.from || !criteria.to) return;
    
    setIsLoading(true);
    setHasSearched(true);
    try {
      const searchData = {
        from_city: criteria.from,
        to_city: criteria.to,
        departure_date: criteria.date || undefined
      };
      
      const results = await searchRides(searchData);
      console.log('Search results:', results);
      
      // Filter by available seats if specified
      let filteredResults = results;
      if (criteria.seats) {
        const requiredSeats = parseInt(criteria.seats);
        filteredResults = results.filter(ride => ride.available_seats >= requiredSeats);
      }
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'dd MMMM yyyy', { locale: ru });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    try {
      return timeStr.slice(0, 5); // Get HH:MM format
    } catch {
      return timeStr;
    }
  };

  const getTabCounts = () => {
    const all = searchResults.length;
    const carpool = searchResults.filter(ride => ride.available_seats <= 4).length;
    const bus = searchResults.filter(ride => ride.available_seats > 4).length;
    return { all, carpool, bus };
  };

  const getFilteredResults = () => {
    if (activeTab === 'carpool') {
      return searchResults.filter(ride => ride.available_seats <= 4);
    }
    if (activeTab === 'bus') {
      return searchResults.filter(ride => ride.available_seats > 4);
    }
    return searchResults;
  };

  const { all, carpool, bus } = getTabCounts();
  const filteredResults = getFilteredResults();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </Button>
          </div>
          
          {/* Search Summary */}
          <div className="mt-4">
            <h1 className="font-bold text-gray-900 text-lg">
              {searchCriteria.from} → {searchCriteria.to}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {searchCriteria.date && format(new Date(searchCriteria.date), 'EEE dd MMM', { locale: ru })}, {searchCriteria.seats || '1'} пассажир
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-4 text-center font-medium ${
              activeTab === 'all' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500'
            }`}
          >
            <div>Все</div>
            <div className="text-sm font-normal text-gray-400">{all}</div>
          </button>
          <button
            onClick={() => setActiveTab('carpool')}
            className={`flex-1 py-4 text-center font-medium ${
              activeTab === 'carpool' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500'
            }`}
          >
            <div>Попутчики</div>
            <div className="text-sm font-normal text-gray-400">{carpool}</div>
          </button>
          <button
            onClick={() => setActiveTab('bus')}
            className={`flex-1 py-4 text-center font-medium ${
              activeTab === 'bus' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500'
            }`}
          >
            <div>Автобус</div>
            <div className="text-sm font-normal text-gray-400">{bus}</div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Поиск поездок...</div>
          </div>
        ) : hasSearched && filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">
              Поездки не найдены
            </div>
            <div className="text-gray-500 text-sm">
              Попробуйте изменить параметры поиска
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Date Section */}
            {filteredResults.length > 0 && searchCriteria.date && (
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                  {formatDate(searchCriteria.date)}
                </h2>
              </div>
            )}

            {filteredResults.map((ride) => (
              <Card key={ride.id} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {/* Time and Route */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">
                            {formatTime(ride.departure_time)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.floor(ride.duration_hours || 2)}ч{((ride.duration_hours || 2) % 1 * 60).toFixed(0).padStart(2, '0')}
                          </div>
                        </div>
                        
                        <div className="flex-1 relative">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="flex-1 h-px bg-gray-300 mx-2"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                          <div className="flex justify-between text-xs mt-1 text-gray-600">
                            <span>{ride.from_city}</span>
                            <span>{ride.to_city}</span>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">
                            {formatTime(ride.estimated_arrival_time?.split('T')[1] || '00:00')}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-gray-900">
                        £{Math.floor(ride.price_per_seat)}
                        <span className="text-sm font-normal text-gray-500">
                          .{String((ride.price_per_seat % 1) * 100).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Driver Info */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">
                            {ride.driver?.name || 'Водитель'}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">
                              {ride.driver?.rating || '5.0'}
                            </span>
                          </div>
                        </div>
                        {ride.car_model && (
                          <div className="text-xs text-gray-500">
                            {ride.car_model} {ride.car_color && `• ${ride.car_color}`}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{ride.available_seats}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchRides;
