"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/admin/Toast";
import {
  getVendorReviews,
  replyToReview,
  VendorReview,
} from "@/lib/vendor-api";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-amber-400" : "text-gray-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function VendorReviewsPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<VendorReview[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySaving, setReplySaving] = useState(false);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await getVendorReviews(p);
      setReviews(res.data.reviews || []);
      setTotalPages(res.data.pagination?.pages || 1);
      setPage(res.data.pagination?.page || 1);
    } catch {
      toast("Failed to load reviews", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load(1);
  }, [load]);

  const handleReply = async (id: number) => {
    if (!replyText.trim()) {
      toast("Please enter a reply", "error");
      return;
    }
    setReplySaving(true);
    try {
      await replyToReview(id, replyText);
      toast("Reply posted", "success");
      setReplyingTo(null);
      setReplyText("");
      load(page);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to post reply", "error");
    } finally {
      setReplySaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center text-sm text-gray-400">
            No reviews yet
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl border border-gray-200 p-6 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                      {review.customer_name?.charAt(0)?.toUpperCase() || "C"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {review.customer_name}
                      </p>
                      <p className="text-xs text-gray-500">{review.created_at}</p>
                    </div>
                  </div>
                </div>
                <StarRating rating={review.rating} />
              </div>

              <p className="text-sm text-gray-700">{review.comment}</p>

              {/* Existing Reply */}
              {review.vendor_reply && (
                <div className="bg-emerald-50 rounded-lg p-4 ml-6">
                  <p className="text-xs font-semibold text-emerald-700 mb-1">
                    Your Reply
                  </p>
                  <p className="text-sm text-gray-700">{review.vendor_reply}</p>
                </div>
              )}

              {/* Reply Input */}
              {!review.vendor_reply && replyingTo !== review.id && (
                <button
                  onClick={() => {
                    setReplyingTo(review.id);
                    setReplyText("");
                  }}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Reply
                </button>
              )}

              {replyingTo === review.id && (
                <div className="ml-6 space-y-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReply(review.id)}
                      disabled={replySaving}
                      className="px-4 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {replySaving ? "Posting..." : "Post Reply"}
                    </button>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => load(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => load(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
