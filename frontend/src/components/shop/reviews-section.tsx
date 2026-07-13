"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import api from "@/lib/api";
import { reviewSchema, type ReviewInput } from "@/lib/validations";

interface Review {
  _id: string;
  user: { firstName: string; lastName: string };
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  helpful: number;
  createdAt: string;
}

export function ReviewsSection({ productId }: { productId: string }) {
  const { isSignedIn } = useAuth();
  const authApi = useAuthenticatedApi();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, title: "", comment: "" },
  });

  const formRating = watch("rating");

  const fetchReviews = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await api.get(`/reviews/product/${productId}?limit=20`, { signal: controller.signal });
      if (!controller.signal.aborted) setReviews(res.data.data);
    } catch { /* */ } finally { if (!controller.signal.aborted) setLoading(false); }
  }, [productId]);

  useEffect(() => { fetchReviews(); return () => abortRef.current?.abort(); }, [fetchReviews]);

  const onSubmit = async (data: ReviewInput) => {
    try {
      await authApi.post(`/reviews/product/${productId}`, data);
      toast.success("Review submitted!");
      setShowForm(false);
      reset({ rating: 5, title: "", comment: "" });
      fetchReviews();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to submit review");
    }
  };

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0.0";

  return (
    <section className="mt-12 border-t border-gray-100 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary">Customer Reviews</h2>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl font-bold">{avg}</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.round(parseFloat(avg)) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
              ))}
            </div>
            <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
          </div>
        </div>
        {isSignedIn && (
          <Button variant="accent" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Write a Review"}
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-8 rounded-xl border border-gray-100 bg-gray-50 p-6" noValidate>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button key={r} type="button" onClick={() => setValue("rating", r, { shouldValidate: true })} className="p-0.5">
                  <Star className={`h-7 w-7 ${r <= formRating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                </button>
              ))}
            </div>
            {errors.rating && <p className="mt-1 text-xs text-red-500">{errors.rating.message}</p>}
          </div>
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
            <input {...register("title")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              placeholder="Summary of your experience" />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Review *</label>
            <textarea {...register("comment")} rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              placeholder="Share your experience with this product..." />
            {errors.comment && <p className="mt-1 text-xs text-red-500">{errors.comment.message}</p>}
          </div>
          <Button variant="accent" type="submit">
            <Loader2 className="mr-2 hidden h-4 w-4 animate-spin [data-loading]:block" />
            Submit Review
          </Button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : reviews.length === 0 ? (
        <p className="py-8 text-center text-gray-400">No reviews yet. Be the first to review this product!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="rounded-xl border border-gray-100 bg-white p-5">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {r.user?.firstName?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.user?.firstName} {r.user?.lastName}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                        ))}
                      </div>
                      {r.isVerifiedPurchase && (
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">Verified Purchase</span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              {r.title && <p className="mb-1 font-medium text-gray-900">{r.title}</p>}
              <p className="text-sm text-gray-600">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
