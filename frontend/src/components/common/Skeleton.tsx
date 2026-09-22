import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
  );
};

export const ParkingCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col md:flex-row gap-4">
      <Skeleton className="h-44 md:h-auto md:w-48 rounded-xl shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-3/5" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-4/5" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-20 rounded-lg" />
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-6 w-16 rounded-lg" />
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <Skeleton className="h-8 w-28" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
