/**
 * Loading State
 *
 * Skeleton UI displayed while the post list is loading.
 */

function PostSkeleton(): React.ReactElement {
  return (
    <div className="flex animate-pulse gap-3 border-b border-gray-200 bg-white px-4 py-3">
      {/* Rank */}
      <div className="h-5 w-6 rounded bg-gray-200" />

      <div className="flex-1 space-y-2">
        {/* Title */}
        <div className="h-5 w-3/4 rounded bg-gray-200" />

        {/* Meta line */}
        <div className="flex gap-2">
          <div className="h-4 w-16 rounded bg-gray-200" />
          <div className="h-4 w-20 rounded bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-4 w-16 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export default function Loading(): React.ReactElement {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Sort tabs skeleton */}
        <div className="mb-4 flex gap-4">
          <div className="h-8 w-12 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-12 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-12 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Post list skeleton */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          {Array.from({ length: 10 }).map((_, index) => (
            <PostSkeleton key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
