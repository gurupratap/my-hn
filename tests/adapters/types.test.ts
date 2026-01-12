/**
 * @jest-environment node
 */

import { type Adapter } from '../../adapters/types';
import { type Comment, type Post } from '../../domain/models';

describe('Adapter interface', () => {
  it('can be implemented by a mock adapter', () => {
    const mockPost: Post = {
      id: 1,
      type: 'story',
      title: 'Test Post',
      author: 'testuser',
      points: 100,
      commentCount: 10,
      commentIds: [101, 102],
      createdAt: new Date(),
    };

    const mockComment: Comment = {
      id: 101,
      author: 'commenter',
      text: 'Test comment',
      createdAt: new Date(),
      parentId: 1,
      commentIds: [],
      children: [],
    };

    const mockAdapter: Adapter = {
      getTopPostIds: async () => [1, 2, 3],
      getNewPostIds: async () => [4, 5, 6],
      getBestPostIds: async () => [7, 8, 9],
      getPostById: async () => mockPost,
      getPostsByIds: async () => [mockPost],
      getCommentById: async () => mockComment,
    };

    expect(mockAdapter.getTopPostIds).toBeDefined();
    expect(mockAdapter.getNewPostIds).toBeDefined();
    expect(mockAdapter.getBestPostIds).toBeDefined();
    expect(mockAdapter.getPostById).toBeDefined();
    expect(mockAdapter.getPostsByIds).toBeDefined();
    expect(mockAdapter.getCommentById).toBeDefined();
  });

  it('mock adapter methods return expected types', async () => {
    const mockPost: Post = {
      id: 1,
      type: 'story',
      title: 'Test Post',
      author: 'testuser',
      points: 100,
      commentCount: 10,
      commentIds: [],
      createdAt: new Date(),
    };

    const mockComment: Comment = {
      id: 101,
      author: 'commenter',
      text: 'Test comment',
      createdAt: new Date(),
      parentId: 1,
      commentIds: [],
      children: [],
    };

    const mockAdapter: Adapter = {
      getTopPostIds: async () => [1, 2, 3],
      getNewPostIds: async () => [4, 5, 6],
      getBestPostIds: async () => [7, 8, 9],
      getPostById: async () => mockPost,
      getPostsByIds: async (ids) => ids.map(() => mockPost),
      getCommentById: async () => mockComment,
    };

    const topIds = await mockAdapter.getTopPostIds();
    expect(Array.isArray(topIds)).toBe(true);
    expect(topIds).toEqual([1, 2, 3]);

    const newIds = await mockAdapter.getNewPostIds();
    expect(Array.isArray(newIds)).toBe(true);

    const bestIds = await mockAdapter.getBestPostIds();
    expect(Array.isArray(bestIds)).toBe(true);

    const post = await mockAdapter.getPostById(1);
    expect(post.id).toBe(1);
    expect(post.type).toBe('story');

    const posts = await mockAdapter.getPostsByIds([1, 2]);
    expect(posts.length).toBe(2);

    const comment = await mockAdapter.getCommentById(101);
    expect(comment.id).toBe(101);
    expect(comment.parentId).toBe(1);
  });
});
