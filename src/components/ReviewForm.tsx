
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star, User, Car } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';

interface ReviewFormProps {
  bookingId: string;
  reviewedUserId: string;
  reviewedUserName: string;
  reviewType: 'driver_to_passenger' | 'passenger_to_driver';
  rideInfo: {
    from_city: string;
    to_city: string;
    departure_date: string;
  };
  onClose: () => void;
}

const ReviewForm = ({
  bookingId,
  reviewedUserId,
  reviewedUserName,
  reviewType,
  rideInfo,
  onClose
}: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const { createReview, isCreating } = useReviews();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      return;
    }

    try {
      await createReview({
        booking_id: bookingId,
        reviewed_user_id: reviewedUserId,
        rating,
        comment: comment.trim() || undefined,
        review_type: reviewType
      });
      onClose();
    } catch (error) {
      console.error('Ошибка создания отзыва:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {reviewType === 'driver_to_passenger' ? (
            <User className="h-5 w-5" />
          ) : (
            <Car className="h-5 w-5" />
          )}
          <span>Оставить отзыв</span>
        </CardTitle>
        <div className="text-sm text-gray-600">
          <p><strong>{reviewedUserName}</strong></p>
          <p>{rideInfo.from_city} → {rideInfo.to_city}</p>
          <p>{new Date(rideInfo.departure_date).toLocaleDateString('ru-RU')}</p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Оценка *
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Комментарий
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Поделитесь своими впечатлениями о поездке..."
              rows={4}
            />
          </div>

          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={rating === 0 || isCreating}
              className="flex-1"
            >
              {isCreating ? 'Отправка...' : 'Оставить отзыв'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
