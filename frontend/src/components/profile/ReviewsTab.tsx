  import { useState, useEffect } from "react";
  import { Card, CardContent } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Star, Loader2, Edit, Check, X } from "lucide-react";
  import { Textarea } from "@/components/ui/textarea";
  import reviewService from "@/services/reviewService";
  import { toast } from "sonner";
  import { formatDate } from "@/lib/utils";

  // Define an interface that matches what the backend returns
  interface Review {
    id: string;
    providerName: string;
    rating: number;
    comment: string;
    date: string;
    serviceProviderId: string;
    userId: string;
    userName: string;
    userImage?: string;
    response?: string | null;
  }

  export const ReviewsTab = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const [editedComment, setEditedComment] = useState("");
    const [editedRating, setEditedRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      fetchUserReviews();
    }, []);

    const fetchUserReviews = async () => {
      try {
        setLoading(true);
        const reviewsData = await reviewService.getUserReviews();
        setReviews(reviewsData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        setError("Failed to load your reviews. Please try again later.");
        toast.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    const handleEditClick = (review: Review) => {
      setEditingReviewId(review.id);
      setEditedComment(review.comment);
      setEditedRating(review.rating);
    };

    const handleCancelEdit = () => {
      setEditingReviewId(null);
      setEditedComment("");
      setEditedRating(0);
    };

    const handleSaveEdit = async (reviewId: string, serviceProviderId: string) => {
      try {
        setIsSubmitting(true);
        await reviewService.updateReview(reviewId, {
          rating: editedRating,
          comment: editedComment,
          serviceProviderId
        });
      
        // Update the local state with edited review
        setReviews(reviews.map(review => 
          review.id === reviewId 
            ? { ...review, comment: editedComment, rating: editedRating }
            : review
        ));
      
        setEditingReviewId(null);
        toast.success("Review updated successfully");
      } catch (err) {
        console.error("Failed to update review:", err);
        toast.error("Failed to update review. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-6 text-xl font-semibold">My Reviews</h2>
        
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              You haven't posted any reviews yet.
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  {editingReviewId === review.id ? (
                    /* Edit Mode */
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{review.providerName}</h3>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={20} 
                              className="cursor-pointer"
                              fill={i < editedRating ? "gold" : "transparent"} 
                              stroke={i < editedRating ? "gold" : "currentColor"}
                              onClick={() => setEditedRating(i + 1)}
                            />
                          ))}
                        </div>
                      </div>
                      <Textarea 
                        value={editedComment}
                        onChange={(e) => setEditedComment(e.target.value)}
                        className="mb-3"
                        placeholder="Write your review..."
                      />
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={isSubmitting}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Cancel
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleSaveEdit(review.id, review.serviceProviderId)}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="mr-1 h-4 w-4" />
                          )}
                          Save
                        </Button>
                      </div>
                    </>
                  ) : (
                    /* View Mode */
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{review.providerName}</h3>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={16} 
                              fill={i < review.rating ? "gold" : "transparent"} 
                              stroke={i < review.rating ? "gold" : "currentColor"}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-muted-foreground">{review.comment}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Posted on {formatDate(review.date)}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditClick(review)}
                        >
                          <Edit className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
