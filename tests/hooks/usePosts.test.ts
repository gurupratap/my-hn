/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { usePosts } from '../../hooks/usePosts';
import type { Post } from '../../domain/models';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

const createMockPost = (id: number): Post => ({
  id,
  title: `Test Post ${id}`,
  author: `user${id}`,
  points: 100 - id * 10,
  commentCount: 10 - id,
  commentIds: [],
  createdAt: new Date(`2024-01-0${id}T00:00:00.000Z`),
});

const mockInitialPosts: Post[] = [createMockPost(1), createMockPost(2)];

describe('usePosts', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('initializes with provided initialPosts', () => {
    const { result } = renderHook(() =>
      usePosts({ initialPosts: mockInitialPosts, sort: 'top' })
    );

    expect(result.current.posts).toEqual(mockInitialPosts);
    expect(result.current.loading).toBe(false);
    expect(result.current.hasMore).toBe(false); // 2 posts < 30 pageSize
  });

  it('sets hasMore to true when initialPosts length equals pageSize', () => {
    const { result } = renderHook(() =>
      usePosts({ initialPosts: mockInitialPosts, sort: 'top', pageSize: 2 })
    );

    expect(result.current.hasMore).toBe(true);
  });

  it('loadMore fetches and appends posts', async () => {
    const page2Posts = [
      { ...createMockPost(3), createdAt: '2024-01-03T00:00:00.000Z' },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => page2Posts,
    });

    const { result } = renderHook(() =>
      usePosts({ initialPosts: mockInitialPosts, sort: 'top', pageSize: 2 })
    );

    expect(result.current.posts).toHaveLength(2);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.posts).toHaveLength(3);
    expect(result.current.posts[2].id).toBe(3);
  });

  it('loadMore uses correct URL parameters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    // pageSize must equal initialPosts length for hasMore to be true
    const { result } = renderHook(() =>
      usePosts({ initialPosts: mockInitialPosts, sort: 'new', pageSize: 2 })
    );

    await act(async () => {
      await result.current.loadMore();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/posts?sort=new&page=2&pageSize=2');
  });

  it('loadMore converts date strings to Date objects', async () => {
    const page2Posts = [
      { ...createMockPost(3), createdAt: '2024-01-03T00:00:00.000Z' },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => page2Posts,
    });

    // pageSize must equal initialPosts length for hasMore to be true
    const { result } = renderHook(() =>
      usePosts({ initialPosts: mockInitialPosts, sort: 'top', pageSize: 2 })
    );

    await act(async () => {
      await result.current.loadMore();
    });

    // Check that the newly loaded post has Date object
    expect(result.current.posts[2].createdAt instanceof Date).toBe(true);
  });

  it('loadMore deduplicates posts by ID', async () => {
    // Return a post with same ID as existing post
    const duplicatePosts = [
      { ...createMockPost(1), createdAt: '2024-01-01T00:00:00.000Z' },
      { ...createMockPost(3), createdAt: '2024-01-03T00:00:00.000Z' },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => duplicatePosts,
    });

    const { result } = renderHook(() =>
      usePosts({ initialPosts: mockInitialPosts, sort: 'top', pageSize: 2 })
    );

    await act(async () => {
      await result.current.loadMore();
    });

    // Should only add post 3, not duplicate post 1
    expect(result.current.posts).toHaveLength(3);
    expect(result.current.posts.map((p) => p.id)).toEqual([1, 2, 3]);
  });

  it('loadMore does nothing when already loading', async () => {
    mockFetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    const { result } = renderHook(() =>
      usePosts({ initialPosts: mockInitialPosts, sort: 'top', pageSize: 2 })
    );

    // Start first loadMore
    act(() => {
      result.current.loadMore();
    });

    // Try to call again while loading
    act(() => {
      result.current.loadMore();
    });

    // Should only have called fetch once
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('loadMore does nothing when hasMore is false', async () => {
    const { result } = renderHook(() =>
      usePosts({ initialPosts: mockInitialPosts, sort: 'top', pageSize: 30 })
    );

    // hasMore should be false (2 posts < 30 pageSize)
    expect(result.current.hasMore).toBe(false);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('resets state when sort changes', () => {
    const newPosts = [createMockPost(5), createMockPost(6)];

    const { result, rerender } = renderHook(
      ({ initialPosts, sort }) => usePosts({ initialPosts, sort, pageSize: 2 }),
      { initialProps: { initialPosts: mockInitialPosts, sort: 'top' as const } }
    );

    expect(result.current.posts.map((p) => p.id)).toEqual([1, 2]);

    // Simulate navigation with new sort and new posts
    rerender({ initialPosts: newPosts, sort: 'new' as const });

    expect(result.current.posts.map((p) => p.id)).toEqual([5, 6]);
  });

  it('sets hasMore to false when loadMore returns fewer posts than pageSize', async () => {
    const partialPage = [
      { ...createMockPost(3), createdAt: '2024-01-03T00:00:00.000Z' },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => partialPage,
    });

    const { result } = renderHook(() =>
      usePosts({ initialPosts: mockInitialPosts, sort: 'top', pageSize: 2 })
    );

    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.hasMore).toBe(false);
  });
});
