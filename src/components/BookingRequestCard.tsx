
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, MapPin, MessageSquare, Check, X, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BookingRequest {
  id: string;
  ride_id: string;
  passenger_id: string;
  passenger: {
    name: string;
    phone: string;
    rating?: number;
    total_rides: number;
  };
  ride: {
    from_city: string;
    to_city: string;
    departure_date: string;
    departure_time: string;
  };
  seats_booked: number;
  total_price: number;
  notes?: string;
  pickup_location?: string;
  created_at: string;
}

interface BookingRequestCardProps {
  booking: BookingRequest;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isUpdating: boolean;
}

const BookingRequestCard: React.FC<BookingRequestCardProps> = ({
  booking,
  onAccept,
  onReject,
  isUpdating
}) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isCreatingChat, setIsCreatingChat] = useState(false);

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

  const handleContactPassenger = async () => {
    if (!user) {
      toast.error('Необходимо войти в систему');
      return;
    }

    setIsCreatingChat(true);
    try {
      // Проверяем, существует ли уже чат между пользователями для этой поездки
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .eq('ride_id', booking.ride_id)
        .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${booking.passenger_id}),and(participant1_id.eq.${booking.passenger_id},participant2_id.eq.${user.id})`)
        .single();

      let chatId = existingChat?.id;

      // Если чат не существует, создаем новый
      if (!chatId) {
        const { data: newChat, error } = await supabase
          .from('chats')
          .insert([{
            ride_id: booking.ride_id,
            participant1_id: user.id,
            participant2_id: booking.passenger_id,
          }])
          .select('id')
          .single();

        if (error) throw error;
        chatId = newChat.id;
      }

      // Переходим к чату
      const params = new URLSearchParams({
        chatId: chatId,
        type: 'passenger',
        rideId: booking.ride_id,
        from: booking.ride.from_city,
        to: booking.ride.to_city,
        date: new Date(booking.ride.departure_date).toLocaleDateString('ru-RU'),
        time: booking.ride.departure_time
      });
      
      navigate(`/chat/${booking.passenger.name}?${params.toString()}`);
    } catch (error) {
      console.error('Chat creation error:', error);
      toast.error('Не удалось создать чат');
    } finally {
      setIsCreatingChat(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-white to-slate-50 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border border-slate-100 animate-fade-in">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-accent rounded-2xl flex items-center justify-center animate-pulse">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-lg">{booking.passenger.name}</div>
              <div className="flex items-center space-x-2 mt-1 text-sm">
                <span className="text-amber-500">★ {booking.passenger.rating || 0}</span>
                <span className="text-slate-500">({booking.passenger.total_rides} поездок)</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {new Date(booking.created_at).toLocaleString('ru-RU')}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-xl text-yoldosh-success">
              {booking.total_price.toLocaleString()} сум
            </div>
            <div className="text-sm text-slate-600">{booking.seats_booked} место(а)</div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-xl mb-4">
          <div className="flex items-center space-x-2 mb-1">
            <MapPin className="h-4 w-4 text-blue-600" />
            <div className="text-sm font-semibold text-blue-800">
              {booking.ride.from_city} → {booking.ride.to_city}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <div className="text-sm text-blue-600">
              {formatDate(booking.ride.departure_date)} в {formatTime(booking.ride.departure_time)}
            </div>
          </div>
        </div>

        {booking.pickup_location && (
          <div className="bg-green-50 p-3 rounded-xl mb-4">
            <div className="text-sm font-medium text-green-800">Место посадки</div>
            <div className="text-sm text-green-700">{booking.pickup_location}</div>
          </div>
        )}
        
        {booking.notes && (
          <div className="bg-slate-100 p-3 rounded-xl mb-4">
            <div className="text-sm font-medium text-slate-800 mb-1">Комментарий</div>
            <p className="text-sm text-slate-700 italic">"{booking.notes}"</p>
          </div>
        )}

        <div className="flex space-x-3 mb-3">
          <Button 
            onClick={() => onReject(booking.id)}
            variant="outline"
            disabled={isUpdating}
            className="flex-1 rounded-xl border-red-500 text-red-500 hover:bg-red-50 hover:border-red-600 hover:text-red-600 hover:scale-105 transition-all duration-300"
          >
            <X className="h-4 w-4 mr-2" />
            Отказать
          </Button>
          <Button 
            onClick={() => onAccept(booking.id)}
            disabled={isUpdating}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:scale-105 transition-all duration-300 rounded-xl shadow-lg"
          >
            <Check className="h-4 w-4 mr-2" />
            Принять
          </Button>
        </div>

        <Button
          onClick={handleContactPassenger}
          disabled={isCreatingChat}
          variant="outline"
          className="w-full rounded-xl border-yoldosh-blue text-yoldosh-blue hover:bg-yoldosh-blue hover:text-white transition-all duration-300"
        >
          {isCreatingChat ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Создание чата...
            </>
          ) : (
            <>
              <MessageSquare className="h-4 w-4 mr-2" />
              Связаться с пассажиром
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BookingRequestCard;
