import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  className?: string;
}

export function StarRating({
  value,
  onChange,
  size = 16,
  className = "",
}: StarRatingProps) {
  const interactive = typeof onChange === "function";

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        const StarIcon = (
          <Star
            size={size}
            className={
              filled ? "fill-amber-400 text-amber-400" : "fill-none text-gray-300"
            }
          />
        );

        if (!interactive) {
          return <span key={star}>{StarIcon}</span>;
        }

        return (
          <button
            key={star}
            type="button"
            aria-label={`Rate ${star} of 5`}
            aria-pressed={value === star}
            onClick={() => onChange(star)}
            className="cursor-pointer rounded p-0.5 transition-transform hover:scale-110"
          >
            {StarIcon}
          </button>
        );
      })}
    </div>
  );
}
