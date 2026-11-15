import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rect' | 'circle' | 'text' | 'card';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
  ...props
}) => {
  const variantClasses = {
    rect: 'rounded-xl',
    circle: 'rounded-full',
    text: 'rounded-md h-4 w-full',
    card: 'rounded-2xl',
  };

  return (
    <div
      className={`animate-pulse bg-parchment-200/70 border border-parchment-300/40 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
};

// -------------------------------------------------------------
// Presets matching LibraCare views
// -------------------------------------------------------------

/**
 * Skeleton mimicking the Operational Dashboard layout
 */
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner Skeleton */}
      <div className="bg-charcoal-900/90 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-charcoal-800">
        <div className="space-y-3 w-full max-w-xl">
          <div className="flex items-center gap-2">
            <Skeleton className="w-28 h-5 rounded-full bg-charcoal-800 border-charcoal-700" />
            <Skeleton className="w-20 h-4 rounded-full bg-charcoal-800 border-charcoal-700" />
          </div>
          <Skeleton className="w-3/4 h-8 bg-charcoal-800 border-charcoal-700" />
          <Skeleton className="w-full h-4 bg-charcoal-800 border-charcoal-700" />
        </div>
        <div className="flex gap-2.5">
          <Skeleton className="w-28 h-9 rounded-full bg-coral-500/30 border-coral-500/20" />
          <Skeleton className="w-28 h-9 rounded-full bg-charcoal-800 border-charcoal-700" />
          <Skeleton className="w-24 h-9 rounded-full bg-charcoal-800 border-charcoal-700" />
        </div>
      </div>

      {/* Date Filter Bar Skeleton */}
      <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-parchment-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded-full" />
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-40 h-4" />
        </div>
        <div className="flex gap-1.5 p-1 bg-parchment-100 rounded-full">
          <Skeleton className="w-24 h-7 rounded-full bg-coral-500/20" />
          <Skeleton className="w-28 h-7 rounded-full" />
          <Skeleton className="w-16 h-7 rounded-full" />
        </div>
      </div>

      {/* Summary 8 Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-parchment-200 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="w-28 h-3.5" />
              <Skeleton className="w-9 h-9 rounded-xl" />
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <Skeleton className="w-20 h-7" />
              <Skeleton className="w-4 h-4 rounded-full" />
            </div>
            <Skeleton className="w-36 h-3" />
          </div>
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circulation Bar Chart Skeleton */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-parchment-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-parchment-100 pb-3">
            <div className="space-y-1.5">
              <Skeleton className="w-48 h-5" />
              <Skeleton className="w-64 h-3.5" />
            </div>
            <Skeleton className="w-28 h-6 rounded-full" />
          </div>
          {/* Bar Chart Bars Placeholder */}
          <div className="h-64 flex items-end justify-between gap-3 px-4 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-1 flex items-end justify-center gap-2 h-full">
                <Skeleton className="w-6 rounded-t-lg bg-coral-400/30" style={{ height: `${35 + (i * 12) % 55}%` }} />
                <Skeleton className="w-6 rounded-t-lg bg-charcoal-700/20" style={{ height: `${25 + (i * 15) % 65}%` }} />
              </div>
            ))}
          </div>
        </div>

        {/* Category Pie Chart Skeleton */}
        <div className="bg-white rounded-3xl p-6 border border-parchment-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-1.5">
            <Skeleton className="w-40 h-5" />
            <Skeleton className="w-48 h-3.5" />
          </div>
          <div className="flex items-center justify-center py-4">
            <Skeleton className="w-36 h-36 rounded-full border-8 border-parchment-100" />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-parchment-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Lists Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, col) => (
          <div key={col} className="bg-white rounded-3xl p-6 border border-parchment-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-parchment-100 pb-3">
              <Skeleton className="w-48 h-5" />
              <Skeleton className="w-20 h-4" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-parchment-50/50">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="space-y-1.5">
                      <Skeleton className="w-40 h-3.5" />
                      <Skeleton className="w-24 h-2.5" />
                    </div>
                  </div>
                  <Skeleton className="w-16 h-6 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton mimicking Table Views (Inventory, Members, Transactions, Overdue)
 */
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 6 }) => {
  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top action header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-parchment-200 shadow-2xs">
        <div className="space-y-2">
          <Skeleton className="w-64 h-5" />
          <Skeleton className="w-44 h-3.5" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-24 h-8 rounded-full" />
          <Skeleton className="w-28 h-8 rounded-full" />
          <Skeleton className="w-32 h-8 rounded-full bg-coral-500/30" />
        </div>
      </div>

      {/* Filter and Search Bar skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-3.5 rounded-2xl border border-parchment-200 shadow-2xs">
        <Skeleton className="md:col-span-5 h-9 rounded-xl" />
        <Skeleton className="md:col-span-4 h-9 rounded-xl" />
        <Skeleton className="md:col-span-3 h-9 rounded-xl" />
      </div>

      {/* Table rows skeleton */}
      <div className="bg-white rounded-2xl border border-parchment-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-parchment-50/80 border-b border-parchment-200 flex justify-between">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-20 h-4" />
        </div>
        <div className="divide-y divide-parchment-100">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 flex-1">
                <Skeleton className="w-10 h-14 rounded-xl flex-shrink-0" />
                <div className="space-y-2 flex-1 max-w-sm">
                  <Skeleton className="w-3/4 h-4" />
                  <Skeleton className="w-1/2 h-3" />
                </div>
              </div>
              <Skeleton className="w-28 h-4 hidden sm:block" />
              <Skeleton className="w-20 h-6 rounded-full" />
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-24 h-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
