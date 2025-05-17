import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import reviewService from "@/services/reviewService";
import { Review } from "@/types";

const renderStars = (rating: number) => {
  return Array(5)
    .fill(0)
    .map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
      />
    ));
};

const ReviewCard = ({ review, onReplySubmitted }: { review: any; onReplySubmitted: (reviewId: string, response: string) => Promise<void> }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReply = async () => {
    if (replyText.trim() === "") return;
    
    setIsSubmitting(true);
    try {
      await onReplySubmitted(review.id, replyText);
      setIsReplying(false);
      setReplyText("");
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar>
              <AvatarImage src={review.userImage} alt={review.userName} />
              <AvatarFallback>{review.userName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{review.userName}</p>
              <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
              <div className="mt-1 flex">
                {renderStars(review.rating)}
              </div>
            </div>
          </div>
          {review.packageName && <Badge variant="outline">{review.packageName}</Badge>}
        </div>
        <p className="mt-4 text-gray-700">{review.comment}</p>
        {review.response && (
          <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4">
            <p className="mb-2 font-medium text-sm">Your Response:</p>
            <p className="text-sm text-gray-700">{review.response}</p>
          </div>
        )}
        {!review.response && !isReplying && (
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => setIsReplying(true)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Reply to Review
            </Button>
          </div>
        )}
        {isReplying && (
          <div className="mt-4 space-y-3">
            <Textarea
              placeholder="Write your response to this review..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsReplying(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSubmitReply}
                disabled={isSubmitting || replyText.trim() === ""}
              >
                {isSubmitting ? "Submitting..." : "Submit Reply"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ProviderReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  
  useEffect(() => {
    const fetchReviews = async () => {
      if (!user) return;
      
      try {
        const reviewsData = await reviewService.getProviderReviews(user.id);
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast("Failed to load reviews", {
          description: "Please try again later"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [user]);

  // Function to handle reply submission
  const handleReplySubmitted = async (reviewId: string, response: string) => {
    try {
      const updatedReview = await reviewService.replyToReview(reviewId, response);
      
      // Update the reviews state with the new response
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId ? { ...review, response } : review
        )
      );
      
      toast("Reply submitted", {
        description: "Your response has been added to the review"
      });
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast("Failed to submit reply", {
        description: "Please try again"
      });
      throw error; // Re-throw for the component to handle
    }
  };

  // Calculate rating statistics
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews
    : 0;
  
  const ratingCounts = [0, 0, 0, 0, 0]; // For ratings 1-5
  reviews.forEach(review => {
    ratingCounts[review.rating - 1]++;
  });

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reviews</h2>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Reviews</TabsTrigger>
          <TabsTrigger value="positive">Positive</TabsTrigger>
          <TabsTrigger value="neutral">Neutral</TabsTrigger>
          <TabsTrigger value="negative">Negative</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="mb-6 flex flex-col md:flex-row justify-between gap-6">
            <Card className="flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Rating Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
                  <div className="flex mt-1">
                    {renderStars(Math.round(averageRating))}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">({totalReviews} reviews)</span>
                </div>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Response Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  {totalReviews > 0 ? (
                    <>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">
                          {Math.round((reviews.filter(r => r.response).length / totalReviews) * 100)}% responded
                        </span>
                        <span className="text-sm font-medium">
                          {reviews.filter(r => r.response).length} of {totalReviews}
                        </span>
                      </div>
                      <Progress 
                        value={(reviews.filter(r => r.response).length / totalReviews) * 100}
                        className="h-2"
                      />
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No reviews yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No reviews yet</p>
              </div>
            ) : (
              reviews.map((review) => (
                <ReviewCard 
                  key={review.id} 
                  review={review} 
                  onReplySubmitted={handleReplySubmitted}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="positive" className="space-y-4">
          <div className="space-y-4">
            {reviews
              .filter((r) => r.rating > 3)
              .map((review) => (
                <ReviewCard key={review.id} review={review} onReplySubmitted={handleReplySubmitted} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="neutral" className="space-y-4">
          <div className="space-y-4">
            {reviews
              .filter((r) => r.rating === 3)
              .map((review) => (
                <ReviewCard key={review.id} review={review} onReplySubmitted={handleReplySubmitted} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="negative" className="space-y-4">
          <div className="space-y-4">
            {reviews
              .filter((r) => r.rating < 3)
              .map((review) => (
                <ReviewCard key={review.id} review={review} onReplySubmitted={handleReplySubmitted} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
              <CardDescription>
                Breakdown of your reviews by rating
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <div className="w-10 text-right">{rating} ★</div>
                    <Progress 
                      value={totalReviews > 0 ? (ratingCounts[rating - 1] / totalReviews) * 100 : 0}
                      className="h-3 flex-1" 
                    />
                    <div className="w-10 text-left text-gray-500">
                      {ratingCounts[rating - 1]}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review Trends</CardTitle>
              <CardDescription>
                How your ratings have changed over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center text-gray-500">
                Review trend chart will appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProviderReviews;
