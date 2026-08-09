'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizeMap = { sm: 12, md: 16, lg: 20 };

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = React.useState(0);
  const starSize = sizeMap[size];
  const displayRating = hovered || rating;

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: maxRating }).map((_, i) => {
        const filled = i < Math.floor(displayRating);
        const partial = !filled && i < displayRating;
        const value = i + 1;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(value)}
            onMouseEnter={() => interactive && setHovered(value)}
            onMouseLeave={() => interactive && setHovered(0)}
            className={cn(
              'relative',
              interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'
            )}
            aria-label={interactive ? `Rate ${value} out of ${maxRating}` : undefined}
          >
            {partial ? (
              <span className="relative inline-block">
                <Star
                  size={starSize}
                  className="text-gray-200 fill-gray-200"
                />
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${(displayRating - Math.floor(displayRating)) * 100}%` }}
                >
                  <Star
                    size={starSize}
                    className="text-amber-400 fill-amber-400"
                  />
                </span>
              </span>
            ) : (
              <Star
                size={starSize}
                className={cn(
                  filled ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200',
                  interactive && !filled ? 'hover:text-amber-300 hover:fill-amber-300' : ''
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

interface RatingBreakdownProps {
  reviews: { rating: number }[];
  className?: string;
}

export function RatingBreakdown({ reviews, className }: RatingBreakdownProps) {
  const total = reviews.length;
  const avg = total > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
    : 0;

  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: total > 0 ? (reviews.filter((r) => r.rating === star).length / total) * 100 : 0,
  }));

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="font-serif text-5xl font-medium">{avg.toFixed(1)}</div>
          <StarRating rating={avg} size="sm" className="mt-1 justify-center" />
          <div className="text-xs text-foreground-secondary mt-1">{total} reviews</div>
        </div>
        <div className="flex-1 space-y-1.5">
          {counts.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-foreground-secondary w-4 text-right">{star}</span>
              <Star size={10} className="text-amber-400 fill-amber-400 shrink-0" />
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-foreground-secondary w-4">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
