/**
 * Cron Ingestion API Route
 *
 * Handles GET requests to ingest posts from HN Firebase API into Typesense.
 * Protected by CRON_SECRET for security.
 */

import { NextRequest, NextResponse } from 'next/server';
import { hackerNewsAdapter } from '../../../../adapters/hackerNewsAdapter';
import {
  ensureCollection,
  indexPosts,
  isTypesenseConfigured,
} from '../../../../adapters/typesenseAdapter';
import { CRON_SECRET } from '../../../../lib/config';
import { logger } from '../../../../lib/logger';

const POSTS_PER_CATEGORY = 100;

/**
 * Verify the request is authorized using CRON_SECRET.
 * Supports both query parameter and Authorization header.
 */
function isAuthorized(request: NextRequest): boolean {
  // If no secret is configured, deny access in production
  if (!CRON_SECRET) {
    logger.warn('CRON_SECRET not configured');
    return false;
  }

  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get('secret');
  const authHeader = request.headers.get('authorization');

  // Check query parameter
  if (querySecret === CRON_SECRET) {
    return true;
  }

  // Check Authorization header (Bearer token)
  if (authHeader && authHeader === `Bearer ${CRON_SECRET}`) {
    return true;
  }

  return false;
}

/**
 * GET /api/cron/ingest
 *
 * Query parameters:
 * - secret: CRON_SECRET for authorization
 *
 * Or Authorization header:
 * - Authorization: Bearer <CRON_SECRET>
 *
 * Returns:
 * - success: boolean
 * - postsIndexed: number of posts successfully indexed
 * - durationMs: time taken in milliseconds
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const start = Date.now();

  // Check authorization
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if Typesense is configured
  if (!isTypesenseConfigured()) {
    return NextResponse.json(
      { error: 'Typesense is not configured' },
      { status: 503 }
    );
  }

  try {
    // Ensure collection exists
    await ensureCollection();

    // Fetch post IDs from all categories in parallel
    const [topIds, newIds, bestIds] = await Promise.all([
      hackerNewsAdapter.getTopPostIds(),
      hackerNewsAdapter.getNewPostIds(),
      hackerNewsAdapter.getBestPostIds(),
    ]);

    // Slice to get top N from each category
    const topSlice = topIds.slice(0, POSTS_PER_CATEGORY);
    const newSlice = newIds.slice(0, POSTS_PER_CATEGORY);
    const bestSlice = bestIds.slice(0, POSTS_PER_CATEGORY);

    // Deduplicate IDs
    const uniqueIds = [...new Set([...topSlice, ...newSlice, ...bestSlice])];

    logger.info(
      {
        topCount: topSlice.length,
        newCount: newSlice.length,
        bestCount: bestSlice.length,
        uniqueCount: uniqueIds.length,
      },
      'Fetching posts for ingestion'
    );

    // Fetch all posts in batches to avoid overwhelming the API
    const BATCH_SIZE = 50;
    const allPosts = [];

    for (let i = 0; i < uniqueIds.length; i += BATCH_SIZE) {
      const batchIds = uniqueIds.slice(i, i + BATCH_SIZE);
      const batchPosts = await hackerNewsAdapter.getPostsByIds(batchIds);
      allPosts.push(...batchPosts);
    }

    // Index posts into Typesense
    const postsIndexed = await indexPosts(allPosts);

    const durationMs = Date.now() - start;

    logger.info(
      {
        postsIndexed,
        totalFetched: allPosts.length,
        durationMs,
      },
      'Ingestion completed'
    );

    return NextResponse.json({
      success: true,
      postsIndexed,
      totalFetched: allPosts.length,
      durationMs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ error }, 'Ingestion failed');

    return NextResponse.json(
      {
        success: false,
        error: `Ingestion failed: ${message}`,
        durationMs: Date.now() - start,
      },
      { status: 500 }
    );
  }
}
