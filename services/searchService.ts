/**
 * Search Service
 *
 * Business logic layer for search functionality.
 * Provides graceful degradation when Typesense is not available.
 */

import 'server-only';

import { type Post } from '../domain/models';
import {
  getTypesenseSearchClient,
  isTypesenseConfigured,
  typesenseDocToPost,
  type TypesensePost,
} from '../adapters/typesenseAdapter';
import { TYPESENSE_COLLECTION } from '../lib/config';
import { logger } from '../lib/logger';

/**
 * Search parameters
 */
export interface SearchParams {
  query: string;
  limit?: number;
  page?: number;
}

/**
 * Search results with metadata
 */
export interface SearchResult {
  posts: Post[];
  totalFound: number;
  searchTimeMs: number;
}

const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

/**
 * Check if search functionality is available.
 * Returns false if Typesense is not configured or cannot be reached.
 */
export async function isSearchAvailable(): Promise<boolean> {
  if (!isTypesenseConfigured()) {
    return false;
  }

  const client = getTypesenseSearchClient();
  if (!client) {
    return false;
  }

  try {
    await client.health.retrieve();
    return true;
  } catch {
    logger.warn('Typesense health check failed');
    return false;
  }
}

/**
 * Search posts by query.
 * Sorts by points (descending) then by commentCount (descending).
 *
 * @param params - Search parameters
 * @returns Search results with metadata
 * @throws Error if search is not available
 */
export async function searchPosts(params: SearchParams): Promise<SearchResult> {
  const { query, limit = DEFAULT_LIMIT, page = DEFAULT_PAGE } = params;

  if (!isTypesenseConfigured()) {
    throw new Error('Search is not available');
  }

  const client = getTypesenseSearchClient();
  if (!client) {
    throw new Error('Search is not available');
  }

  const start = Date.now();

  try {
    const searchResult = await client
      .collections(TYPESENSE_COLLECTION)
      .documents()
      .search({
        q: query,
        query_by: 'title,text,author',
        sort_by: 'points:desc,commentCount:desc',
        per_page: limit,
        page: page,
      });

    const posts = (searchResult.hits ?? [])
      .map((hit) => typesenseDocToPost(hit.document as TypesensePost))
      .filter((post): post is Post => post !== null);

    const searchTimeMs = Date.now() - start;

    logger.info(
      {
        query,
        totalFound: searchResult.found,
        returned: posts.length,
        searchTimeMs,
      },
      'Search completed'
    );

    return {
      posts,
      totalFound: searchResult.found ?? 0,
      searchTimeMs,
    };
  } catch (error) {
    logger.error({ error, query }, 'Search failed');
    throw error;
  }
}
