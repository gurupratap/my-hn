'use client';

/**
 * LoadMoreButton Component
 *
 * Client component that triggers loading additional posts.
 * Shows loading state and hides when no more posts available.
 */

interface LoadMoreButtonProps {
  /** Whether more posts are being fetched */
  loading: boolean;
  /** Whether there are more posts to load */
  hasMore: boolean;
  /** Callback to load more posts */
  onLoadMore: () => void;
}

export default function LoadMoreButton({
  loading,
  hasMore,
  onLoadMore,
}: LoadMoreButtonProps): React.ReactElement | null {
  // Hide button when no more posts
  if (!hasMore) {
    return null;
  }

  return (
    <div className="mt-4 flex justify-center">
      <button
        onClick={onLoadMore}
        disabled={loading}
        className="rounded-lg bg-orange-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-400"
        aria-busy={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </span>
        ) : (
          'Load More'
        )}
      </button>
    </div>
  );
}
