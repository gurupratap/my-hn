/**
 * @jest-environment node
 */

import { server } from '../../mocks/server';
import { errorHandlers, HN_API_BASE, HN_API_BASE_URL } from '../../mocks/handlers';
import { hackerNewsAdapter, mapHNCommentToComment, mapHNPostToPost } from '../../adapters/hackerNewsAdapter';
import { GatewayError, NotFoundError, TimeoutError } from '../../lib/errors';

// Mock logger to keep test output clean and allow assertions if needed
jest.mock('../../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

describe('hackerNewsAdapter', () => {
  const originalEnv = process.env;

  beforeAll(() => server.listen());

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_API_BASE_URL = HN_API_BASE_URL;
    process.env.API_TIMEOUT_MS = '10000';
    process.env.API_RETRY_COUNT = '2';
  });

  afterEach(() => {
    server.resetHandlers();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    server.close();
    process.env = originalEnv;
  });

  it('mapHNPostToPost maps all fields correctly', () => {
    const hnItem = {
      id: 123,
      type: 'story',
      by: 'alice',
      time: 1700000000,
      title: 'Hello',
      url: 'https://example.com',
      text: 'Some text',
      score: 10,
      descendants: 5,
      kids: [1, 2, 3],
      deleted: false,
      dead: false,
    };

    const post = mapHNPostToPost(hnItem);

    expect(post.id).toBe(123);
    expect(post.type).toBe('story');
    expect(post.title).toBe('Hello');
    expect(post.url).toBe('https://example.com');
    expect(post.text).toBe('Some text');
    expect(post.author).toBe('alice');
    expect(post.points).toBe(10);
    expect(post.commentCount).toBe(5);
    expect(post.commentIds).toEqual([1, 2, 3]);
    expect(post.createdAt).toEqual(new Date(1700000000 * 1000));
    expect(post.deleted).toBe(false);
    expect(post.dead).toBe(false);
  });

  it('mapHNCommentToComment maps all fields correctly', () => {
    const hnItem = {
      id: 200,
      type: 'comment',
      by: 'bob',
      time: 1700000100,
      text: 'A comment',
      parent: 123,
      kids: [201, 202],
      deleted: true,
      dead: false,
    };

    const comment = mapHNCommentToComment(hnItem);

    expect(comment.id).toBe(200);
    expect(comment.author).toBe('bob');
    expect(comment.text).toBe('A comment');
    expect(comment.createdAt).toEqual(new Date(1700000100 * 1000));
    expect(comment.parentId).toBe(123);
    expect(comment.commentIds).toEqual([201, 202]);
    expect(comment.children).toEqual([]);
    expect(comment.deleted).toBe(true);
    expect(comment.dead).toBe(false);
  });

  it('getTopPostIds returns array of numbers', async () => {
    const ids = await hackerNewsAdapter.getTopPostIds();
    expect(Array.isArray(ids)).toBe(true);
    expect(ids.length).toBeGreaterThan(0);
    expect(typeof ids[0]).toBe('number');
  });

  it('getPostById returns valid Post', async () => {
    const post = await hackerNewsAdapter.getPostById(1);

    expect(post.id).toBe(1);
    expect(typeof post.title).toBe('string');
    expect(post.createdAt instanceof Date).toBe(true);
  });

  it('getPostById throws NotFoundError for 404', async () => {
    server.use(errorHandlers.notFound);

    await expect(hackerNewsAdapter.getPostById(999999)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('Adapter retries on 500 then throws GatewayError', async () => {
    server.use(errorHandlers.serverError);

    await expect(hackerNewsAdapter.getPostById(1)).rejects.toBeInstanceOf(GatewayError);
  });

  it('Timeout triggers TimeoutError', async () => {
    // Force a very small timeout and delay the response beyond it.
    process.env.API_TIMEOUT_MS = '5';

    server.use(
      // Delay for 50ms so AbortController should fire first
      require('msw').http.get(
        `${HN_API_BASE}/topstories.json`,
        async () => {
          await new Promise((r) => setTimeout(r, 50));
          return require('msw').HttpResponse.json([1, 2, 3]);
        }
      )
    );

    // Import fresh to pick up modified env timeout
    jest.resetModules();
    const { hackerNewsAdapter: freshAdapter } = require('../../adapters/hackerNewsAdapter');

    await expect(freshAdapter.getTopPostIds()).rejects.toBeInstanceOf(TimeoutError);
  });

  it('getNewPostIds returns array of numbers', async () => {
    const ids = await hackerNewsAdapter.getNewPostIds();
    expect(Array.isArray(ids)).toBe(true);
    expect(ids.length).toBeGreaterThan(0);
    expect(typeof ids[0]).toBe('number');
  });

  it('getBestPostIds returns array of numbers', async () => {
    const ids = await hackerNewsAdapter.getBestPostIds();
    expect(Array.isArray(ids)).toBe(true);
    expect(ids.length).toBeGreaterThan(0);
    expect(typeof ids[0]).toBe('number');
  });

  it('getPostsByIds returns array of Posts', async () => {
    const ids = [1, 2, 3];
    const posts = await hackerNewsAdapter.getPostsByIds(ids);

    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBe(3);
    expect(posts[0].id).toBe(1);
    expect(posts[1].id).toBe(2);
    expect(posts[2].id).toBe(3);
    posts.forEach((post) => {
      expect(typeof post.title).toBe('string');
      expect(post.createdAt instanceof Date).toBe(true);
    });
  });

  it('getPostsByIds returns empty array for empty input', async () => {
    const posts = await hackerNewsAdapter.getPostsByIds([]);
    expect(posts).toEqual([]);
  });

  it('getCommentById returns valid Comment', async () => {
    const comment = await hackerNewsAdapter.getCommentById(101);

    expect(comment.id).toBe(101);
    expect(comment.author).toBe('commenter1');
    expect(typeof comment.text).toBe('string');
    expect(comment.createdAt instanceof Date).toBe(true);
    expect(comment.parentId).toBe(1);
  });

  it('getCommentById throws NotFoundError for missing comment', async () => {
    await expect(hackerNewsAdapter.getCommentById(999999)).rejects.toBeInstanceOf(NotFoundError);
  });
});
