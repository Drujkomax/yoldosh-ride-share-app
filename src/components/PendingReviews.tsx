
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, User, Car } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';
import ReviewForm from './ReviewForm';
import { useUser } from '@/contexts/UserContext';

const PendingReviews = () => {
  const { user } = useUser();
  const { pendingReviews } = useReviews();
  const [selectedReview, setSelectedReview] = useState<any>(null);

  if (!pendingReviews || pendingReviews.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Оставьте отзыв о поездке
            <Badge className="ml-2">{pendingReviews.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingReviews.map((booking: any) => {
            const isDriver = user?.id === booking.ride?.driver_id;
            const otherUser = isDriver ? 
              { name: 'Пассажир', id: booking.passenger_id } : 
              { name: booking.ride?.driver?.name || 'Водитель', id: booking.ride?.driver_id };

            return (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {isDriver ? (
                    <User className="h-5 w-5 text-amber-600" />
                  ) : (
                    <Car className="h-5 w-5 text-amber-600" />
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      {booking.ride?.from_city} → {booking.ride?.to_city}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(booking.ride?.departure_date).toLocaleDateString('ru-RU')} • {otherUser.name}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setSelectedReview(booking)}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Оставить отзыв
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <ReviewForm
              bookingId={selectedReview.id}
              reviewedUserId={
                user?.id === selectedReview.ride?.driver_id 
                  ? selectedReview.passenger_id 
                  : selectedReview.ride?.driver_id
              }
              reviewedUserName={
                user?.id === selectedReview.ride?.driver_id 
                  ? 'Пассажир' 
                  : selectedReview.ride?.driver?.name || 'Водитель'
              }
              reviewType={
                user?.id === selectedReview.ride?.driver_id 
                  ? 'driver_to_passenger' 
                  : 'passenger_to_driver'
              }
              rideInfo={{
                from_city: selectedReview.ride?.from_city,
                to_city: selectedReview.ride?.to_city,
                departure_date: selectedReview.ride?.departure_date
              }}
              onClose={() => setSelectedReview(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingReviews;
