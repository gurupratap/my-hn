'use client';

/**
 * InfiniteScrollContainer
 *
 * Reusable wrapper component that adds infinite scrolling to any list.
 * Uses IntersectionObserver to detect when user scrolls near the bottom.
 */

import { ReactNode } from 'react';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import LoadingIndicator from './LoadingIndicator';

interface InfiniteScrollContainerProps {
  /** Content to render inside the scrollable container */
  children: ReactNode;
  /** Callback to load more items */
  onLoadMore: () => void;
  /** Whether items are currently being loaded */
  loading: boolean;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Message to show when all items are loaded */
  endMessage?: string;
  /** Root margin for intersection observer (default: 200px) */
  rootMargin?: string;
  /** Additional className for the container */
  className?: string;
}

export default function InfiniteScrollContainer({
  children,
  onLoadMore,
  loading,
  hasMore,
  endMessage = 'No more items',
  rootMargin = '200px',
  className = '',
}: InfiniteScrollContainerProps): React.ReactElement {
  const { sentinelRef } = useInfiniteScroll({
    onLoadMore,
    loading,
    hasMore,
    rootMargin,
  });

  return (
    <div className={className}>
      {children}

      {/* Sentinel element for intersection observer */}
      <div ref={sentinelRef} className="h-px" aria-hidden="true" />

      {loading && <LoadingIndicator />}

      {!hasMore && !loading && (
        <div className="py-2 text-center text-xs text-gray-400">
          {endMessage}
        </div>
      )}
    </div>
  );
}
