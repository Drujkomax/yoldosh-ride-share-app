
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Clock, Star, User, ChevronRight, Share2, FileText, AlertTriangle, PawPrint, Users, Shield, CreditCard, MessageSquare } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { useUser } from '@/contexts/UserContext';
import BottomNavigation from '@/components/BottomNavigation';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const MyTripsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: userLoading } = useUser();
  const { bookings, isLoading, error } = useBookings();
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);

  // Redirect to registration if not authenticated
  React.useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      navigate('/registration');
    }
  }, [isAuthenticated, userLoading, navigate]);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'EEE dd MMM', { locale: ru });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      return timeStr.slice(0, 5);
    } catch {
      return timeStr;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Завершена';
      case 'confirmed':
        return 'Подтверждена';
      case 'pending':
        return 'Ожидает';
      case 'cancelled':
        return 'Отменена';
      default:
        return 'Неизвестно';
    }
  };

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white border-b">
          <div className="px-4 py-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/passenger')}
                className="p-2 mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Your rides</h1>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Загрузка...</div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white border-b">
          <div className="px-4 py-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/passenger')}
                className="p-2 mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Your rides</h1>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Загрузка поездок...</div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white border-b">
          <div className="px-4 py-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/passenger')}
                className="p-2 mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Your rides</h1>
            </div>
          </div>
        </div>
        <div className="px-4 py-8">
          <Card className="bg-white rounded-2xl shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="text-red-500 text-lg mb-2">Ошибка загрузки</div>
              <div className="text-gray-500 text-sm mb-6">
                Не удалось загрузить поездки. Попробуйте обновить страницу.
              </div>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Обновить
              </Button>
            </CardContent>
          </Card>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // Separate current and archived rides
  const currentRides = bookings.filter(booking => 
    booking.status === 'confirmed' || booking.status === 'pending'
  );
  const archivedRides = bookings.filter(booking => 
    booking.status === 'completed' || booking.status === 'cancelled'
  );

  const TripCard = ({ booking, isArchived = false }: { booking: any, isArchived?: boolean }) => {
    const isSelected = selectedTrip === booking.id;
    
    return (
      <Card 
        className={`bg-white rounded-2xl shadow-sm border-0 mb-4 transition-all duration-300 hover:shadow-md ${
          isSelected ? 'ring-2 ring-blue-200' : ''
        }`}
        onClick={() => setSelectedTrip(isSelected ? null : booking.id)}
      >
        <CardContent className="p-6">
          {/* Date Header */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {formatDate(booking.ride?.departure_date || '')}
            </h3>
          </div>

          {/* Route */}
          <div className="mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="w-0.5 h-8 bg-blue-500 opacity-30"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {formatTime(booking.ride?.departure_time || '')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.ride?.from_city}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {/* Calculate arrival time */}
                      {formatTime(booking.ride?.departure_time || '')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.ride?.to_city}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Driver Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {booking.ride?.driver?.name || 'Водитель'}
                </div>
                {booking.ride?.driver?.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-600">
                      {booking.ride.driver.rating}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Badge className={getStatusColor(booking.status)}>
              {getStatusText(booking.status)}
            </Badge>
          </div>

          {/* Expanded Details */}
          {isSelected && (
            <div className="mt-6 pt-6 border-t border-gray-100 animate-fade-in">
              <div className="space-y-4">
                {/* Price Details */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Оплачено онлайн</span>
                    <span className="text-lg font-bold text-gray-900">
                      £{(booking.total_price / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.seats_booked} место{booking.seats_booked > 1 ? (booking.seats_booked > 4 ? '' : 'а') : ''}
                  </div>
                </div>

                {/* Car Details */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">MERCEDES CLASSE E</div>
                    <div className="text-sm text-gray-500">Grey</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>

                {/* Trip Features */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Passenger bookings won't be confirmed until you approve their request
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Max. 2 in the back</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PawPrint className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Pets are welcome</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement share functionality
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share ride
                  </Button>
                  <Button 
                    className="flex-1 bg-blue-500 hover:bg-blue-600 rounded-xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement manage ride functionality
                    }}
                  >
                    Manage ride
                  </Button>
                </div>

                {/* Additional Actions */}
                <div className="space-y-2 pt-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-blue-500 hover:text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement add to calendar
                    }}
                  >
                    Add to calendar
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-blue-500 hover:text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement see ride offer
                    }}
                  >
                    See ride offer
                  </Button>
                  {booking.status === 'confirmed' && (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-blue-500 hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement modify/cancel booking
                      }}
                    >
                      Modify or cancel booking
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/passenger')}
              className="p-2 mr-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Your rides</h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {bookings.length === 0 ? (
          <Card className="bg-white rounded-2xl shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 text-lg mb-2">Поездок пока нет</div>
              <div className="text-gray-500 text-sm mb-6">
                Забронируйте свою первую поездку и она появится здесь
              </div>
              <Button 
                onClick={() => navigate('/passenger')}
                className="bg-blue-500 hover:bg-blue-600 rounded-xl"
              >
                Найти поездку
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Current Rides */}
            {currentRides.length > 0 && (
              <div className="space-y-4">
                {currentRides.map((booking) => (
                  <TripCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}

            {/* Archived Rides */}
            {archivedRides.length > 0 && (
              <div>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-4 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
                  onClick={() => navigate('/ride-history')}
                >
                  <span className="text-base font-medium">Archived rides</span>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default MyTripsPage;
