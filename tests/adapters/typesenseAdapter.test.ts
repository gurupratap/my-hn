/**
 * @jest-environment node
 */

/**
 * Tests for Typesense Adapter
 */

import type { Post } from '../../domain/models';

// Mock server-only (it throws when imported in client environment)
jest.mock('server-only', () => ({}));

// Mock the typesense module
const mockHealthRetrieve = jest.fn();
const mockCollectionRetrieve = jest.fn();
const mockCollectionCreate = jest.fn();
const mockDocumentsSearch = jest.fn();
const mockDocumentsImport = jest.fn();

jest.mock('typesense', () => {
  return {
    __esModule: true,
    default: {
      Client: jest.fn().mockImplementation(() => ({
        health: {
          retrieve: mockHealthRetrieve,
        },
        collections: jest.fn().mockImplementation((name?: string) => {
          if (name) {
            return {
              retrieve: mockCollectionRetrieve,
              documents: jest.fn().mockReturnValue({
                search: mockDocumentsSearch,
                import: mockDocumentsImport,
              }),
            };
          }
          return {
            create: mockCollectionCreate,
          };
        }),
      })),
    },
    Client: jest.fn(),
  };
});

// Mock logger
jest.mock('../../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

// Default config mock with both API keys
jest.mock('../../lib/config', () => ({
  TYPESENSE_HOST: 'localhost',
  TYPESENSE_PORT: 8108,
  TYPESENSE_PROTOCOL: 'http',
  TYPESENSE_ADMIN_API_KEY: 'test-admin-key',
  TYPESENSE_SEARCH_API_KEY: 'test-search-key',
  TYPESENSE_COLLECTION: 'posts',
}));

describe('typesenseAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isTypesenseConfigured', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('returns true when both API keys are configured', () => {
      const { isTypesenseConfigured } = require('../../adapters/typesenseAdapter');
      expect(isTypesenseConfigured()).toBe(true);
    });

    it('returns false when admin API key is missing', () => {
      jest.doMock('../../lib/config', () => ({
        TYPESENSE_HOST: 'localhost',
        TYPESENSE_PORT: 8108,
        TYPESENSE_PROTOCOL: 'http',
        TYPESENSE_ADMIN_API_KEY: undefined,
        TYPESENSE_SEARCH_API_KEY: 'test-search-key',
        TYPESENSE_COLLECTION: 'posts',
      }));

      jest.resetModules();
      const { isTypesenseConfigured } = require('../../adapters/typesenseAdapter');
      expect(isTypesenseConfigured()).toBe(false);
    });

    it('returns false when search API key is missing', () => {
      jest.doMock('../../lib/config', () => ({
        TYPESENSE_HOST: 'localhost',
        TYPESENSE_PORT: 8108,
        TYPESENSE_PROTOCOL: 'http',
        TYPESENSE_ADMIN_API_KEY: 'test-admin-key',
        TYPESENSE_SEARCH_API_KEY: undefined,
        TYPESENSE_COLLECTION: 'posts',
      }));

      jest.resetModules();
      const { isTypesenseConfigured } = require('../../adapters/typesenseAdapter');
      expect(isTypesenseConfigured()).toBe(false);
    });
  });

  describe('getTypesenseAdminClient', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('returns a client when admin API key is configured', () => {
      const { getTypesenseAdminClient } = require('../../adapters/typesenseAdapter');
      const client = getTypesenseAdminClient();
      expect(client).not.toBeNull();
    });

    it('returns the same singleton instance on multiple calls', () => {
      const { getTypesenseAdminClient } = require('../../adapters/typesenseAdapter');
      const client1 = getTypesenseAdminClient();
      const client2 = getTypesenseAdminClient();
      expect(client1).toBe(client2);
    });

    it('returns null when admin API key is not configured', () => {
      jest.doMock('../../lib/config', () => ({
        TYPESENSE_HOST: 'localhost',
        TYPESENSE_PORT: 8108,
        TYPESENSE_PROTOCOL: 'http',
        TYPESENSE_ADMIN_API_KEY: undefined,
        TYPESENSE_SEARCH_API_KEY: 'test-search-key',
        TYPESENSE_COLLECTION: 'posts',
      }));

      jest.resetModules();
      const { getTypesenseAdminClient } = require('../../adapters/typesenseAdapter');
      expect(getTypesenseAdminClient()).toBeNull();
    });
  });

  describe('getTypesenseSearchClient', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('returns a client when search API key is configured', () => {
      const { getTypesenseSearchClient } = require('../../adapters/typesenseAdapter');
      const client = getTypesenseSearchClient();
      expect(client).not.toBeNull();
    });

    it('returns the same singleton instance on multiple calls', () => {
      const { getTypesenseSearchClient } = require('../../adapters/typesenseAdapter');
      const client1 = getTypesenseSearchClient();
      const client2 = getTypesenseSearchClient();
      expect(client1).toBe(client2);
    });

    it('returns null when search API key is not configured', () => {
      jest.doMock('../../lib/config', () => ({
        TYPESENSE_HOST: 'localhost',
        TYPESENSE_PORT: 8108,
        TYPESENSE_PROTOCOL: 'http',
        TYPESENSE_ADMIN_API_KEY: 'test-admin-key',
        TYPESENSE_SEARCH_API_KEY: undefined,
        TYPESENSE_COLLECTION: 'posts',
      }));

      jest.resetModules();
      const { getTypesenseSearchClient } = require('../../adapters/typesenseAdapter');
      expect(getTypesenseSearchClient()).toBeNull();
    });
  });

  describe('postToTypesenseDoc', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('maps a Post to TypesensePost correctly', () => {
      const { postToTypesenseDoc } = require('../../adapters/typesenseAdapter');

      const post: Post = {
        id: 123,
        type: 'story',
        title: 'Test Post',
        url: 'https://example.com',
        text: 'Some content',
        author: 'testuser',
        points: 100,
        commentCount: 50,
        commentIds: [1, 2, 3],
        createdAt: new Date('2024-01-01T12:00:00Z'),
      };

      const doc = postToTypesenseDoc(post);

      expect(doc.id).toBe('123');
      expect(doc.type).toBe('story');
      expect(doc.title).toBe('Test Post');
      expect(doc.url).toBe('https://example.com');
      expect(doc.text).toBe('Some content');
      expect(doc.author).toBe('testuser');
      expect(doc.points).toBe(100);
      expect(doc.commentCount).toBe(50);
      expect(doc.createdAt).toBe(Math.floor(new Date('2024-01-01T12:00:00Z').getTime() / 1000));
    });

    it('handles optional fields', () => {
      const { postToTypesenseDoc } = require('../../adapters/typesenseAdapter');

      const post: Post = {
        id: 456,
        type: 'story',
        title: 'Text Post',
        author: 'testuser',
        points: 50,
        commentCount: 10,
        commentIds: [],
        createdAt: new Date('2024-01-01T12:00:00Z'),
      };

      const doc = postToTypesenseDoc(post);

      expect(doc.id).toBe('456');
      expect(doc.url).toBeUndefined();
      expect(doc.text).toBeUndefined();
    });
  });

  describe('typesenseDocToPost', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('maps a TypesensePost back to Post correctly', () => {
      const { typesenseDocToPost } = require('../../adapters/typesenseAdapter');

      const doc = {
        id: '123',
        type: 'story',
        title: 'Test Post',
        url: 'https://example.com',
        text: 'Some content',
        author: 'testuser',
        points: 100,
        commentCount: 50,
        createdAt: 1704110400, // 2024-01-01T12:00:00Z
      };

      const post = typesenseDocToPost(doc);

      expect(post.id).toBe(123);
      expect(post.type).toBe('story');
      expect(post.title).toBe('Test Post');
      expect(post.url).toBe('https://example.com');
      expect(post.text).toBe('Some content');
      expect(post.author).toBe('testuser');
      expect(post.points).toBe(100);
      expect(post.commentCount).toBe(50);
      expect(post.commentIds).toEqual([]);
      expect(post.createdAt).toEqual(new Date(1704110400 * 1000));
    });
  });

  describe('ensureCollection', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('does not create collection if it already exists', async () => {
      mockCollectionRetrieve.mockResolvedValueOnce({ name: 'posts' });

      const { ensureCollection } = require('../../adapters/typesenseAdapter');
      await ensureCollection();

      expect(mockCollectionRetrieve).toHaveBeenCalled();
      expect(mockCollectionCreate).not.toHaveBeenCalled();
    });

    it('creates collection if it does not exist', async () => {
      mockCollectionRetrieve.mockRejectedValueOnce({ httpStatus: 404 });
      mockCollectionCreate.mockResolvedValueOnce({ name: 'posts' });

      const { ensureCollection } = require('../../adapters/typesenseAdapter');
      await ensureCollection();

      expect(mockCollectionRetrieve).toHaveBeenCalled();
      expect(mockCollectionCreate).toHaveBeenCalled();
    });

    it('throws error for non-404 errors', async () => {
      mockCollectionRetrieve.mockRejectedValueOnce({ httpStatus: 500, message: 'Server error' });

      const { ensureCollection } = require('../../adapters/typesenseAdapter');
      await expect(ensureCollection()).rejects.toEqual({ httpStatus: 500, message: 'Server error' });
    });

    it('throws error when admin API key is not configured', async () => {
      jest.doMock('../../lib/config', () => ({
        TYPESENSE_HOST: 'localhost',
        TYPESENSE_PORT: 8108,
        TYPESENSE_PROTOCOL: 'http',
        TYPESENSE_ADMIN_API_KEY: undefined,
        TYPESENSE_SEARCH_API_KEY: 'test-search-key',
        TYPESENSE_COLLECTION: 'posts',
      }));

      jest.resetModules();
      const { ensureCollection } = require('../../adapters/typesenseAdapter');
      await expect(ensureCollection()).rejects.toThrow('Typesense admin API key is not configured');
    });
  });

  describe('indexPosts', () => {
    beforeEach(() => {
      jest.resetModules();
      // Re-establish default config mock after module reset
      jest.doMock('../../lib/config', () => ({
        TYPESENSE_HOST: 'localhost',
        TYPESENSE_PORT: 8108,
        TYPESENSE_PROTOCOL: 'http',
        TYPESENSE_ADMIN_API_KEY: 'test-admin-key',
        TYPESENSE_SEARCH_API_KEY: 'test-search-key',
        TYPESENSE_COLLECTION: 'posts',
      }));
    });

    it('indexes valid posts successfully', async () => {
      mockDocumentsImport.mockResolvedValueOnce([
        { success: true },
        { success: true },
      ]);

      const { indexPosts } = require('../../adapters/typesenseAdapter');

      const posts: Post[] = [
        {
          id: 1,
          type: 'story',
          title: 'Post 1',
          author: 'user1',
          points: 10,
          commentCount: 5,
          commentIds: [],
          createdAt: new Date(),
        },
        {
          id: 2,
          type: 'story',
          title: 'Post 2',
          author: 'user2',
          points: 20,
          commentCount: 10,
          commentIds: [],
          createdAt: new Date(),
        },
      ];

      const count = await indexPosts(posts);

      expect(count).toBe(2);
      expect(mockDocumentsImport).toHaveBeenCalledWith(
        expect.any(Array),
        { action: 'upsert' }
      );
    });

    it('filters out deleted posts', async () => {
      mockDocumentsImport.mockResolvedValueOnce([{ success: true }]);

      const { indexPosts } = require('../../adapters/typesenseAdapter');

      const posts: Post[] = [
        {
          id: 1,
          type: 'story',
          title: 'Valid Post',
          author: 'user1',
          points: 10,
          commentCount: 5,
          commentIds: [],
          createdAt: new Date(),
          deleted: false,
        },
        {
          id: 2,
          type: 'story',
          title: 'Deleted Post',
          author: 'user2',
          points: 20,
          commentCount: 10,
          commentIds: [],
          createdAt: new Date(),
          deleted: true,
        },
      ];

      await indexPosts(posts);

      expect(mockDocumentsImport).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: '1' })]),
        { action: 'upsert' }
      );
    });

    it('filters out dead posts', async () => {
      mockDocumentsImport.mockResolvedValueOnce([{ success: true }]);

      const { indexPosts } = require('../../adapters/typesenseAdapter');

      const posts: Post[] = [
        {
          id: 1,
          type: 'story',
          title: 'Valid Post',
          author: 'user1',
          points: 10,
          commentCount: 5,
          commentIds: [],
          createdAt: new Date(),
          dead: false,
        },
        {
          id: 2,
          type: 'story',
          title: 'Dead Post',
          author: 'user2',
          points: 20,
          commentCount: 10,
          commentIds: [],
          createdAt: new Date(),
          dead: true,
        },
      ];

      await indexPosts(posts);

      expect(mockDocumentsImport).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: '1' })]),
        { action: 'upsert' }
      );
    });

    it('filters out posts without titles', async () => {
      mockDocumentsImport.mockResolvedValueOnce([{ success: true }]);

      const { indexPosts } = require('../../adapters/typesenseAdapter');

      const posts: Post[] = [
        {
          id: 1,
          type: 'story',
          title: 'Valid Post',
          author: 'user1',
          points: 10,
          commentCount: 5,
          commentIds: [],
          createdAt: new Date(),
        },
        {
          id: 2,
          type: 'story',
          title: '',
          author: 'user2',
          points: 20,
          commentCount: 10,
          commentIds: [],
          createdAt: new Date(),
        },
      ];

      await indexPosts(posts);

      expect(mockDocumentsImport).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: '1' })]),
        { action: 'upsert' }
      );
    });

    it('returns 0 when all posts are filtered out', async () => {
      const { indexPosts } = require('../../adapters/typesenseAdapter');

      const posts: Post[] = [
        {
          id: 1,
          type: 'story',
          title: 'Deleted Post',
          author: 'user1',
          points: 10,
          commentCount: 5,
          commentIds: [],
          createdAt: new Date(),
          deleted: true,
        },
      ];

      const count = await indexPosts(posts);

      expect(count).toBe(0);
      expect(mockDocumentsImport).not.toHaveBeenCalled();
    });

    it('returns correct count when some imports fail', async () => {
      mockDocumentsImport.mockResolvedValueOnce([
        { success: true },
        { success: false, error: 'Bad document' },
        { success: true },
      ]);

      const { indexPosts } = require('../../adapters/typesenseAdapter');

      const posts: Post[] = [
        { id: 1, type: 'story', title: 'Post 1', author: 'user1', points: 10, commentCount: 5, commentIds: [], createdAt: new Date() },
        { id: 2, type: 'story', title: 'Post 2', author: 'user2', points: 20, commentCount: 10, commentIds: [], createdAt: new Date() },
        { id: 3, type: 'story', title: 'Post 3', author: 'user3', points: 30, commentCount: 15, commentIds: [], createdAt: new Date() },
      ];

      const count = await indexPosts(posts);

      expect(count).toBe(2);
    });

    it('throws error when admin API key is not configured', async () => {
      jest.doMock('../../lib/config', () => ({
        TYPESENSE_HOST: 'localhost',
        TYPESENSE_PORT: 8108,
        TYPESENSE_PROTOCOL: 'http',
        TYPESENSE_ADMIN_API_KEY: undefined,
        TYPESENSE_SEARCH_API_KEY: 'test-search-key',
        TYPESENSE_COLLECTION: 'posts',
      }));

      jest.resetModules();
      const { indexPosts } = require('../../adapters/typesenseAdapter');

      const posts: Post[] = [
        { id: 1, type: 'story', title: 'Post 1', author: 'user1', points: 10, commentCount: 5, commentIds: [], createdAt: new Date() },
      ];

      await expect(indexPosts(posts)).rejects.toThrow('Typesense admin API key is not configured');
    });
  });
});
