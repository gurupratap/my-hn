'use client';

/**
 * usePosts Hook
 *
 * Client-side hook for fetching and managing posts state.
 * Provides loading, error, and data states with refetch capability.
 */

import { useState, useEffect, useCallback } from 'react';
import { type Post } from '../domain/models';
import { type SortType } from '../services/postsService';

interface UsePostsParams {
  /** Sort order for posts */
  sort?: SortType;
  /** Number of posts per page */
  pageSize?: number;
  /** Initial page number */
  initialPage?: number;
}

interface UsePostsResult {
  /** Array of fetched posts */
  posts: Post[];
  /** Whether posts are currently being fetched */
  loading: boolean;
  /** Error object if fetch failed */
  error: Error | null;
  /** Current page number */
  page: number;
  /** Whether there are more posts to load */
  hasMore: boolean;
  /** Refetch posts from the beginning */
  refetch: () => Promise<void>;
  /** Load the next page of posts */
  loadMore: () => Promise<void>;
}

/**
 * Hook for fetching posts with pagination support.
 *
 * @param params - Configuration options
 * @returns Posts state and control functions
 *
 * @example
 * const { posts, loading, error, refetch, loadMore } = usePosts({ sort: 'top' });
 */
export function usePosts(params: UsePostsParams = {}): UsePostsResult {
  const { sort = 'top', pageSize = 30, initialPage = 1 } = params;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(
    async (pageNum: number, append: boolean = false) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/posts?sort=${sort}&page=${pageNum}&pageSize=${pageSize}`
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

        if (append) {
          setPosts((prev) => [...prev, ...postsWithDates]);
        } else {
          setPosts(postsWithDates);
        }

        setHasMore(postsWithDates.length === pageSize);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    },
    [sort, pageSize]
  );

  // Initial fetch
  useEffect(() => {
    setPage(initialPage);
    setPosts([]);
    fetchPosts(initialPage, false);
  }, [sort, pageSize, initialPage, fetchPosts]);

  const refetch = useCallback(async () => {
    setPage(initialPage);
    setPosts([]);
    await fetchPosts(initialPage, false);
  }, [initialPage, fetchPosts]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    const nextPage = page + 1;
    setPage(nextPage);
    await fetchPosts(nextPage, true);
  }, [loading, hasMore, page, fetchPosts]);

  return {
    posts,
    loading,
    error,
    page,
    hasMore,
    refetch,
    loadMore,
  };
}
