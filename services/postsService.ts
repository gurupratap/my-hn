/**
 * Posts Service
 *
 * Business logic layer for fetching and managing posts.
 * Orchestrates adapter calls and handles pagination.
 */

import { type Post } from '../domain/models';
import { getAdapter } from '../adapters';

/**
 * Sort type for post listings
 */
export type SortType = 'top' | 'new' | 'best';

/**
 * Parameters for fetching posts
 */
export interface FetchPostsParams {
  /** Sort order for posts */
  sort?: SortType;
  /** Number of posts per page */
  pageSize?: number;
  /** Page number (1-indexed) */
  page?: number;
}

const DEFAULT_PAGE_SIZE = 30;
const DEFAULT_PAGE = 1;

/**
 * Fetches a paginated list of posts based on sort order.
 *
 * @param params - Fetch parameters (sort, pageSize, page)
 * @returns Array of posts for the requested page
 */
export async function fetchPosts(params: FetchPostsParams = {}): Promise<Post[]> {
  const {
    sort = 'top',
    pageSize = DEFAULT_PAGE_SIZE,
    page = DEFAULT_PAGE,
  } = params;

  const adapter = getAdapter();

  // Get post IDs based on sort type
  let postIds: number[];
  switch (sort) {
    case 'new':
      postIds = await adapter.getNewPostIds();
      break;
    case 'best':
      postIds = await adapter.getBestPostIds();
      break;
    case 'top':
    default:
      postIds = await adapter.getTopPostIds();
      break;
  }

  // Calculate pagination slice
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedIds = postIds.slice(startIndex, endIndex);

  // Return empty array if no posts in range
  if (paginatedIds.length === 0) {
    return [];
  }

  // Batch fetch posts
  return adapter.getPostsByIds(paginatedIds);
}

/**
 * Fetches a single post by ID.
 *
 * @param id - Post ID
 * @returns The requested post
 * @throws NotFoundError if post doesn't exist
 */
export async function getPostById(id: number): Promise<Post> {
  const adapter = getAdapter();
  return adapter.getPostById(id);
}
