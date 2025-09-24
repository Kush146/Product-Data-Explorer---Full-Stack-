"use client";
export default function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border p-3">
          <div className="h-36 w-full rounded-md bg-gray-200" />
          <div className="mt-3 h-4 w-3/4 bg-gray-200 rounded" />
          <div className="mt-2 h-3 w-1/2 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}
