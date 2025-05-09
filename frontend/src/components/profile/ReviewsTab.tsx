
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface Review {
  id: string;
  providerName: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewsTabProps {
  reviews: Review[];
}

export const ReviewsTab = ({ reviews }: ReviewsTabProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-6 text-xl font-semibold">My Reviews</h2>
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4">
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
                <span className="text-sm text-muted-foreground">Posted on {review.date}</span>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
