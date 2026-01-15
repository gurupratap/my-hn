/**
 * Post Detail Loading State
 *
 * Skeleton UI displayed while the post detail page is loading.
 */

function CommentSkeleton({ depth = 0 }: { depth?: number }): React.ReactElement {
  return (
    <div className={`py-3 ${depth > 0 ? 'ml-4 border-l-2 border-gray-200 pl-4' : ''}`}>
      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
      </div>
      {/* Body */}
      <div className="space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}

export default function Loading(): React.ReactElement {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Post Detail Skeleton */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          {/* Title */}
          <div className="mb-2 h-7 w-3/4 animate-pulse rounded bg-gray-200" />

          {/* Meta line */}
          <div className="mb-4 flex gap-2">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          </div>

          {/* Text content skeleton */}
          <div className="space-y-2 border-t border-gray-100 pt-4">
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        {/* Comments Skeleton */}
        <div className="rounded-lg border border-gray-200 bg-white">
          {/* Header */}
          <div className="border-b border-gray-200 px-4 py-3">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          </div>

          {/* Comment list */}
          <div className="divide-y divide-gray-100 px-4">
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
          </div>
        </div>
      </div>
    </main>
  );
}
