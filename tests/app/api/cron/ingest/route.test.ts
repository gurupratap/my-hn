/**
 * @jest-environment node
 */

/**
 * Tests for Cron Ingest API Route
 */

import { NextRequest } from 'next/server';

// Mock the adapters with factory functions
jest.mock('../../../../../adapters/hackerNewsAdapter', () => ({
  hackerNewsAdapter: {
    getTopPostIds: jest.fn(),
    getNewPostIds: jest.fn(),
    getBestPostIds: jest.fn(),
    getPostsByIds: jest.fn(),
  },
}));

jest.mock('../../../../../adapters/typesenseAdapter', () => ({
  ensureCollection: jest.fn(),
  indexPosts: jest.fn(),
  isTypesenseConfigured: jest.fn(),
}));

// Mock config with CRON_SECRET
jest.mock('../../../../../lib/config', () => ({
  CRON_SECRET: 'test-cron-secret',
}));

// Mock logger
jest.mock('../../../../../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

// Import after mocking
import { GET } from '../../../../../app/api/cron/ingest/route';
import { hackerNewsAdapter } from '../../../../../adapters/hackerNewsAdapter';
import { ensureCollection, indexPosts, isTypesenseConfigured } from '../../../../../adapters/typesenseAdapter';

const mockGetTopPostIds = hackerNewsAdapter.getTopPostIds as jest.Mock;
const mockGetNewPostIds = hackerNewsAdapter.getNewPostIds as jest.Mock;
const mockGetBestPostIds = hackerNewsAdapter.getBestPostIds as jest.Mock;
const mockGetPostsByIds = hackerNewsAdapter.getPostsByIds as jest.Mock;
const mockEnsureCollection = ensureCollection as jest.Mock;
const mockIndexPosts = indexPosts as jest.Mock;
const mockIsTypesenseConfigured = isTypesenseConfigured as jest.Mock;

describe('GET /api/cron/ingest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsTypesenseConfigured.mockReturnValue(true);
    mockGetTopPostIds.mockResolvedValue([1, 2, 3, 4, 5]);
    mockGetNewPostIds.mockResolvedValue([6, 7, 8, 9, 10]);
    mockGetBestPostIds.mockResolvedValue([1, 3, 5, 7, 9]); // Some overlap
    mockGetPostsByIds.mockResolvedValue([
      { id: 1, title: 'Post 1', type: 'story', author: 'user1', points: 100, commentCount: 10, commentIds: [], createdAt: new Date() },
      { id: 2, title: 'Post 2', type: 'story', author: 'user2', points: 90, commentCount: 8, commentIds: [], createdAt: new Date() },
    ]);
    mockEnsureCollection.mockResolvedValue(undefined);
    mockIndexPosts.mockResolvedValue(2);
  });

  function createRequest(url: string, headers?: Record<string, string>): NextRequest {
    const req = new NextRequest(new URL(url, 'http://localhost'), {
      headers: headers ? new Headers(headers) : undefined,
    });
    return req;
  }

  describe('authorization', () => {
    it('returns 401 when no secret is provided', async () => {
      const request = createRequest('/api/cron/ingest');
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 401 when query secret is wrong', async () => {
      const request = createRequest('/api/cron/ingest?secret=wrong-secret');
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 401 when authorization header is wrong', async () => {
      const request = createRequest('/api/cron/ingest', {
        Authorization: 'Bearer wrong-secret',
      });
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('accepts valid query parameter secret', async () => {
      const request = createRequest('/api/cron/ingest?secret=test-cron-secret');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('accepts valid authorization header', async () => {
      const request = createRequest('/api/cron/ingest', {
        Authorization: 'Bearer test-cron-secret',
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Typesense configuration', () => {
    it('returns 503 when Typesense is not configured', async () => {
      mockIsTypesenseConfigured.mockReturnValue(false);

      const request = createRequest('/api/cron/ingest?secret=test-cron-secret');
      const response = await GET(request);

      expect(response.status).toBe(503);
      const data = await response.json();
      expect(data.error).toBe('Typesense is not configured');
    });
  });

  describe('successful ingestion', () => {
    it('returns success response with counts', async () => {
      const request = createRequest('/api/cron/ingest?secret=test-cron-secret');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.postsIndexed).toBe(2);
      expect(data.totalFetched).toBeDefined();
      expect(data.durationMs).toBeDefined();
    });

    it('ensures collection exists before indexing', async () => {
      const request = createRequest('/api/cron/ingest?secret=test-cron-secret');
      await GET(request);

      expect(mockEnsureCollection).toHaveBeenCalled();
    });

    it('fetches posts from all three categories in parallel', async () => {
      const request = createRequest('/api/cron/ingest?secret=test-cron-secret');
      await GET(request);

      expect(mockGetTopPostIds).toHaveBeenCalled();
      expect(mockGetNewPostIds).toHaveBeenCalled();
      expect(mockGetBestPostIds).toHaveBeenCalled();
    });

    it('deduplicates post IDs from different categories', async () => {
      mockGetTopPostIds.mockResolvedValue([1, 2, 3]);
      mockGetNewPostIds.mockResolvedValue([2, 3, 4]);
      mockGetBestPostIds.mockResolvedValue([3, 4, 5]);

      const request = createRequest('/api/cron/ingest?secret=test-cron-secret');
      await GET(request);

      // getPostsByIds should be called with unique IDs
      const calledIds = mockGetPostsByIds.mock.calls.flat().flat();
      const uniqueIds = [...new Set(calledIds)];
      expect(uniqueIds.length).toBe(calledIds.length);
    });

    it('indexes fetched posts', async () => {
      const request = createRequest('/api/cron/ingest?secret=test-cron-secret');
      await GET(request);

      expect(mockIndexPosts).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('returns 500 when ensureCollection fails', async () => {
      mockEnsureCollection.mockRejectedValue(new Error('Collection error'));

      const request = createRequest('/api/cron/ingest?secret=test-cron-secret');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Ingestion failed');
    });

    it('returns 500 when fetching posts fails', async () => {
      mockGetTopPostIds.mockRejectedValue(new Error('API error'));

      const request = createRequest('/api/cron/ingest?secret=test-cron-secret');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it('returns 500 when indexing fails', async () => {
      mockIndexPosts.mockRejectedValue(new Error('Index error'));

      const request = createRequest('/api/cron/ingest?secret=test-cron-secret');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it('includes durationMs in error response', async () => {
      mockIndexPosts.mockRejectedValue(new Error('Index error'));

      const request = createRequest('/api/cron/ingest?secret=test-cron-secret');
      const response = await GET(request);

      const data = await response.json();
      expect(data.durationMs).toBeDefined();
      expect(typeof data.durationMs).toBe('number');
    });
  });

  describe('CRON_SECRET not configured', () => {
    it('returns 401 when CRON_SECRET is not set', async () => {
      jest.resetModules();
      jest.doMock('../../../../../lib/config', () => ({
        CRON_SECRET: undefined,
      }));

      // Re-import the route with new mock
      const { GET: GET2 } = require('../../../../../app/api/cron/ingest/route');

      const request = createRequest('/api/cron/ingest?secret=any-secret');
      const response = await GET2(request);

      expect(response.status).toBe(401);
    });
  });
});
