/**
 * @jest-environment node
 */

/**
 * Tests for Search API Route
 */

import { NextRequest } from 'next/server';

// Mock the search service with factory functions
jest.mock('../../../../services/searchService', () => ({
  searchPosts: jest.fn(),
  isSearchAvailable: jest.fn(),
}));

// Mock logger
jest.mock('../../../../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

// Import after mocking
import { GET } from '../../../../app/api/search/route';
import { searchPosts, isSearchAvailable } from '../../../../services/searchService';

const mockSearchPosts = searchPosts as jest.MockedFunction<typeof searchPosts>;
const mockIsSearchAvailable = isSearchAvailable as jest.MockedFunction<typeof isSearchAvailable>;

describe('GET /api/search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsSearchAvailable.mockResolvedValue(true);
  });

  function createRequest(url: string): NextRequest {
    return new NextRequest(new URL(url, 'http://localhost'));
  }

  describe('validation', () => {
    it('returns 400 when query parameter is missing', async () => {
      const request = createRequest('/api/search');
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Query parameter "q" is required');
    });

    it('returns 400 when query is empty', async () => {
      const request = createRequest('/api/search?q=');
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Query parameter "q" is required');
    });

    it('returns 400 when query is too short', async () => {
      const request = createRequest('/api/search?q=a');
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('at least 2 characters');
    });

    it('returns 400 when page is invalid', async () => {
      const request = createRequest('/api/search?q=test&page=0');
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Invalid page');
    });

    it('returns 400 when page is negative', async () => {
      const request = createRequest('/api/search?q=test&page=-1');
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Invalid page');
    });

    it('returns 400 when limit is zero', async () => {
      const request = createRequest('/api/search?q=test&limit=0');
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Invalid limit');
    });

    it('returns 400 when limit exceeds maximum', async () => {
      const request = createRequest('/api/search?q=test&limit=100');
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Invalid limit');
    });
  });

  describe('search availability', () => {
    it('returns 503 when search is unavailable', async () => {
      mockIsSearchAvailable.mockResolvedValue(false);

      const request = createRequest('/api/search?q=test');
      const response = await GET(request);

      expect(response.status).toBe(503);
      const data = await response.json();
      expect(data.error).toContain('Search is currently unavailable');
    });
  });

  describe('successful search', () => {
    const mockSearchResult = {
      posts: [
        { id: 1, type: 'story' as const, title: 'Test Post', points: 100, author: 'user1', commentCount: 10, commentIds: [], createdAt: new Date().toISOString() },
        { id: 2, type: 'story' as const, title: 'Another Post', points: 80, author: 'user2', commentCount: 5, commentIds: [], createdAt: new Date().toISOString() },
      ],
      totalFound: 2,
      searchTimeMs: 15,
    };

    beforeEach(() => {
      mockSearchPosts.mockResolvedValue(mockSearchResult);
    });

    it('returns search results on success', async () => {
      const request = createRequest('/api/search?q=test');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.posts).toEqual(mockSearchResult.posts);
      expect(data.totalFound).toBe(2);
      expect(data.searchTimeMs).toBe(15);
    });

    it('trims whitespace from query', async () => {
      const request = createRequest('/api/search?q=  test  ');
      await GET(request);

      expect(mockSearchPosts).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'test' })
      );
    });

    it('uses default limit of 10', async () => {
      const request = createRequest('/api/search?q=test');
      await GET(request);

      expect(mockSearchPosts).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10 })
      );
    });

    it('uses default page of 1', async () => {
      const request = createRequest('/api/search?q=test');
      await GET(request);

      expect(mockSearchPosts).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 })
      );
    });

    it('passes custom limit and page', async () => {
      const request = createRequest('/api/search?q=test&limit=20&page=2');
      await GET(request);

      expect(mockSearchPosts).toHaveBeenCalledWith({
        query: 'test',
        limit: 20,
        page: 2,
      });
    });

    it('accepts limit at maximum (50)', async () => {
      const request = createRequest('/api/search?q=test&limit=50');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockSearchPosts).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 50 })
      );
    });
  });

  describe('error handling', () => {
    it('returns 500 when search throws an error', async () => {
      mockSearchPosts.mockRejectedValue(new Error('Database connection failed'));

      const request = createRequest('/api/search?q=test');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toContain('Search failed');
      expect(data.error).toContain('Database connection failed');
    });

    it('returns generic message for non-Error exceptions', async () => {
      mockSearchPosts.mockRejectedValue('Something went wrong');

      const request = createRequest('/api/search?q=test');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toContain('Unknown error');
    });
  });
});
