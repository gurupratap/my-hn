'use client';

/**
 * PostListContainer Component
 *
 * Mounts all three tab lists simultaneously, showing only the active one.
 * This approach:
 * - Preserves scroll position naturally (each tab has its own DOM container)
 * - Eliminates race conditions between save/restore operations
 * - Provides instant tab switches after first visit
 */

import { useState } from 'react';
import type { Post } from '../domain/models';
import type { SortType } from '../services/postsService';
import VirtualizedPostList from './VirtualizedPostList';

interface PostListContainerProps {
  /** Initial posts for the active tab (from server) */
  initialPosts: Post[];
  /** Currently active sort/tab */
  activeSort: SortType;
  /** Number of posts per page */
  pageSize?: number;
}

const SORT_TYPES: SortType[] = ['top', 'new', 'best'];

export default function PostListContainer({
  initialPosts,
  activeSort,
  pageSize = 20,
}: PostListContainerProps): React.JSX.Element {
  // State for posts per tab
  const [tabPosts, setTabPosts] = useState<Record<SortType, Post[]>>(() => ({
    top: activeSort === 'top' ? initialPosts : [],
    new: activeSort === 'new' ? initialPosts : [],
    best: activeSort === 'best' ? initialPosts : [],
  }));

  // Track which tabs have been initialized
  const [initializedTabs, setInitializedTabs] = useState<Set<SortType>>(
    () => new Set([activeSort])
  );

  // React's recommended pattern for adjusting state when props change
  // See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (initialPosts.length > 0 && !initializedTabs.has(activeSort)) {
    setInitializedTabs(new Set([...initializedTabs, activeSort]));
    setTabPosts({
      ...tabPosts,
      [activeSort]: initialPosts,
    });
  }

  return (
    <div className="relative min-h-0 flex-1">
      {SORT_TYPES.map((sort) => (
        <div
          key={sort}
          data-tab={sort}
          data-active={sort === activeSort}
          className={`absolute inset-0 flex flex-col ${
            sort === activeSort ? 'visible z-10' : 'invisible z-0'
          }`}
        >
          <VirtualizedPostList
            initialPosts={tabPosts[sort]}
            sort={sort}
            pageSize={pageSize}
          />
        </div>
      ))}
    </div>
  );
}
