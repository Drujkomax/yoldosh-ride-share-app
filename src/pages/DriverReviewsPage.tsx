import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, User, ChevronLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import UserAvatar from '@/components/UserAvatar';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer: {
    name: string;
    avatar_url: string;
  };
  booking: {
    ride: {
      from_city: string;
      to_city: string;
      departure_date: string;
    };
  };
}

const DriverReviewsPage = () => {
  const navigate = useNavigate();
  const { driverId } = useParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [driverInfo, setDriverInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (driverId) {
      fetchDriverReviews();
      fetchDriverInfo();
    }
  }, [driverId]);

  const fetchDriverInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, rating, total_rides, avatar_url')
        .eq('id', driverId)
        .single();

      if (error) throw error;
      setDriverInfo(data);
    } catch (error) {
      console.error('Error fetching driver info:', error);
    }
  };

  const fetchDriverReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          reviewer:profiles!reviews_reviewer_id_fkey (
            name,
            avatar_url
          ),
          booking:bookings!reviews_booking_id_fkey (
            ride:rides!bookings_ride_id_fkey (
              from_city,
              to_city,
              departure_date
            )
          )
        `)
        .eq('reviewed_user_id', driverId)
        .eq('review_type', 'driver')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMMM yyyy', { locale: ru });
    } catch {
      return dateStr;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

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
            <h1 className="text-lg font-bold">Отзывы о водителе</h1>
            <div className="w-10" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Driver Summary */}
        {driverInfo && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4 mb-4">
                <UserAvatar size="lg" avatarUrl={driverInfo.avatar_url} name={driverInfo.name} />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-bold text-xl">{driverInfo.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      ✓ Проверен
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span>{calculateAverageRating()}</span>
                    </div>
                    <span>{driverInfo.total_rides || 0} поездок</span>
                    <span>{reviews.length} отзывов</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-500 text-lg mb-2">Пока нет отзывов</div>
                <div className="text-gray-400">Отзывы появятся после завершения поездок</div>
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <UserAvatar size="md" avatarUrl={review.reviewer?.avatar_url} name={review.reviewer?.name} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium">{review.reviewer?.name || 'Пассажир'}</div>
                          <div className="text-xs text-gray-500">
                            {formatDate(review.created_at)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      
                      {review.comment && (
                        <div className="text-gray-700 mb-2">{review.comment}</div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Поездка: {review.booking?.ride?.from_city} → {review.booking?.ride?.to_city}
                        {review.booking?.ride?.departure_date && (
                          <span>, {formatDate(review.booking.ride.departure_date)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverReviewsPage;