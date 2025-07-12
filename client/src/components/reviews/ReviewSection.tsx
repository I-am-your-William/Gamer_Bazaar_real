import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, ThumbsUp, ThumbsDown, MessageCircle, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: number;
  productId: number;
  userId: string;
  orderId?: number;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    username: string;
  };
}

interface RatingStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

interface ReviewSectionProps {
  productId: number;
}

function StarRating({ rating, size = "h-4 w-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${size} ${
            i < Math.floor(rating) 
              ? "text-yellow-400 fill-current" 
              : i < rating 
                ? "text-yellow-400 fill-current opacity-50" 
                : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function RatingOverview({ stats }: { stats: RatingStats }) {
  return (
    <Card className="gaming-card mb-6">
      <CardHeader>
        <CardTitle className="font-orbitron text-electric">Customer Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-neon-green mb-2">
              {stats.averageRating.toFixed(1)}
            </div>
            <StarRating rating={stats.averageRating} size="h-6 w-6" />
            <p className="text-gray-400 mt-2">
              Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm w-8">{rating}★</span>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{
                      width: `${stats.totalReviews > 0 ? (stats.ratingDistribution[rating] / stats.totalReviews) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-400 w-8">
                  {stats.ratingDistribution[rating] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WriteReviewDialog({ productId }: { productId: number }) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      return apiRequest("POST", `/api/products/${productId}/reviews`, reviewData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/reviews`] });
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/rating-stats`] });
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      setOpen(false);
      setRating(5);
      setTitle("");
      setComment("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast({
        title: "Error",
        description: "Please write a comment",
        variant: "destructive",
      });
      return;
    }

    createReviewMutation.mutate({
      rating,
      title: title.trim() || null,
      comment: comment.trim(),
    });
  };

  if (!user) {
    return (
      <Button variant="outline" disabled>
        <MessageCircle className="h-4 w-4 mr-2" />
        Login to Write Review
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-electric text-deep-black hover:bg-electric/80">
          <Plus className="h-4 w-4 mr-2" />
          Write Review
        </Button>
      </DialogTrigger>
      <DialogContent className="gaming-card max-w-md">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-electric">Write a Review</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Rating</Label>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      i < rating ? "text-yellow-400 fill-current" : "text-gray-400"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summary of your review"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              className="mt-1"
              rows={4}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createReviewMutation.isPending}
              className="flex-1 bg-electric text-deep-black hover:bg-electric/80"
            >
              {createReviewMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Submit Review
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const voteHelpfulMutation = useMutation({
    mutationFn: async ({ isHelpful }: { isHelpful: boolean }) => {
      return apiRequest("POST", `/api/reviews/${review.id}/helpful`, { isHelpful });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${review.productId}/reviews`] });
      toast({
        title: "Thank you",
        description: "Your feedback has been recorded",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record vote",
        variant: "destructive",
      });
    },
  });

  const displayName = review.user.firstName && review.user.lastName
    ? `${review.user.firstName} ${review.user.lastName}`
    : review.user.username;

  return (
    <Card className="gaming-card">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-electric/20 rounded-full flex items-center justify-center">
              <span className="font-semibold text-electric">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{displayName}</span>
                {review.isVerifiedPurchase && (
                  <Badge variant="secondary" className="text-xs bg-green-900 text-green-300">
                    ✓ Verified Purchase
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={review.rating} />
                <span className="text-sm text-gray-400">
                  {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {review.title && (
          <h4 className="font-semibold text-lg mb-2">{review.title}</h4>
        )}

        <p className="text-gray-300 mb-4 leading-relaxed">{review.comment}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {user && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => voteHelpfulMutation.mutate({ isHelpful: true })}
                  disabled={voteHelpfulMutation.isPending}
                  className="text-gray-400 hover:text-green-400"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Helpful
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => voteHelpfulMutation.mutate({ isHelpful: false })}
                  disabled={voteHelpfulMutation.isPending}
                  className="text-gray-400 hover:text-red-400"
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  Not Helpful
                </Button>
              </>
            )}
          </div>
          
          {review.helpfulCount > 0 && (
            <span className="text-sm text-gray-400">
              {review.helpfulCount} people found this helpful
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: [`/api/products/${productId}/reviews`],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<RatingStats>({
    queryKey: [`/api/products/${productId}/rating-stats`],
  });

  if (statsLoading || reviewsLoading) {
    return (
      <div className="space-y-6">
        <Card className="gaming-card">
          <CardContent className="pt-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-700 rounded mb-4"></div>
              <div className="h-20 bg-gray-700 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      <RatingOverview stats={stats} />
      
      <div className="flex items-center justify-between">
        <h3 className="font-orbitron font-bold text-xl">
          Reviews ({stats.totalReviews})
        </h3>
        <WriteReviewDialog productId={productId} />
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card className="gaming-card">
            <CardContent className="pt-6 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No reviews yet</h3>
              <p className="text-gray-400 mb-4">
                Be the first to share your experience with this product.
              </p>
              <WriteReviewDialog productId={productId} />
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        )}
      </div>
    </div>
  );
}