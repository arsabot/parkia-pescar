import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  reviewsCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  reviewsCount,
  size = 'md',
  showCount = true,
}) => {
  const starSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base font-bold',
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rating >= star;
          const half = !filled && rating >= star - 0.5;

          return (
            <Star
              key={star}
              className={`${starSizes[size]} ${
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : half
                  ? 'fill-amber-200 text-amber-400'
                  : 'text-slate-200 fill-slate-100'
              }`}
            />
          );
        })}
      </div>
      <span className={`font-bold text-slate-800 ${textSizes[size]}`}>
        {Number(rating).toFixed(1)}
      </span>
      {showCount && reviewsCount !== undefined && (
        <span className="text-slate-400 text-xs font-normal">
          ({reviewsCount} reseñas)
        </span>
      )}
    </div>
  );
};
