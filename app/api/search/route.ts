/**
 * Search API Route
 *
 * Handles GET requests for searching posts.
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchPosts, isSearchAvailable } from '../../../services/searchService';
import { parseIntParam, isValidPage, isValidPageSize } from '../../../lib/apiUtils';

/**
 * GET /api/search
 *
 * Query parameters:
 * - q: search query (required, minimum 2 characters)
 * - limit: number of results (default: 10, max: 50)
 * - page: page number (default: 1)
 *
 * Returns:
 * - posts: array of Post objects
 * - totalFound: total number of matching posts
 * - searchTimeMs: search duration in milliseconds
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get('q');
  const limit = parseIntParam(searchParams.get('limit'), 10);
  const page = parseIntParam(searchParams.get('page'), 1);

  // Validate query
  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required and must be at least 2 characters' },
      { status: 400 }
    );
  }

  // Validate pagination
  if (!isValidPage(page)) {
    return NextResponse.json({ error: 'Invalid page parameter' }, { status: 400 });
  }

  if (!isValidPageSize(limit, 50)) {
    return NextResponse.json(
      { error: 'Invalid limit parameter (must be 1-50)' },
      { status: 400 }
    );
  }

  // Check if search is available
  const available = await isSearchAvailable();
  if (!available) {
    return NextResponse.json(
      { error: 'Search is currently unavailable' },
      { status: 503 }
    );
  }

  try {
    const result = await searchPosts({
      query: query.trim(),
      limit,
      page,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Search failed: ${message}` },
      { status: 500 }
    );
  }
}
