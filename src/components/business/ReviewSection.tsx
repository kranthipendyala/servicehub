import type { Review } from "@/types";
import RatingStars from "@/components/common/RatingStars";

interface ReviewSectionProps {
  reviews: Review[];
  averageRating?: number;
  totalReviews?: number;
}

function RatingBreakdown({
  reviews,
  averageRating,
  totalReviews,
}: {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}) {
  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { star, count, percentage };
  });

  const ratingColor =
    averageRating >= 4
      ? "bg-green-600"
      : averageRating >= 3
        ? "bg-yellow-500"
        : averageRating >= 2
          ? "bg-orange-500"
          : "bg-red-500";

  return (
    <div className="bg-gradient-to-br from-surface-50 to-white rounded-xl p-6 mb-8 border border-surface-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
        {/* Overall Rating */}
        <div className="text-center sm:text-left flex-shrink-0">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${ratingColor} text-white mb-3`}>
            <span className="text-3xl font-heading font-bold">
              {averageRating.toFixed(1)}
            </span>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 font-medium">
            {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {averageRating >= 4
              ? "Excellent"
              : averageRating >= 3
                ? "Good"
                : "Average"}
          </p>
        </div>

        {/* Breakdown Bars */}
        <div className="flex-1 w-full space-y-2.5">
          {breakdown.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-600 w-4 text-right">
                {star}
              </span>
              <svg
                className="w-4 h-4 text-amber-400 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-500 w-8 text-right">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const initials = review.user_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const ratingColor =
    review.rating >= 4
      ? "bg-green-600"
      : review.rating >= 3
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div className="border-b border-surface-200 last:border-0 py-5 first:pt-0">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-primary-700">{initials}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">
              {review.user_name}
            </span>
            {review.is_verified && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full font-semibold">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Verified
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-bold text-white ${ratingColor}`}
            >
              {review.rating.toFixed(1)}
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </span>
            <span className="text-xs text-gray-400">
              {new Date(review.created_at).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          {review.title && (
            <h4 className="font-semibold text-gray-800 text-sm mb-1">
              {review.title}
            </h4>
          )}

          <p className="text-gray-600 text-sm leading-relaxed">
            {review.comment}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ReviewSection({
  reviews,
  averageRating,
  totalReviews,
}: ReviewSectionProps) {
  const rating = averageRating || 0;
  const total = totalReviews || reviews.length;

  return (
    <section>
      <h2 className="text-xl font-heading font-bold text-gray-900 mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        Reviews & Ratings
      </h2>

      {total > 0 && rating > 0 && (
        <RatingBreakdown
          reviews={reviews}
          averageRating={rating}
          totalReviews={total}
        />
      )}

      {reviews.length > 0 ? (
        <div>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-surface-50 rounded-xl">
          <svg className="w-12 h-12 text-surface-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-500 font-medium">No reviews yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Be the first to share your experience!
          </p>
        </div>
      )}
    </section>
  );
}
