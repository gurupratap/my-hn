'use client';

/**
 * useComments Hook
 *
 * Client-side hook for managing comments with load more functionality.
 * Supports SSR hydration via initialComments prop.
 */

import { useState, useEffect, useCallback } from 'react';
import { type Comment } from '../domain/models';

interface UseCommentsParams {
  /** Post ID to fetch comments for */
  postId: number;
  /** Initial comments from server (SSR hydration) */
  initialComments: Comment[];
  /** Whether there are more comments to load initially */
  initialHasMore: boolean;
  /** Number of comments per page */
  pageSize?: number;
}

interface UseCommentsResult {
  /** Array of comments */
  comments: Comment[];
  /** Whether comments are being fetched */
  loading: boolean;
  /** Whether there are more comments to load */
  hasMore: boolean;
  /** Load the next page of comments */
  loadMore: () => Promise<void>;
}

/**
 * Recursively converts date strings to Date objects in comment tree.
 */
function convertCommentDates(comment: Comment): Comment {
  return {
    ...comment,
    createdAt: new Date(comment.createdAt),
    children: comment.children.map(convertCommentDates),
  };
}

/**
 * Hook for managing comments with pagination and SSR support.
 */
export function useComments({
  postId,
  initialComments,
  initialHasMore,
  pageSize = 10,
}: UseCommentsParams): UseCommentsResult {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);

  // Reset state when postId or initialComments change
  useEffect(() => {
    setComments(initialComments);
    setPage(1);
    setHasMore(initialHasMore);
  }, [postId]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const nextPage = page + 1;
      const response = await fetch(
        `/api/comments?postId=${postId}&page=${nextPage}&pageSize=${pageSize}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.status}`);
      }

      const data = await response.json();
      const newComments: Comment[] = data.comments;
      const commentsWithDates = newComments.map(convertCommentDates);

      // Deduplicate comments by ID
      setComments((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const uniqueNewComments = commentsWithDates.filter((c) => !existingIds.has(c.id));
        return [...prev, ...uniqueNewComments];
      });

      setPage(nextPage);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Failed to load more comments:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, postId, pageSize]);

  return { comments, loading, hasMore, loadMore };
}
