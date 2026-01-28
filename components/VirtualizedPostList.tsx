'use client';

import { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Post } from '../domain/models';
import type { SortType } from '../services/postsService';
import { usePosts } from '../hooks/usePosts';
import PostItem from './PostItem';
import InfiniteScrollContainer from './InfiniteScrollContainer';

interface VirtualizedPostListProps {
  initialPosts: Post[];
  sort: SortType;
  pageSize?: number;
}

const ESTIMATED_ITEM_HEIGHT = 90;

export default function VirtualizedPostList({
  initialPosts,
  sort,
  pageSize = 20,
}: VirtualizedPostListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<Map<SortType, number>>(new Map());
  const prevSort = useRef<SortType>(sort);

  const { posts, loading, hasMore, loadMore } = usePosts({
    initialPosts,
    sort,
    pageSize,
  });

  const virtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_ITEM_HEIGHT,
    overscan: 5,
    measureElement: (element) => element.getBoundingClientRect().height,
  });

  // Save/restore scroll position per sort tab
  useEffect(() => {
    // Save previous tab's scroll position
    if (parentRef.current && prevSort.current !== sort) {
      scrollPositions.current.set(prevSort.current, parentRef.current.scrollTop);
    }

    // Restore current tab's scroll position after render (or 0 if first visit)
    // Use requestAnimationFrame to ensure DOM is ready (important for mobile)
    const rafId = requestAnimationFrame(() => {
      if (parentRef.current) {
        const savedPosition = scrollPositions.current.get(sort) ?? 0;
        parentRef.current.scrollTop = savedPosition;
      }
    });

    prevSort.current = sort;

    return () => cancelAnimationFrame(rafId);
  }, [sort]);

  const virtualItems = virtualizer.getVirtualItems();

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-gray-500">
        No posts available
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div
        ref={parentRef}
        className="flex-1 overflow-auto"
      >
        <InfiniteScrollContainer
          onLoadMore={loadMore}
          loading={loading}
          hasMore={hasMore}
          endMessage="End of posts"
          rootMargin="400px"
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualItems.map((virtualItem) => (
              <div
                key={posts[virtualItem.index].id}
                ref={virtualizer.measureElement}
                data-index={virtualItem.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <PostItem
                  post={posts[virtualItem.index]}
                  rank={virtualItem.index + 1}
                />
              </div>
            ))}
          </div>
        </InfiniteScrollContainer>
      </div>
    </div>
  );
}
