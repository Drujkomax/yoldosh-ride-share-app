
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { toast } from 'sonner';

const SearchRides = () => {
  const navigate = useNavigate();
  const { searchRides } = useRides();
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
      return;
    }
    
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
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </Button>
          </div>
          
          {/* Search Summary Card */}
          <div 
            className="bg-gray-100 rounded-2xl p-4 cursor-pointer hover:bg-gray-200 transition-colors relative group"
            onClick={() => setIsEditModalOpen(true)}
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit3 className="h-4 w-4 text-gray-500" />
            </div>
            <h1 className="font-bold text-gray-900 text-lg">
              {searchCriteria.from} → {searchCriteria.to}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {searchCriteria.date && format(new Date(searchCriteria.date), 'EEE dd MMM', { locale: ru })}, {searchCriteria.seats || '1'} пассажир
            </p>
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
                    <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
                      <User className="h-6 w-6 text-gray-400" />
                      <Input
                        type="number"
                        min="1"
                        max="8"
                        value={editFilters.seats}
                        onChange={(e) => setEditFilters(prev => ({ ...prev, seats: e.target.value }))}
                        placeholder="1"
                        className="border-0 text-lg font-medium p-0 focus:ring-0 bg-transparent"
                      />
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

            {filteredResults.map((ride) => (
              <Card 
                key={ride.id} 
                className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/ride-details/${ride.id}`)}
              >
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
                            <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                            <div className="flex-1 h-px bg-gray-300 mx-2"></div>
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
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
                         {Math.floor(ride.price_per_seat).toLocaleString('uz-UZ')}
                         <span className="text-sm font-normal text-gray-500"> сум</span>
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
                     
                     <div className="flex items-center space-x-3">
                       {/* Amenities icons */}
                       <div className="flex space-x-1">
                         <Zap className="h-4 w-4 text-gray-400" />
                         <Wifi className="h-4 w-4 text-gray-400" />
                       </div>
                       
                       {/* Available seats */}
                       <div className="flex items-center space-x-1">
                         <Users className="h-4 w-4 text-gray-400" />
                         <span className="text-sm text-gray-600">{ride.available_seats}</span>
                       </div>
                     </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
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
