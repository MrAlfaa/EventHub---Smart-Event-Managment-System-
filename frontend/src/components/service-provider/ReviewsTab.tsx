import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceProvider, Review } from "@/types";
import { Star, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"; // Use sonner if it's the toast library in the project
import { useAuthStore } from "@/store/useAuthStore";
import reviewService from "@/services/reviewService";
import { Label } from "@/components/ui/label";

interface ReviewsTabProps {
  provider: ServiceProvider;
  reviews: Review[];
  onReviewAdded?: (newReview: Review) => void;
}

export const ReviewsTab = ({ provider, reviews, onReviewAdded }: ReviewsTabProps) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  const handleSubmitReview = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Please login to submit a review");
      return;
    }

    if (rating < 1 || comment.trim() === "") {
      toast.error("Please provide a rating and comment");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Submitting review for provider:", provider.id);
      const newReview = await reviewService.createReview(
        provider.id, 
        rating, 
        comment
      );
      
      toast.success("Thank you for your feedback!");
      
      setOpen(false);
      setRating(5);
      setComment("");
      
      if (onReviewAdded) {
        onReviewAdded(newReview);
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);
      
      // More detailed error message
      const errorMessage = error.response?.data?.detail || "Failed to submit review. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const userHasReviewed = reviews.some(review => 
    user && review.userId === user.id
  );

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Reviews</h3>
          {isAuthenticated && !userHasReviewed && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setOpen(true)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Write a Review
            </Button>
          )}
        </div>
        
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{review.userName}</p>
                    <div className="flex items-center mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-gray-700">{review.comment}</p>
                {review.response && (
                  <div className="mt-3 pl-4 border-l-2 border-gray-200">
                    <p className="text-sm font-medium">Response from {provider.name}</p>
                    <p className="mt-1 text-sm text-gray-700">{review.response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className="focus:outline-none"
                    aria-label={`Rate ${i + 1} star${i !== 0 ? 's' : ''}`}
                    title={`Rate ${i + 1} star${i !== 0 ? 's' : ''}`}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Review</Label>
              <Textarea
                id="comment"
                placeholder="Share your experience with this service provider..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );};
