
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
      className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 cursor-pointer hover:bg-blue-100 transition-colors"
    >
      <div className="flex items-center space-x-2 mb-2">
        <MapPin className="h-4 w-4 text-blue-600" />
        <span className="font-semibold text-blue-800">
          {fromCity} → {toCity}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-sm text-blue-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(departureDate)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{formatTime(departureTime)}</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Users className="h-3 w-3" />
          <span>{availableSeats} мест</span>
        </div>
      </div>
      
      <div className="text-xs text-blue-600 mt-2">
        Нажмите для просмотра деталей поездки
      </div>
    </div>
  );
};

export default ChatRideInfo;
