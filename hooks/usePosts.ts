'use client';

/**
 * usePosts Hook
 *
 * Client-side hook for managing posts with load more functionality.
 * Supports SSR hydration via initialPosts prop.
 */

import { useState, useEffect, useCallback } from 'react';
import { type Post } from '../domain/models';
import { type SortType } from '../services/postsService';

interface UsePostsParams {
  /** Initial posts from server (SSR hydration) */
  initialPosts: Post[];
  /** Sort order for posts */
  sort: SortType;
  /** Number of posts per page */
  pageSize?: number;
}

interface UsePostsResult {
  /** Array of posts */
  posts: Post[];
  /** Whether posts are being fetched */
  loading: boolean;
  /** Whether there are more posts to load */
  hasMore: boolean;
  /** Load the next page of posts */
  loadMore: () => Promise<void>;
}

/**
 * Hook for managing posts with pagination and SSR support.
 */
export function usePosts({
  initialPosts,
  sort,
  pageSize = 30,
}: UsePostsParams): UsePostsResult {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length === pageSize);

  // Reset state when sort or initialPosts change (navigation)
  useEffect(() => {
    setPosts(initialPosts);
    setPage(1);
    setHasMore(initialPosts.length === pageSize);
  }, [sort, initialPosts, pageSize]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const nextPage = page + 1;
      const response = await fetch(
        `/api/posts?sort=${sort}&page=${nextPage}&pageSize=${pageSize}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`);
      }

      const newPosts: Post[] = await response.json();

      // Convert date strings back to Date objects
      const postsWithDates = newPosts.map((post) => ({
        ...post,
        createdAt: new Date(post.createdAt),
      }));

      // Deduplicate posts by ID to avoid key conflicts
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const uniqueNewPosts = postsWithDates.filter((p) => !existingIds.has(p.id));
        return [...prev, ...uniqueNewPosts];
      });

      setPage(nextPage);
      setHasMore(postsWithDates.length === pageSize);
    } catch (error) {
      console.error('Failed to load more posts:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, sort, pageSize]);

  return { posts, loading, hasMore, loadMore };
}
