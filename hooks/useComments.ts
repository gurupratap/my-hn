'use client';

/**
 * useComments Hook
 *
 * Client-side hook for fetching and managing comments state.
 * Provides loading, error, and data states with refetch capability.
 */

import { useState, useEffect, useCallback } from 'react';
import { type Comment } from '../domain/models';

interface UseCommentsParams {
  /** Post ID to fetch comments for */
  postId: number;
  /** Maximum depth for nested comments */
  maxDepth?: number;
}

interface UseCommentsResult {
  /** Array of fetched comments (nested tree) */
  comments: Comment[];
  /** Whether comments are currently being fetched */
  loading: boolean;
  /** Error object if fetch failed */
  error: Error | null;
  /** Refetch comments */
  refetch: () => Promise<void>;
}

/**
 * Recursively converts date strings to Date objects in comment tree.
 */
function convertCommentDates(comments: Comment[]): Comment[] {
  return comments.map((comment) => ({
    ...comment,
    createdAt: new Date(comment.createdAt),
    children: convertCommentDates(comment.children),
  }));
}

/**
 * Hook for fetching comments for a post.
 *
 * @param params - Configuration options
 * @returns Comments state and control functions
 *
 * @example
 * const { comments, loading, error, refetch } = useComments({ postId: 123 });
 */
export function useComments(params: UseCommentsParams): UseCommentsResult {
  const { postId, maxDepth = 3 } = params;

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/posts/${postId}/comments?maxDepth=${maxDepth}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.status}`);
      }

      const data: Comment[] = await response.json();

      // Convert date strings back to Date objects
      setComments(convertCommentDates(data));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [postId, maxDepth]);

  // Fetch on mount and when params change
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const refetch = useCallback(async () => {
    await fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    error,
    refetch,
  };
}
