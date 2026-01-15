/**
 * Comments Service
 *
 * Business logic layer for fetching and managing comments.
 * Builds nested comment trees with configurable depth limiting.
 */

import { type Comment } from '../domain/models';
import { getAdapter } from '../adapters';
import { NotFoundError } from '../lib/errors';
import { logger } from '../lib/logger';

/**
 * Parameters for fetching comments
 */
export interface GetCommentsParams {
  /** Post ID to fetch comments for */
  postId: number;
  /** Maximum depth for nested comments (default: 3) */
  maxDepth?: number;
}

const DEFAULT_MAX_DEPTH = 3;

/**
 * Fetches a single comment by ID, returning null if not found or deleted.
 * This gracefully handles missing/deleted comments.
 */
async function fetchCommentSafe(id: number): Promise<Comment | null> {
  const adapter = getAdapter();
  try {
    const comment = await adapter.getCommentById(id);
    // Skip deleted or dead comments
    if (comment.deleted || comment.dead) {
      return null;
    }
    return comment;
  } catch (error) {
    if (error instanceof NotFoundError) {
      logger.debug({ commentId: id }, 'Comment not found, skipping');
      return null;
    }
    throw error;
  }
}

/**
 * Recursively fetches comments and builds a nested tree.
 *
 * @param commentIds - Array of comment IDs to fetch
 * @param currentDepth - Current recursion depth
 * @param maxDepth - Maximum allowed depth
 * @returns Array of comments with nested children
 */
async function fetchCommentsRecursive(
  commentIds: number[],
  currentDepth: number,
  maxDepth: number
): Promise<Comment[]> {
  if (commentIds.length === 0 || currentDepth > maxDepth) {
    return [];
  }

  // Fetch all comments at this level in parallel
  const commentPromises = commentIds.map((id) => fetchCommentSafe(id));
  const comments = await Promise.all(commentPromises);

  // Filter out null (missing/deleted) comments
  const validComments = comments.filter((c): c is Comment => c !== null);

  // If we haven't reached max depth, fetch children recursively
  if (currentDepth < maxDepth) {
    const commentsWithChildren = await Promise.all(
      validComments.map(async (comment) => {
        if (comment.commentIds.length > 0) {
          const children = await fetchCommentsRecursive(
            comment.commentIds,
            currentDepth + 1,
            maxDepth
          );
          return { ...comment, children };
        }
        return comment;
      })
    );
    return commentsWithChildren;
  }

  return validComments;
}

/**
 * Fetches all comments for a post as a nested tree.
 *
 * @param postId - Post ID to fetch comments for
 * @param maxDepth - Maximum nesting depth (default: 3)
 * @returns Array of top-level comments with nested children
 * @throws NotFoundError if post doesn't exist
 */
export async function getCommentsByPostId(
  postId: number,
  maxDepth: number = DEFAULT_MAX_DEPTH
): Promise<Comment[]> {
  const adapter = getAdapter();

  // Fetch the post to get top-level comment IDs
  const post = await adapter.getPostById(postId);

  if (post.commentIds.length === 0) {
    return [];
  }

  // Recursively fetch comments starting at depth 1
  return fetchCommentsRecursive(post.commentIds, 1, maxDepth);
}

/**
 * Fetches comments using params object.
 * Convenience wrapper for getCommentsByPostId.
 */
export async function getComments(params: GetCommentsParams): Promise<Comment[]> {
  return getCommentsByPostId(params.postId, params.maxDepth);
}

/**
 * Fetches paginated top-level comments for a post.
 *
 * @param postId - Post ID to fetch comments for
 * @param page - Page number (1-indexed, default: 1)
 * @param pageSize - Number of top-level comments per page (default: 10)
 * @param maxDepth - Maximum nesting depth (default: 3)
 * @returns Object with comments array, total count, and hasMore flag
 */
export async function getCommentsPaginated(
  postId: number,
  page: number = 1,
  pageSize: number = 10,
  maxDepth: number = DEFAULT_MAX_DEPTH
): Promise<{ comments: Comment[]; totalComments: number; hasMore: boolean }> {
  const adapter = getAdapter();

  // Fetch the post to get top-level comment IDs
  const post = await adapter.getPostById(postId);
  const totalComments = post.commentIds.length;

  if (totalComments === 0) {
    return { comments: [], totalComments: 0, hasMore: false };
  }

  // Calculate pagination bounds
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedIds = post.commentIds.slice(startIndex, endIndex);
  const hasMore = endIndex < totalComments;

  if (paginatedIds.length === 0) {
    return { comments: [], totalComments, hasMore: false };
  }

  // Fetch comments for this page
  const comments = await fetchCommentsRecursive(paginatedIds, 1, maxDepth);

  return { comments, totalComments, hasMore };
}
