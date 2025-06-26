
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, User, Star, MessageSquare } from 'lucide-react';

interface CompletedRide {
  id: string;
  ride: {
    from_city: string;
    to_city: string;
    departure_date: string;
    departure_time: string;
  };
  seats_booked: number;
  total_price: number;
  driver?: {
    name: string;
    rating?: number;
  };
  passenger?: {
    name: string;
    rating?: number;
  };
  created_at: string;
  hasReview: boolean;
}

interface CompletedRideCardProps {
  ride: CompletedRide;
  userType: 'driver' | 'passenger';
  onLeaveReview: (rideId: string) => void;
}

const CompletedRideCard: React.FC<CompletedRideCardProps> = ({
  ride,
  userType,
  onLeaveReview
}) => {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
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

  const otherUser = userType === 'driver' ? ride.passenger : ride.driver;

  return (
    <Card className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-800 text-lg">
                {otherUser?.name || (userType === 'driver' ? 'Пассажир' : 'Водитель')}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-gray-600">
                  {otherUser?.rating || 0}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Завершена
            </Badge>
            <div className="text-sm text-gray-600 mt-1">
              {ride.seats_booked} место(а) • {ride.total_price.toLocaleString()} сум
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <div className="text-sm font-semibold text-gray-800">
              {ride.ride.from_city} → {ride.ride.to_city}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <div className="text-sm text-gray-600">
              {formatDate(ride.ride.departure_date)} в {formatTime(ride.ride.departure_time)}
            </div>
          </div>
        </div>

        {!ride.hasReview && (
          <Button
            onClick={() => onLeaveReview(ride.id)}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Оставить отзыв
          </Button>
        )}

        {ride.hasReview && (
          <div className="text-center py-2 text-green-600 text-sm font-medium">
            ✓ Отзыв оставлен
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompletedRideCard;
