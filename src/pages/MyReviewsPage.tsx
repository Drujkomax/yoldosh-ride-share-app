
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Star, User } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import emptyReviewsImage from '@/assets/empty-reviews.png';

const MyReviewsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('received');
  const { receivedReviews, givenReviews, isLoadingReceived, isLoadingGiven } = useReviews();
  
  // Check if we should return to account tab
  const backTo = searchParams.get('backTo');
  const backUrl = backTo === 'account' ? '/profile?tab=account' : '/profile';

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'd MMMM yyyy', { locale: ru });
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  const calculateAverageRating = (reviews: any[]) => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  };

  const averageRating = calculateAverageRating(receivedReviews);

  const EmptyState = ({ type }: { type: 'received' | 'given' }) => (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <img 
        src={emptyReviewsImage} 
        alt="No reviews" 
        className="w-64 h-48 object-contain mb-6 opacity-80"
      />
      <h3 className="text-xl font-semibold text-muted-foreground mb-2">
        {type === 'received' 
          ? "You haven't received any ratings yet" 
          : "You haven't given any ratings yet"
        }
      </h3>
      <p className="text-muted-foreground text-center max-w-md">
        {type === 'received'
          ? "Start using our service and receive your first rating from other users"
          : "Complete trips and rate your experience with other users"
        }
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate(backUrl)}
              className="mr-4 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">Ratings</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="received">Received</TabsTrigger>
            <TabsTrigger value="given">Given</TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="mt-0">
            {isLoadingReceived ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : receivedReviews.length === 0 ? (
              <EmptyState type="received" />
            ) : (
              <>
                {/* Rating Summary for Received Reviews */}
                {receivedReviews.length > 0 && (
                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-2">
                          {averageRating.toFixed(1)}
                        </div>
                        <div className="flex items-center justify-center mb-2">
                          {renderStars(Math.floor(averageRating))}
                        </div>
                        <p className="text-muted-foreground">Based on {receivedReviews.length} reviews</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {receivedReviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {review.reviewer?.avatar_url ? (
                              <img 
                                src={review.reviewer.avatar_url} 
                                alt={review.reviewer.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-medium">{review.reviewer?.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {review.booking?.ride?.from_city} → {review.booking?.ride?.to_city}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center mb-1">
                              {renderStars(review.rating)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(review.created_at)}
                            </p>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-foreground leading-relaxed">{review.comment}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="given" className="mt-0">
            {isLoadingGiven ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : givenReviews.length === 0 ? (
              <EmptyState type="given" />
            ) : (
              <div className="space-y-4">
                {givenReviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {review.reviewed_user?.avatar_url ? (
                            <img 
                              src={review.reviewed_user.avatar_url} 
                              alt={review.reviewed_user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium">{review.reviewed_user?.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {review.booking?.ride?.from_city} → {review.booking?.ride?.to_city}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center mb-1">
                            {renderStars(review.rating)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(review.created_at)}
                          </p>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-foreground leading-relaxed">{review.comment}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyReviewsPage;
