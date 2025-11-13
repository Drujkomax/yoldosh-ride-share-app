
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users } from 'lucide-react';

interface ChatRideInfoProps {
  rideId: string;
  fromCity: string;
  toCity: string;
  departureDate: string;
  departureTime: string;
  availableSeats: number;
}

const ChatRideInfo: React.FC<ChatRideInfoProps> = ({
  rideId,
  fromCity,
  toCity,
  departureDate,
  departureTime,
  availableSeats
}) => {
  const navigate = useNavigate();

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

  const handleClick = () => {
    navigate(`/ride/${rideId}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-2xl p-4 cursor-pointer hover:shadow-md hover:border-primary/40 hover:scale-[1.01] transition-all active:scale-[0.99]"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-xl">
          <MapPin className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-foreground text-base">
          {fromCity} → {toCity}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-primary font-medium">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(departureDate)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-primary font-medium">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatTime(departureTime)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-lg">
          <Users className="h-3.5 w-3.5 text-primary" />
          <span className="text-primary font-semibold">{availableSeats}</span>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
        👆 Нажмите для просмотра деталей поездки
      </div>
    </div>
  );
};

export default ChatRideInfo;
