/**
 * @jest-environment node
 */

import { server } from '../../mocks/server';
import { fetchPosts, getPostById, type SortType } from '../../services/postsService';
import { NotFoundError } from '../../lib/errors';
import { mockTopStoryIds, mockNewStoryIds, mockBestStoryIds } from '../../mocks/data/posts';

// Mock logger to keep test output clean
jest.mock('../../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

describe('postsService', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('fetchPosts', () => {
    it('fetches top posts by default', async () => {
      const posts = await fetchPosts();

      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBeGreaterThan(0);
      // First post should match first ID in top stories
      expect(posts[0].id).toBe(mockTopStoryIds[0]);
    });

    it('fetches top posts when sort is "top"', async () => {
      const posts = await fetchPosts({ sort: 'top' });

      expect(posts[0].id).toBe(mockTopStoryIds[0]);
    });

    it('fetches new posts when sort is "new"', async () => {
      const posts = await fetchPosts({ sort: 'new' });

      expect(posts[0].id).toBe(mockNewStoryIds[0]);
    });

    it('fetches best posts when sort is "best"', async () => {
      const posts = await fetchPosts({ sort: 'best' });

      expect(posts[0].id).toBe(mockBestStoryIds[0]);
    });

    it('returns correct page size', async () => {
      const pageSize = 3;
      const posts = await fetchPosts({ pageSize });

      expect(posts.length).toBe(pageSize);
    });

    it('returns correct slice for page 1', async () => {
      const pageSize = 3;
      const posts = await fetchPosts({ pageSize, page: 1 });

      expect(posts.length).toBe(pageSize);
      expect(posts[0].id).toBe(mockTopStoryIds[0]);
      expect(posts[1].id).toBe(mockTopStoryIds[1]);
      expect(posts[2].id).toBe(mockTopStoryIds[2]);
    });

    it('returns correct slice for page 2', async () => {
      const pageSize = 3;
      const posts = await fetchPosts({ pageSize, page: 2 });

      expect(posts.length).toBe(pageSize);
      expect(posts[0].id).toBe(mockTopStoryIds[3]);
      expect(posts[1].id).toBe(mockTopStoryIds[4]);
      expect(posts[2].id).toBe(mockTopStoryIds[5]);
    });

    it('returns empty array when page is beyond available posts', async () => {
      const posts = await fetchPosts({ pageSize: 30, page: 100 });

      expect(posts).toEqual([]);
    });

    it('returns partial results for last page', async () => {
      // Mock has 10 posts, requesting page 2 with pageSize 7 should return 3
      const posts = await fetchPosts({ pageSize: 7, page: 2 });

      expect(posts.length).toBe(3);
    });

    it('returns posts with correct domain model structure', async () => {
      const posts = await fetchPosts({ pageSize: 1 });
      const post = posts[0];

      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('type');
      expect(post).toHaveProperty('title');
      expect(post).toHaveProperty('author');
      expect(post).toHaveProperty('points');
      expect(post).toHaveProperty('commentCount');
      expect(post).toHaveProperty('commentIds');
      expect(post).toHaveProperty('createdAt');
      expect(post.createdAt instanceof Date).toBe(true);
    });

    it('uses default pageSize of 30', async () => {
      const posts = await fetchPosts();

      // Mock only has 10 posts, so we get all of them
      expect(posts.length).toBe(mockTopStoryIds.length);
    });
  });

  describe('getPostById', () => {
    it('returns a single post by ID', async () => {
      const post = await getPostById(1);

      expect(post.id).toBe(1);
      expect(typeof post.title).toBe('string');
      expect(typeof post.author).toBe('string');
    });

    it('returns post with correct domain model structure', async () => {
      const post = await getPostById(1);

      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('type');
      expect(post).toHaveProperty('title');
      expect(post).toHaveProperty('author');
      expect(post).toHaveProperty('points');
      expect(post).toHaveProperty('commentCount');
      expect(post).toHaveProperty('commentIds');
      expect(post).toHaveProperty('createdAt');
      expect(post.createdAt instanceof Date).toBe(true);
    });

    it('throws NotFoundError for non-existent post', async () => {
      await expect(getPostById(999999)).rejects.toBeInstanceOf(NotFoundError);
    });
  });
});
