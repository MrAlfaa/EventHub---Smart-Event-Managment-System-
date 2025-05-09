import { Button } from "@/components/ui/button";
import { Review, ServiceProvider } from "@/types";
import { Star, PenLine, X } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ReviewsTabProps {
  provider: ServiceProvider;
  reviews: Review[];
}

const ReviewForm = ({ onClose, providerId }: { onClose: () => void, providerId: string }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { user, isAuthenticated } = useAuthStore();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    if (comment.trim().length < 10) {
      toast.error("Please enter a comment with at least 10 characters");
      return;
    }

    // For anonymous users, validate name
    if (!isAuthenticated && name.trim().length < 2) {
      toast.error("Please enter your name");
      return;
    }
    
    // Create review object
    const newReview: Partial<Review> = {
      userId: user?.id || "anonymous",
      serviceProviderId: providerId,
      userName: isAuthenticated ? user?.name || "" : name,
      userImage: user?.profileImage,
      rating,
      comment,
      date: new Date().toISOString(),
    };
    
    // In a real app, you would send this to your API
    console.log("Submitting review:", newReview);
    
    toast.success("Review submitted successfully!");
    onClose();
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">Write a Review</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Show name and email fields for anonymous users */}
          {!isAuthenticated && (
            <div className="mb-4 grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div>
                <label htmlFor="reviewer-name" className="mb-2 block font-medium">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="reviewer-name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="reviewer-email" className="mb-2 block font-medium">
                  Email (optional)
                </label>
                <Input
                  id="reviewer-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="mb-4">
            <p className="mb-2 font-medium">Your Rating <span className="text-red-500">*</span></p>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 cursor-pointer ${
                    (hoverRating || rating) >= star 
                      ? "text-yellow-500" 
                      : "text-gray-300"
                  }`}
                  fill={(hoverRating || rating) >= star ? "currentColor" : "none"}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              ))}
              <span className="ml-2 text-sm text-gray-500">
                {rating > 0 ? `You selected ${rating} ${rating === 1 ? 'star' : 'stars'}` : 'Select your rating'}
              </span>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="review-comment" className="mb-2 block font-medium">
              Your Review <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="review-comment"
              placeholder="Write your honest review here..."
              className="min-h-[100px]"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Submit Review
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export const ReviewsTab = ({ provider, reviews }: ReviewsTabProps) => {
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleAddReview = () => {
    // Removed authentication check to allow anyone to write a review
    setShowReviewForm(true);
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold">Customer Reviews</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <Star className="mr-1 h-5 w-5 text-yellow-500" fill="currentColor" />
            <span className="font-medium">{provider.rating}</span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-gray-600">{provider.reviewCount} reviews</span>
          </div>
          <Button 
            onClick={handleAddReview}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <PenLine className="mr-2 h-4 w-4" />
            Write a Review
          </Button>
        </div>
      </div>
      
      {showReviewForm && (
        <ReviewForm 
          onClose={() => setShowReviewForm(false)} 
          providerId={provider.id}
        />
      )}
      
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-6 last:border-0">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  {review.userName.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="font-medium">{review.userName}</p>
                  <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating ? "text-yellow-500" : "text-gray-300"
                      }`}
                      fill={i < review.rating ? "currentColor" : "none"}
                    />
                  ))}
              </div>
            </div>
            <p className="text-gray-700">{review.comment}</p>
          </div>
        ))}
      </div>
      
      <Button variant="outline" className="mt-4 w-full">
        Load More Reviews
      </Button>
    </div>
  );
};
