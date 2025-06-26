
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Eye, Edit, Power, MapPin, Calendar, Users } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useRides } from '@/hooks/useRides';
import { useDriverBookings } from '@/hooks/useDriverBookings';
import BookingRequestCard from '@/components/BookingRequestCard';
import ChatPanel from '@/components/ChatPanel';
import DriverBottomNavigation from '@/components/DriverBottomNavigation';
import { useNavigate } from 'react-router-dom';

const DriverHomePage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { rides, updateRide } = useRides();
  const { bookings, updateBooking, isUpdating } = useDriverBookings();

  // Фильтруем поездки текущего водителя
  const myRides = rides.filter(ride => ride.driver_id === user?.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-yoldosh-success/10 text-yoldosh-success border-0';
      case 'completed': return 'bg-slate-100 text-slate-800 border-0';
      case 'cancelled': return 'bg-yoldosh-error/10 text-yoldosh-error border-0';
      default: return 'bg-slate-100 text-slate-800 border-0';
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    updateBooking({ id: requestId, status: 'confirmed' });
  };

  const handleRejectRequest = (requestId: string) => {
    updateBooking({ id: requestId, status: 'cancelled' });
  };

  const handleDeactivateRide = (rideId: string) => {
    if (confirm('Вы уверены, что хотите деактивировать эту поездку?')) {
      updateRide({ id: rideId, updates: { status: 'cancelled' } });
    }
  };

  const handleViewRideDetails = (rideId: string) => {
    navigate(`/driver-ride-details/${rideId}`);
  };

  const handleEditRide = (rideId: string) => {
    navigate(`/edit-ride/${rideId}`);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
      });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 pb-24">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-high-contrast">
                Добро пожаловать, {user?.name || 'Водитель'}!
              </h1>
              <p className="text-slate-700 mt-1">Управляйте своими поездками</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Passenger Requests for My Rides */}
        <Card className="card-high-contrast rounded-3xl shadow-xl animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-high-contrast flex items-center">
                <Bell className="h-6 w-6 mr-3 yoldosh-accent animate-pulse" />
                Заявки на мои поездки
              </CardTitle>
              <Badge className="bg-yoldosh-accent/10 text-yoldosh-accent border-0 animate-bounce">
                {bookings.length} новых
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {bookings.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Пока нет заявок на ваши поездки
              </div>
            ) : (
              bookings.map((booking) => (
                <BookingRequestCard
                  key={booking.id}
                  booking={booking}
                  onAccept={handleAcceptRequest}
                  onReject={handleRejectRequest}
                  isUpdating={isUpdating}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* My Rides */}
        <Card className="card-high-contrast rounded-3xl shadow-xl animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-high-contrast">Мои поездки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {myRides.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                У вас пока нет созданных поездок
              </div>
            ) : (
              myRides.map((ride) => (
                <div key={ride.id} className="card-high-contrast rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border border-slate-100 animate-fade-in">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-yoldosh-secondary rounded-xl flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-high-contrast text-lg">{ride.from_city} → {ride.to_city}</span>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-slate-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(ride.departure_date)} в {formatTime(ride.departure_time)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{ride.available_seats} мест доступно</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-2xl yoldosh-success">
                        {ride.price_per_seat.toLocaleString()} сум
                      </div>
                      <Badge className={getStatusColor(ride.status)}>
                        {ride.status === 'active' ? 'Активна' : ride.status === 'cancelled' ? 'Отменена' : 'Завершена'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => handleViewRideDetails(ride.id)}
                      variant="outline" 
                      className="flex-1 rounded-xl border-yoldosh-secondary yoldosh-secondary hover:bg-yoldosh-secondary/10 hover:scale-105 transition-all duration-300"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Подробнее
                    </Button>
                    {ride.status === 'active' && (
                      <>
                        <Button 
                          onClick={() => handleEditRide(ride.id)}
                          variant="outline"
                          className="flex-1 rounded-xl border-slate-300 text-slate-600 hover:bg-slate-50 hover:scale-105 transition-all duration-300"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Редактировать
                        </Button>
                        <Button 
                          onClick={() => handleDeactivateRide(ride.id)}
                          variant="outline"
                          className="rounded-xl border-red-500 text-red-500 hover:bg-red-50 hover:scale-105 transition-all duration-300 px-4"
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="card-high-contrast rounded-3xl shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold yoldosh-primary mb-2">{myRides.length}</div>
              <div className="text-sm text-slate-600 font-medium">Поездок</div>
            </CardContent>
          </Card>
          <Card className="card-high-contrast rounded-3xl shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold yoldosh-success mb-2">{user?.rating || '0.0'}</div>
              <div className="text-sm text-slate-600 font-medium">Рейтинг</div>
            </CardContent>
          </Card>
          <Card className="card-high-contrast rounded-3xl shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-amber-600 mb-2">{user?.totalRides || 0}</div>
              <div className="text-sm text-slate-600 font-medium">Пассажиров</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Driver Bottom Navigation */}
      <DriverBottomNavigation />

      {/* Chat Panel */}
      <ChatPanel />
    </div>
  );
};

export default DriverHomePage;
