/**
 * @jest-environment node
 */

/**
 * Tests for Search Service
 */

// Mock the typesense adapter before importing the service
const mockIsTypesenseConfigured = jest.fn();
const mockGetTypesenseSearchClient = jest.fn();
const mockTypesenseDocToPost = jest.fn();

jest.mock('../../adapters/typesenseAdapter', () => ({
  isTypesenseConfigured: mockIsTypesenseConfigured,
  getTypesenseSearchClient: mockGetTypesenseSearchClient,
  typesenseDocToPost: mockTypesenseDocToPost,
}));

// Mock logger
jest.mock('../../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock config
jest.mock('../../lib/config', () => ({
  TYPESENSE_COLLECTION: 'posts',
}));

describe('searchService', () => {
  const mockHealthRetrieve = jest.fn();
  const mockSearch = jest.fn();
  const mockClient = {
    health: {
      retrieve: mockHealthRetrieve,
    },
    collections: jest.fn().mockReturnValue({
      documents: jest.fn().mockReturnValue({
        search: mockSearch,
      }),
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsTypesenseConfigured.mockReturnValue(true);
    mockGetTypesenseSearchClient.mockReturnValue(mockClient);
  });

  describe('isSearchAvailable', () => {
    it('returns false when Typesense is not configured', async () => {
      mockIsTypesenseConfigured.mockReturnValue(false);

      const { isSearchAvailable } = require('../../services/searchService');
      const result = await isSearchAvailable();

      expect(result).toBe(false);
    });

    it('returns false when search client is null', async () => {
      mockGetTypesenseSearchClient.mockReturnValue(null);

      const { isSearchAvailable } = require('../../services/searchService');
      const result = await isSearchAvailable();

      expect(result).toBe(false);
    });

    it('returns true when health check succeeds', async () => {
      mockHealthRetrieve.mockResolvedValueOnce({ ok: true });

      const { isSearchAvailable } = require('../../services/searchService');
      const result = await isSearchAvailable();

      expect(result).toBe(true);
      expect(mockHealthRetrieve).toHaveBeenCalled();
    });

    it('returns false when health check fails', async () => {
      mockHealthRetrieve.mockRejectedValueOnce(new Error('Connection failed'));

      const { isSearchAvailable } = require('../../services/searchService');
      const result = await isSearchAvailable();

      expect(result).toBe(false);
    });
  });

  describe('searchPosts', () => {
    const mockSearchResult = {
      found: 2,
      hits: [
        {
          document: {
            id: '1',
            type: 'story',
            title: 'First Post',
            author: 'user1',
            points: 100,
            commentCount: 50,
            createdAt: 1704110400,
          },
        },
        {
          document: {
            id: '2',
            type: 'story',
            title: 'Second Post',
            author: 'user2',
            points: 80,
            commentCount: 30,
            createdAt: 1704110400,
          },
        },
      ],
    };

    beforeEach(() => {
      mockTypesenseDocToPost.mockImplementation((doc) => ({
        id: parseInt(doc.id, 10),
        type: doc.type,
        title: doc.title,
        author: doc.author,
        points: doc.points,
        commentCount: doc.commentCount,
        commentIds: [],
        createdAt: new Date(doc.createdAt * 1000),
      }));
    });

    it('throws error when Typesense is not configured', async () => {
      mockIsTypesenseConfigured.mockReturnValue(false);

      const { searchPosts } = require('../../services/searchService');

      await expect(searchPosts({ query: 'test' })).rejects.toThrow('Search is not available');
    });

    it('throws error when search client is null', async () => {
      mockGetTypesenseSearchClient.mockReturnValue(null);

      const { searchPosts } = require('../../services/searchService');

      await expect(searchPosts({ query: 'test' })).rejects.toThrow('Search is not available');
    });

    it('returns search results with correct structure', async () => {
      mockSearch.mockResolvedValueOnce(mockSearchResult);

      const { searchPosts } = require('../../services/searchService');
      const result = await searchPosts({ query: 'test' });

      expect(result).toHaveProperty('posts');
      expect(result).toHaveProperty('totalFound');
      expect(result).toHaveProperty('searchTimeMs');
      expect(result.totalFound).toBe(2);
      expect(result.posts).toHaveLength(2);
    });

    it('uses default limit and page when not provided', async () => {
      mockSearch.mockResolvedValueOnce(mockSearchResult);

      const { searchPosts } = require('../../services/searchService');
      await searchPosts({ query: 'test' });

      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          q: 'test',
          per_page: 10,
          page: 1,
        })
      );
    });

    it('uses provided limit and page', async () => {
      mockSearch.mockResolvedValueOnce(mockSearchResult);

      const { searchPosts } = require('../../services/searchService');
      await searchPosts({ query: 'test', limit: 20, page: 2 });

      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          q: 'test',
          per_page: 20,
          page: 2,
        })
      );
    });

    it('searches by title, text, and author', async () => {
      mockSearch.mockResolvedValueOnce(mockSearchResult);

      const { searchPosts } = require('../../services/searchService');
      await searchPosts({ query: 'test' });

      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          query_by: 'title,text,author',
        })
      );
    });

    it('sorts by points descending then commentCount descending', async () => {
      mockSearch.mockResolvedValueOnce(mockSearchResult);

      const { searchPosts } = require('../../services/searchService');
      await searchPosts({ query: 'test' });

      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          sort_by: 'points:desc,commentCount:desc',
        })
      );
    });

    it('handles empty search results', async () => {
      mockSearch.mockResolvedValueOnce({
        found: 0,
        hits: [],
      });

      const { searchPosts } = require('../../services/searchService');
      const result = await searchPosts({ query: 'nonexistent' });

      expect(result.totalFound).toBe(0);
      expect(result.posts).toEqual([]);
    });

    it('handles null hits gracefully', async () => {
      mockSearch.mockResolvedValueOnce({
        found: 0,
        hits: null,
      });

      const { searchPosts } = require('../../services/searchService');
      const result = await searchPosts({ query: 'test' });

      expect(result.posts).toEqual([]);
    });

    it('filters out null posts from typesenseDocToPost', async () => {
      mockSearch.mockResolvedValueOnce({
        found: 2,
        hits: [
          { document: { id: '1', type: 'story', title: 'Valid', author: 'user', points: 10, commentCount: 5, createdAt: 1704110400 } },
          { document: { id: '2', type: 'story', title: 'Invalid', author: 'user', points: 10, commentCount: 5, createdAt: 1704110400 } },
        ],
      });

      // First call returns valid post, second returns null
      mockTypesenseDocToPost.mockReturnValueOnce({
        id: 1,
        type: 'story',
        title: 'Valid',
        author: 'user',
        points: 10,
        commentCount: 5,
        commentIds: [],
        createdAt: new Date(),
      });
      mockTypesenseDocToPost.mockReturnValueOnce(null);

      const { searchPosts } = require('../../services/searchService');
      const result = await searchPosts({ query: 'test' });

      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].id).toBe(1);
    });

    it('throws error when search fails', async () => {
      mockSearch.mockRejectedValueOnce(new Error('Search failed'));

      const { searchPosts } = require('../../services/searchService');

      await expect(searchPosts({ query: 'test' })).rejects.toThrow('Search failed');
    });

    it('returns searchTimeMs as a number', async () => {
      mockSearch.mockResolvedValueOnce(mockSearchResult);

      const { searchPosts } = require('../../services/searchService');
      const result = await searchPosts({ query: 'test' });

      expect(typeof result.searchTimeMs).toBe('number');
      expect(result.searchTimeMs).toBeGreaterThanOrEqual(0);
    });
  });
});
