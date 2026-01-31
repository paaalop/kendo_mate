export function TrainingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-32 bg-gray-200 rounded-3xl w-full"></div>

      {/* Stats & Search Skeleton */}
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded-2xl w-32"></div>
        <div className="h-12 bg-gray-200 rounded-2xl w-full"></div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded-2xl w-24 flex-shrink-0"></div>
        ))}
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-100 rounded-2xl border border-gray-200 p-4 space-y-4">
            <div className="flex justify-between">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded-full w-12"></div>
            </div>
            <div className="h-16 bg-gray-200 rounded-xl"></div>
            <div className="flex gap-2">
              <div className="h-11 bg-gray-200 rounded-xl flex-1"></div>
              <div className="h-11 bg-gray-200 rounded-xl flex-1"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
