/**
 * Comments API Route
 *
 * Handles GET requests for paginated comments on a post.
 * Used by client components for load more functionality.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCommentsPaginated } from '../../../services/commentsService';
import { NotFoundError } from '../../../lib/errors';
import { parseIntParam, isValidPage, isValidPageSize } from '../../../lib/apiUtils';

function isValidPostId(postId: number): boolean {
  return postId >= 1;
}

/**
 * GET /api/comments
 *
 * Query parameters:
 * - postId: number (required)
 * - page: number (default: 1)
 * - pageSize: number (default: 10)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);

  const postIdParam = searchParams.get('postId');
  if (!postIdParam) {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 });
  }

  const postId = parseIntParam(postIdParam, 0);
  const page = parseIntParam(searchParams.get('page'), 1);
  const pageSize = parseIntParam(searchParams.get('pageSize'), 10);

  if (!isValidPostId(postId)) {
    return NextResponse.json({ error: 'Invalid postId parameter' }, { status: 400 });
  }

  if (!isValidPage(page)) {
    return NextResponse.json({ error: 'Invalid page parameter' }, { status: 400 });
  }

  if (!isValidPageSize(pageSize, 50)) {
    return NextResponse.json({ error: 'Invalid pageSize parameter' }, { status: 400 });
  }

  try {
    const result = await getCommentsPaginated(postId, page, pageSize);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: 'Comments not found for the given post' }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to fetch comments: ${message}` }, { status: 500 });
  }
}
