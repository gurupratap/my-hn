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

import { useState, useRef } from 'react';
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
}: PostListContainerProps) {
  // Track which tabs have been visited and their initial posts
  // Using refs to avoid re-renders when other tabs update
  const visitedTabs = useRef<Set<SortType>>(new Set([activeSort]));
  const tabPosts = useRef<Record<SortType, Post[]>>({
    top: activeSort === 'top' ? initialPosts : [],
    new: activeSort === 'new' ? initialPosts : [],
    best: activeSort === 'best' ? initialPosts : [],
  });

  // Force re-render only when needed
  const [, forceUpdate] = useState(0);

  // Only initialize a tab's data on FIRST visit
  if (initialPosts.length > 0 && !visitedTabs.current.has(activeSort)) {
    visitedTabs.current.add(activeSort);
    tabPosts.current[activeSort] = initialPosts;
    // Force re-render to show the new tab's posts
    forceUpdate((n) => n + 1);
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
            initialPosts={tabPosts.current[sort]}
            sort={sort}
            pageSize={pageSize}
          />
        </div>
      ))}
    </div>
  );
}
