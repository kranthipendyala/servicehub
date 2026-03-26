interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "xs" | "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
  compact?: boolean;
}

export default function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  showValue = true,
  reviewCount,
  compact = false,
}: RatingStarsProps) {
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };
  const textClasses = {
    xs: "text-[10px]",
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };
  const badgeSizes = {
    xs: "text-[10px] px-1.5 py-0.5",
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1",
  };

  const starSize = sizeClasses[size];
  const textSize = textClasses[size];

  // Compact mode: green badge with number + stars inline
  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-0.5 font-bold text-white bg-green-600 rounded ${badgeSizes[size]}`}
        >
          {rating.toFixed(1)}
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </span>
        {reviewCount !== undefined && (
          <span className={`text-gray-500 ${textSize}`}>
            {reviewCount} {reviewCount === 1 ? "Rating" : "Ratings"}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <div
        className="flex items-center"
        aria-label={`Rating: ${rating} out of ${maxRating}`}
      >
        {Array.from({ length: maxRating }).map((_, i) => {
          const fillPercentage = Math.min(1, Math.max(0, rating - i)) * 100;
          return (
            <div key={i} className={`relative ${starSize}`}>
              <svg
                className={`${starSize} text-gray-200`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercentage}%` }}
              >
                <svg
                  className={`${starSize} text-amber-400`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className={`font-bold text-gray-800 ${textSize} ml-0.5`}>
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className={`text-gray-400 ${textSize}`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
