
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import AddressSearchPage from '@/components/AddressSearchPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Star, User, Users, ChevronLeft, Zap, Wifi, Loader2, Check, Edit3 } from 'lucide-react';
import { useRides } from '@/hooks/useRides';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { useGoogleGeocoding } from '@/hooks/useGoogleGeocoding';
import { toast } from 'sonner';

const SearchRides = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchRides } = useRides();
  const { getRouteInfo } = useGoogleGeocoding();
  const { user } = useUser();
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [routeInfoCache, setRouteInfoCache] = useState<{[key: string]: any}>({});
  const [loadingRoutes, setLoadingRoutes] = useState<{[key: string]: boolean}>({});
  const [activeTab, setActiveTab] = useState('all');
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);
  const [alertCreated, setAlertCreated] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const [addressSearchType, setAddressSearchType] = useState<'from' | 'to'>('from');
  const [editFilters, setEditFilters] = useState({
    from: '',
    to: '',
    date: '',
    seats: ''
  });

  useEffect(() => {
    const criteria = {
      from: searchParams.get('from') || '',
      to: searchParams.get('to') || '',
      date: searchParams.get('date') || '',
      seats: searchParams.get('seats') || ''
    };
    setSearchCriteria(criteria);
    setEditFilters(criteria);
    
    // Handle date selection from calendar
    const selectedDateParam = searchParams.get('selectedDate');
    if (selectedDateParam && selectedDateParam !== criteria.date) {
      const updatedCriteria = { ...criteria, date: selectedDateParam };
      setSearchCriteria(updatedCriteria);
      setEditFilters(updatedCriteria);
      
      // Update URL without selectedDate param
      const newParams = new URLSearchParams();
      if (updatedCriteria.from) newParams.set('from', updatedCriteria.from);
      if (updatedCriteria.to) newParams.set('to', updatedCriteria.to);
      if (updatedCriteria.date) newParams.set('date', updatedCriteria.date);
      if (updatedCriteria.seats) newParams.set('seats', updatedCriteria.seats);
      
      navigate(`/search-rides?${newParams.toString()}`, { replace: true });
      setIsInitialLoad(false);
      // Open edit modal to show updated criteria
      setIsEditModalOpen(true);
      return;
    }
    
    // Handle passenger count selection
    const passengerCountParam = searchParams.get('passengerCount');
    if (passengerCountParam && passengerCountParam !== criteria.seats) {
      const updatedCriteria = { ...criteria, seats: passengerCountParam };
      setSearchCriteria(updatedCriteria);
      setEditFilters(updatedCriteria);
      
      // Update URL without passengerCount param
      const newParams = new URLSearchParams();
      if (updatedCriteria.from) newParams.set('from', updatedCriteria.from);
      if (updatedCriteria.to) newParams.set('to', updatedCriteria.to);
      if (updatedCriteria.date) newParams.set('date', updatedCriteria.date);
      if (updatedCriteria.seats) newParams.set('seats', updatedCriteria.seats);
      
      navigate(`/search-rides?${newParams.toString()}`, { replace: true });
      setIsInitialLoad(false);
      // Open edit modal to show updated criteria
      setIsEditModalOpen(true);
      return;
    }
    
    // Auto search only on initial load if we have from, to, and date
    if (isInitialLoad && criteria.from && criteria.to && criteria.date) {
      performSearch(criteria);
    } 
    
    setIsInitialLoad(false);
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
      
      // Apply filters from URL parameters
      filteredResults = applyFilters(filteredResults);
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (rides: any[]) => {
    let filtered = [...rides];
    
    // Get filter parameters from URL
    const sort = searchParams.get('sort');
    const timeRanges = searchParams.get('timeRanges')?.split(',') || [];
    const trust = searchParams.get('trust')?.split(',') || [];
    const comforts = searchParams.get('comforts')?.split(',') || [];
    
    // Apply time range filters
    if (timeRanges.length > 0) {
      filtered = filtered.filter(ride => {
        const departureTime = ride.departure_time;
        if (!departureTime) return false;
        
        const [hours] = departureTime.split(':').map(Number);
        
        return timeRanges.some(range => {
          switch (range) {
            case 'morning':
              return hours >= 6 && hours < 12;
            case 'afternoon':
              return hours >= 12 && hours < 18;
            case 'evening':
              return hours >= 18;
            default:
              return false;
          }
        });
      });
    }
    
    // Apply trust filters
    if (trust.includes('verified')) {
      filtered = filtered.filter(ride => ride.driver_verified || ride.is_verified);
    }
    
    // Apply comfort filters
    if (comforts.length > 0) {
      filtered = filtered.filter(ride => {
        const settings = ride.comfort_settings || {};
        return comforts.some(comfort => {
          switch (comfort) {
            case 'max_two_back':
              return ride.available_seats <= 2;
            case 'instant_booking':
              return ride.instant_booking_enabled;
            case 'smoking':
              return settings.smoking_allowed;
            case 'pets':
              return settings.pets_allowed;
            case 'e_tickets':
              return true; // Предполагаем, что все рейсы поддерживают электронные билеты
            default:
              return false;
          }
        });
      });
    }
    
    // Apply sorting
    if (sort) {
      switch (sort) {
        case 'earliest':
          filtered.sort((a, b) => a.departure_time.localeCompare(b.departure_time));
          break;
        case 'cheapest':
          filtered.sort((a, b) => a.price_per_seat - b.price_per_seat);
          break;
        case 'departure_close':
        case 'arrival_close':
          // These would require location data to implement properly
          break;
        case 'shortest':
          filtered.sort((a, b) => (a.duration_hours || 2) - (b.duration_hours || 2));
          break;
      }
    }
    
    return filtered;
  };

  const fetchRouteInfo = async (ride: any) => {
    // Проверяем кэш
    const cacheKey = `${ride.from_city}-${ride.to_city}`;
    if (routeInfoCache[cacheKey]) {
      return routeInfoCache[cacheKey];
    }

    if (loadingRoutes[cacheKey]) {
      return null;
    }

    setLoadingRoutes(prev => ({ ...prev, [cacheKey]: true }));

    try {
      const route = await getRouteInfo(ride.from_city, ride.to_city);
      if (route) {
        setRouteInfoCache(prev => ({ ...prev, [cacheKey]: route }));
        return route;
      }
    } catch (error) {
      console.error('Error fetching route info:', error);
    } finally {
      setLoadingRoutes(prev => ({ ...prev, [cacheKey]: false }));
    }
    return null;
  };

  // Загружаем маршрутную информацию для всех результатов поиска
  useEffect(() => {
    if (searchResults.length > 0) {
      searchResults.forEach(ride => {
        if (ride.from_city && ride.to_city) {
          fetchRouteInfo(ride);
        }
      });
    }
  }, [searchResults]);

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

  const createRideAlert = async () => {
    console.log('createRideAlert called, user:', user);
    
    if (!user?.id) {
      console.log('No user ID found');
      toast.error('Необходимо войти в систему для создания уведомлений');
      return;
    }

    setIsCreatingAlert(true);
    try {
      // Get current user session to ensure auth context
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('Session check:', { session: !!session, error: sessionError });
      
      if (!session) {
        console.log('No session found');
        toast.error('Необходимо войти в систему');
        setIsCreatingAlert(false);
        return;
      }

      console.log('Creating ride alert with data:', {
        user_id: session.user.id,
        from_city: searchCriteria.from,
        to_city: searchCriteria.to,
        departure_date: searchCriteria.date || null,
        min_seats: searchCriteria.seats ? parseInt(searchCriteria.seats) : 1
      });

      const { error } = await supabase
        .from('ride_alerts')
        .insert({
          user_id: session.user.id,
          from_city: searchCriteria.from,
          to_city: searchCriteria.to,
          departure_date: searchCriteria.date || null,
          min_seats: searchCriteria.seats ? parseInt(searchCriteria.seats) : 1
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Ride alert created successfully');
      
      setTimeout(() => {
        setAlertCreated(true);
        toast.success('Уведомление создано! Мы сообщим вам о новых поездках');
      }, 1000);
    } catch (error) {
      console.error('Error creating ride alert:', error);
      toast.error('Ошибка при создании уведомления');
      setIsCreatingAlert(false);
    }
  };

  const handleAddressSelect = (address: string, coordinates: [number, number]) => {
    if (addressSearchType === 'from') {
      setEditFilters(prev => ({ ...prev, from: address }));
    } else {
      setEditFilters(prev => ({ ...prev, to: address }));
    }
    setShowAddressSearch(false);
  };

  const openAddressSearch = (type: 'from' | 'to') => {
    setAddressSearchType(type);
    setShowAddressSearch(true);
  };

  const handleEditSearch = () => {
    const newParams = new URLSearchParams();
    if (editFilters.from) newParams.set('from', editFilters.from);
    if (editFilters.to) newParams.set('to', editFilters.to);
    if (editFilters.date) newParams.set('date', editFilters.date);
    if (editFilters.seats) newParams.set('seats', editFilters.seats);
    
    navigate(`/search-rides?${newParams.toString()}`);
    setIsEditModalOpen(false);
    
    // Запускаем поиск с новыми параметрами
    performSearch({
      from: editFilters.from,
      to: editFilters.to, 
      date: editFilters.date,
      seats: editFilters.seats
    });
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
          {/* Search Summary Card */}
          <div 
            className="bg-gray-100 rounded-2xl p-4 cursor-pointer hover:bg-gray-200 transition-colors relative group"
            onClick={() => setIsEditModalOpen(true)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/passenger-search');
                  }}
                  className="p-2 hover:bg-gray-200 rounded-lg"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-600" />
                </Button>
                <div>
                  <h1 className="font-bold text-gray-900 text-lg">
                    {searchCriteria.from} → {searchCriteria.to}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {searchCriteria.date && format(new Date(searchCriteria.date), 'EEE dd MMM', { locale: ru })}, {searchCriteria.seats || '1'} пассажир
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  // Передаем текущие параметры поиска на страницу фильтров
                  const currentParams = new URLSearchParams(location.search);
                  navigate(`/search-filters?${currentParams.toString()}`);
                }}
                className="px-4 py-2 text-sm font-medium"
              >
                Фильтровать
              </Button>
            </div>
          </div>

          {/* Filter Drawer */}
          {isEditModalOpen && (
            <div className="fixed inset-0 z-50">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
                onClick={() => setIsEditModalOpen(false)}
              />
              
              {/* Drawer */}
              <div className={`absolute top-0 left-0 right-0 bg-white shadow-lg transition-transform duration-300 ease-out ${
                isEditModalOpen ? 'translate-y-0' : '-translate-y-full'
              }`}>
                <div className="p-6 pb-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Уточните поисковый запрос</h2>
                    <button
                      onClick={() => setIsEditModalOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6 text-gray-600 rotate-90" />
                    </button>
                  </div>

                  {/* Search Form */}
                  <div className="space-y-4">
                    {/* From City */}
                    <div className="relative">
                      <div 
                        className="flex items-center space-x-3 p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => openAddressSearch('from')}
                      >
                        <div className="w-3 h-3 border-2 border-blue-500 rounded-full flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-lg font-medium text-gray-900">
                            {editFilters.from || 'Откуда'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => setEditFilters(prev => ({ 
                          ...prev, 
                          from: prev.to, 
                          to: prev.from 
                        }))}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <ArrowLeft className="h-5 w-5 rotate-90" />
                      </button>
                    </div>

                    {/* To City */}
                    <div className="relative">
                      <div 
                        className="flex items-center space-x-3 p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => openAddressSearch('to')}
                      >
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-lg font-medium text-gray-900">
                            {editFilters.to || 'Куда'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Date */}
                    <div 
                      className="flex items-center space-x-3 p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        const params = new URLSearchParams();
                        if (editFilters.from) params.set('from', editFilters.from);
                        if (editFilters.to) params.set('to', editFilters.to);
                        if (editFilters.seats) params.set('seats', editFilters.seats);
                        if (editFilters.date) params.set('selectedDate', editFilters.date);
                        params.set('returnTo', '/search-rides');
                        navigate(`/full-screen-calendar?${params.toString()}`);
                      }}
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
                        <div className="w-4 h-4 border border-gray-400 rounded grid grid-cols-2 gap-px">
                          <div className="bg-gray-300 rounded-tl"></div>
                          <div className="bg-gray-300 rounded-tr"></div>
                          <div className="bg-gray-300"></div>
                          <div className="bg-gray-300 rounded-br"></div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-medium text-gray-900">
                          {editFilters.date ? format(new Date(editFilters.date), 'EEE dd MMM', { locale: ru }) : 'Выберите дату'}
                        </div>
                      </div>
                    </div>

                    {/* Passengers */}
                    <div 
                      className="flex items-center space-x-3 p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        const params = new URLSearchParams();
                        if (editFilters.from) params.set('from', editFilters.from);
                        if (editFilters.to) params.set('to', editFilters.to);
                        if (editFilters.date) params.set('date', editFilters.date);
                        params.set('returnTo', '/search-rides');
                        params.set('currentCount', editFilters.seats || '1');
                        navigate(`/passenger-count?${params.toString()}`);
                      }}
                    >
                      <User className="h-6 w-6 text-gray-400" />
                      <div className="flex-1">
                        <div className="text-lg font-medium text-gray-900">
                          {editFilters.seats || '1'} пассажир{editFilters.seats === '1' ? '' : editFilters.seats && parseInt(editFilters.seats) > 4 ? 'ов' : 'а'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Search Button */}
                  <Button 
                    onClick={handleEditSearch}
                    className="w-full mt-6 h-12 text-lg font-medium bg-blue-500 hover:bg-blue-600 rounded-2xl"
                    disabled={!editFilters.from || !editFilters.to}
                  >
                    Поиск
                  </Button>
                </div>
              </div>
            </div>
          )}

      {/* Address Search Modal */}
      {showAddressSearch && (
        <div className="fixed inset-0 z-50 bg-white">
          <AddressSearchPage
            title={addressSearchType === 'from' ? 'Откуда' : 'Куда'}
            onAddressSelect={handleAddressSelect}
            onBack={() => setShowAddressSearch(false)}
            placeholder={addressSearchType === 'from' ? 'Введите город отправления' : 'Введите город назначения'}
            previousSelection={addressSearchType === 'to' ? searchCriteria.from : undefined}
          />
        </div>
      )}
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
        {hasSearched && filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">
              Поездки не найдены
            </div>
            <div className="text-gray-500 text-sm">
              Попробуйте изменить параметры поиска
            </div>
          </div>
        ) : filteredResults.length === 0 && activeTab === 'bus' ? (
          <div className="text-center py-12">
            <div className="text-gray-800 text-xl font-bold mb-4">
              {searchCriteria.date && formatDate(searchCriteria.date)}
            </div>
            <div className="text-gray-600 text-lg mb-6">
              No bus rides for this day
            </div>
            <Button 
              onClick={createRideAlert}
              disabled={isCreatingAlert || alertCreated}
              className={`
                ${alertCreated 
                  ? 'bg-green-500 hover:bg-green-500 w-12 h-12 rounded-full p-0' 
                  : isCreatingAlert 
                    ? 'bg-blue-500 hover:bg-blue-500 w-12 h-12 rounded-full p-0' 
                    : 'bg-white text-blue-500 border-2 border-blue-500 hover:bg-blue-50 rounded-full px-8 py-3'
                } 
                font-semibold transition-all duration-300
              `}
            >
              {alertCreated ? (
                <Check className="h-6 w-6 text-white" />
              ) : isCreatingAlert ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                'Создать уведомление'
              )}
            </Button>
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

            {filteredResults.map((ride) => {
              const cacheKey = `${ride.from_city}-${ride.to_city}`;
              const routeInfo = routeInfoCache[cacheKey];
              const isLoadingRoute = loadingRoutes[cacheKey];
              
              // Показываем индикатор загрузки, пока загружается информация о маршруте
              if (isLoadingRoute) {
                return (
                  <Card 
                    key={ride.id} 
                    className="bg-white shadow-sm border border-gray-200"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              
              return (
                <Card 
                  key={ride.id} 
                  className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer mb-4"
                  onClick={() => navigate(`/ride-details/${ride.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      {/* Left side - Route with times */}
                      <div className="flex items-center space-x-4">
                        {/* Vertical Route line with times and cities */}
                        <div className="flex flex-col space-y-2">
                          {/* Departure */}
                          <div className="flex items-center space-x-3">
                            <div className="text-xl font-semibold text-gray-900">
                              {formatTime(ride.departure_time)}
                            </div>
                            <div className="w-3 h-3 bg-white border-2 border-teal-600 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-800">{ride.from_city}</span>
                          </div>
                          
                          {/* Duration line */}
                          <div className="flex items-center space-x-3">
                            <div className="text-xs text-gray-500 w-16">
                              {(() => {
                                if (routeInfo?.duration) {
                                  return routeInfo.duration;
                                }
                                return `${Math.floor(ride.duration_hours || 2)}ч${((ride.duration_hours || 2) % 1 * 60).toFixed(0).padStart(2, '0')}`;
                              })()}
                            </div>
                            <div className="w-0.5 h-6 bg-teal-600 ml-1"></div>
                          </div>
                          
                          {/* Arrival */}
                          <div className="flex items-center space-x-3">
                            <div className="text-xl font-semibold text-gray-900">
                              {(() => {
                                if (routeInfo?.duration) {
                                  const [hours, minutes] = ride.departure_time.split(':').map(Number);
                                  const durationText = routeInfo.duration;
                                  const hoursMatch = durationText.match(/(\d+)\s*ч/);
                                  const minutesMatch = durationText.match(/(\d+)\s*мин/);
                                  
                                  const durationHours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
                                  const durationMinutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
                                  
                                  const arrivalTime = new Date();
                                  arrivalTime.setHours(hours + durationHours);
                                  arrivalTime.setMinutes(minutes + durationMinutes);
                                  
                                  return formatTime(arrivalTime.toTimeString());
                                }
                                
                                const [hours, minutes] = ride.departure_time.split(':').map(Number);
                                const durationHours = Math.floor(ride.duration_hours || 2);
                                const durationMinutes = Math.round(((ride.duration_hours || 2) % 1) * 60);
                                
                                const arrivalTime = new Date();
                                arrivalTime.setHours(hours + durationHours);
                                arrivalTime.setMinutes(minutes + durationMinutes);
                                
                                return formatTime(arrivalTime.toTimeString());
                              })()}
                            </div>
                            <div className="w-3 h-3 bg-white border-2 border-teal-600 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-800">{ride.to_city}</span>
                          </div>
                        </div>
                        
                        {/* +1 indicator */}
                        <div className="text-xs text-gray-500 self-end mb-2">+1</div>
                      </div>
                      
                      {/* Right side - Price */}
                      <div className="text-right ml-6">
                        <div className="text-2xl font-bold text-gray-900">
                          {Math.floor(ride.price_per_seat).toLocaleString('ru-RU')}
                          <span className="text-lg font-normal">,00</span>
                          <span className="text-lg font-normal"> ₽</span>
                        </div>
                        {ride.available_seats <= 2 && (
                          <div className="text-sm text-orange-600 font-medium mt-1">
                            {ride.available_seats === 1 ? '1 место по этой цене' : `${ride.available_seats} места по этой цене`}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Driver Info */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-800">
                              {ride.driver?.name || 'Андрей'}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium text-gray-700">
                                {ride.driver?.rating || '4.9'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right side icons */}
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center">
                          <span className="text-xs text-gray-600">🚗</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* No seats indicator */}
                    {ride.available_seats === 0 && (
                      <div className="absolute top-3 right-3 bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                        Мест нет
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            
            {/* Create ride alert button */}
            {filteredResults.length > 0 && (
              <div className="text-center pt-6">
                <Button 
                  onClick={createRideAlert}
                  disabled={isCreatingAlert || alertCreated}
                  className={`
                    ${alertCreated 
                      ? 'bg-green-500 hover:bg-green-500 w-12 h-12 rounded-full p-0' 
                      : isCreatingAlert 
                        ? 'bg-blue-500 hover:bg-blue-500 w-12 h-12 rounded-full p-0' 
                        : 'bg-white text-blue-500 border-2 border-blue-500 hover:bg-blue-50 rounded-full px-8 py-3'
                    } 
                    font-semibold transition-all duration-300
                  `}
                >
                  {alertCreated ? (
                    <Check className="h-6 w-6 text-white" />
                  ) : isCreatingAlert ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    'Создать уведомление'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchRides;
