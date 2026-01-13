/**
 * Posts API Route
 *
 * Handles GET requests for paginated post lists.
 * Used by client components for load more functionality.
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchPosts, type SortType } from '../../../services/postsService';

function isValidSort(sort: string | null): sort is SortType {
  return sort === 'top' || sort === 'new' || sort === 'best';
}

function parseIntParam(value: string | null, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function isValidPage(page: number): boolean {
  return page >= 1;
}

function isValidPageSize(pageSize: number): boolean {
  return pageSize >= 1 && pageSize <= 100;
}

/**
 * GET /api/posts
 *
 * Query parameters:
 * - sort: 'top' | 'new' | 'best' (default: 'top')
 * - page: number (default: 1)
 * - pageSize: number (default: 30)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);

  const sortParam = searchParams.get('sort');
  const sort: SortType = isValidSort(sortParam) ? sortParam : 'top';
  const page = parseIntParam(searchParams.get('page'), 1);
  const pageSize = parseIntParam(searchParams.get('pageSize'), 30);

  if (!isValidPage(page)) {
    return NextResponse.json({ error: 'Invalid page parameter' }, { status: 400 });
  }

  if (!isValidPageSize(pageSize)) {
    return NextResponse.json({ error: 'Invalid pageSize parameter' }, { status: 400 });
  }

  try {
    const posts = await fetchPosts({ sort, page, pageSize });
    return NextResponse.json(posts);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to fetch posts: ${message}` }, { status: 500 });
  }
}
