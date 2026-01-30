export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-white/5 rounded-lg"></div>
          <div className="h-4 w-48 bg-white/5 rounded-lg"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-64 bg-white/5 rounded-xl"></div>
          <div className="h-10 w-10 bg-white/5 rounded-xl"></div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/5 overflow-hidden h-full bg-white/5"
          >
            {/* Image Placeholder */}
            <div className="h-32 bg-white/5 relative">
              <div className="absolute top-4 right-4 h-6 w-20 bg-white/10 rounded-full"></div>
            </div>

            {/* Content Placeholder */}
            <div className="p-5 space-y-4">
              <div className="h-4 w-32 bg-white/10 rounded"></div>

              <div className="grid grid-cols-2 gap-3 py-3 border-t border-white/5 border-b">
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-white/5 rounded"></div>
                  <div className="h-4 w-10 bg-white/10 rounded"></div>
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-white/5 rounded"></div>
                  <div className="h-4 w-10 bg-white/10 rounded"></div>
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-white/5 rounded"></div>
                  <div className="h-4 w-10 bg-white/10 rounded"></div>
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-white/5 rounded"></div>
                  <div className="h-4 w-10 bg-white/10 rounded"></div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <div className="h-10 flex-1 bg-white/10 rounded-xl"></div>
                <div className="h-10 flex-1 bg-white/10 rounded-xl"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
