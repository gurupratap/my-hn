/**
 * @jest-environment node
 */

import { server } from '../../mocks/server';
import { getCommentsByPostId, getComments } from '../../services/commentsService';
import { NotFoundError } from '../../lib/errors';

// Mock logger to keep test output clean
jest.mock('../../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

describe('commentsService', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('getCommentsByPostId', () => {
    it('returns comments for a post', async () => {
      // Post 1 has comments [101, 102, 103]
      const comments = await getCommentsByPostId(1);

      expect(Array.isArray(comments)).toBe(true);
      expect(comments.length).toBe(3);
    });

    it('returns comments with correct structure', async () => {
      const comments = await getCommentsByPostId(1);
      const comment = comments[0];

      expect(comment).toHaveProperty('id');
      expect(comment).toHaveProperty('author');
      expect(comment).toHaveProperty('text');
      expect(comment).toHaveProperty('createdAt');
      expect(comment).toHaveProperty('parentId');
      expect(comment).toHaveProperty('children');
      expect(comment.createdAt instanceof Date).toBe(true);
    });

    it('builds nested comment tree correctly', async () => {
      // Post 1, comment 101 has kids [201, 202]
      const comments = await getCommentsByPostId(1);
      const comment101 = comments.find((c) => c.id === 101);

      expect(comment101).toBeDefined();
      expect(comment101!.children.length).toBe(2);
      expect(comment101!.children[0].id).toBe(201);
      expect(comment101!.children[1].id).toBe(202);
    });

    it('builds multi-level nested tree', async () => {
      // Post 1, comment 102 has kid [203]
      const comments = await getCommentsByPostId(1);
      const comment102 = comments.find((c) => c.id === 102);

      expect(comment102).toBeDefined();
      expect(comment102!.children.length).toBe(1);
      expect(comment102!.children[0].id).toBe(203);
    });

    it('returns empty array for post with no comments', async () => {
      // Post 6 (job post) has no comments
      const comments = await getCommentsByPostId(6);

      expect(comments).toEqual([]);
    });

    it('throws NotFoundError for non-existent post', async () => {
      await expect(getCommentsByPostId(999999)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('limits recursion depth when maxDepth is 1', async () => {
      const comments = await getCommentsByPostId(1, 1);

      // Should have top-level comments but no children fetched
      expect(comments.length).toBe(3);
      // Children arrays should be empty due to depth limit
      comments.forEach((comment) => {
        expect(comment.children).toEqual([]);
      });
    });

    it('limits recursion depth when maxDepth is 2', async () => {
      const comments = await getCommentsByPostId(1, 2);

      // Should have top-level comments
      expect(comments.length).toBe(3);

      // Comment 101 should have children at depth 2
      const comment101 = comments.find((c) => c.id === 101);
      expect(comment101).toBeDefined();
      expect(comment101!.children.length).toBe(2);

      // But those children shouldn't have their children fetched (depth 3)
      comment101!.children.forEach((child) => {
        expect(child.children).toEqual([]);
      });
    });

    it('uses default maxDepth of 3', async () => {
      const comments = await getCommentsByPostId(1);

      // Should fetch up to 3 levels deep
      const comment101 = comments.find((c) => c.id === 101);
      expect(comment101).toBeDefined();
      expect(comment101!.children.length).toBeGreaterThan(0);
    });

    it('handles missing comments gracefully', async () => {
      // This should not throw even if some comment IDs don't exist
      // The service should skip missing comments
      const comments = await getCommentsByPostId(1);

      // Should still return valid comments
      expect(Array.isArray(comments)).toBe(true);
      expect(comments.length).toBeGreaterThan(0);
    });
  });

  describe('getComments', () => {
    it('works with params object', async () => {
      const comments = await getComments({ postId: 1 });

      expect(Array.isArray(comments)).toBe(true);
      expect(comments.length).toBe(3);
    });

    it('respects maxDepth param', async () => {
      const comments = await getComments({ postId: 1, maxDepth: 1 });

      expect(comments.length).toBe(3);
      comments.forEach((comment) => {
        expect(comment.children).toEqual([]);
      });
    });
  });
});
